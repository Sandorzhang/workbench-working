'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound, Smartphone, ArrowRight, User, ShieldCheck, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

// 定义错误类型和消息映射
interface ErrorMapping {
  [key: string]: string;
}

// 错误映射表
const ERROR_MESSAGES: ErrorMapping = {
  'MissingTokenError': '登录认证失败，请检查网络或联系管理员',
  'TokenExpiredError': '登录已过期，请重新登录',
  'InvalidCredentialsError': '用户名或密码错误',
  'NetworkError': '网络连接异常，请检查网络设置',
  'ServerError': '服务器错误，请稍后重试',
  'TimeoutError': '请求超时，请稍后重试',
  'default': '登录失败，请稍后重试'
};

// 处理错误并返回友好消息
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // 检查错误名称
    if (ERROR_MESSAGES[error.name]) {
      return ERROR_MESSAGES[error.name];
    }
    
    // 检查错误消息内容关键词
    if (error.message.includes('网络')) {
      return ERROR_MESSAGES.NetworkError;
    } else if (error.message.includes('超时')) {
      return ERROR_MESSAGES.TimeoutError;
    } else if (error.message.includes('用户名') || error.message.includes('密码')) {
      return error.message; // 使用原始消息
    }
  }
  
  // 默认错误消息
  return ERROR_MESSAGES.default;
};

export default function LoginPage() {
  // 表单状态
  const [activeTab, setActiveTab] = useState<string>('password');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  
  // 验证码状态
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 防止重定向循环的标记
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(false);
  
  // Hooks
  const router = useRouter();
  const { 
    login, 
    loginWithCode, 
    sendVerificationCode, 
    isAuthenticated, 
    isLoading: authLoading, 
    error: authError, 
    user 
  } = useAuth();

  // 处理认证后的重定向
  useEffect(() => {
    // 避免在非客户端环境执行
    if (typeof window === 'undefined') return;
    
    // 如果重定向已在进行中，避免重复处理
    if (redirectInProgress) return;
    
    // 只在已登录、有用户信息、当前在登录页时执行跳转
    if (!authLoading && isAuthenticated && user && window.location.pathname === '/login') {
      // 设置重定向状态
      setRedirectInProgress(true);
      
      // 确定跳转目标
      const isSuperAdmin = String(user.role).toLowerCase() === 'superadmin';
      const targetPath = isSuperAdmin ? '/superadmin' : '/workbench';
      
      try {
        // 使用路由跳转
        router.replace(targetPath);
        
        // 显示成功消息
        toast.success(`登录成功，欢迎 ${user.name || ''}！`);
        
        // 添加后备跳转机制
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = targetPath;
          }
        }, 3000);
      } catch (error) {
        // 路由跳转失败，使用 window.location
        window.location.href = targetPath;
      }
    }
  }, [isAuthenticated, user, router, authLoading, redirectInProgress]);

  // 显示错误提示
  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 用户名密码登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!username || !password) {
      toast.error('请输入账号和密码');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 清除可能存在的旧token
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      // 执行登录
      await login(username, password);
      
      // 登录成功提示 (重定向由上面的useEffect处理)
      toast.success('登录成功，正在跳转...');
    } catch (error) {
      // 统一错误处理
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    // 表单验证
    if (!phone) {
      toast.error('请输入手机号码');
      return;
    }
    
    if (phone.length !== 11) {
      toast.error('请输入正确的手机号码格式');
      return;
    }
    
    if (isLoading || countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      await sendVerificationCode(phone);
      setCodeSent(true);
      setCountdown(60); // 60秒倒计时
      toast.success('验证码已发送，请注意查收');
    } catch (error) {
      // 统一错误处理
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 验证码登录提交
  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 如果验证码尚未发送，则触发发送验证码
    if (!codeSent) {
      if (phone.length === 11) {
        await handleSendCode();
      } else {
        toast.error('请输入正确的手机号码');
      }
      return;
    }
    
    // 验证码格式检查
    if (verificationCode.length !== 6) {
      toast.error('请输入6位验证码');
      return;
    }
    
    // 调用验证码登录
    setIsLoading(true);
    try {
      await loginWithCode(phone, verificationCode);
      // 登录成功提示 (重定向由上面的useEffect处理)
      toast.success('登录成功，正在跳转...');
    } catch (error) {
      // 统一错误处理
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 左侧大图 - 桌面端显示 */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-800/90" />
        <Image
          src="https://images.unsplash.com/photo-1627556704302-624286467c65?q=80&w=1887&auto=format&fit=crop"
          alt="教育背景"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl transform transition-all duration-500 hover:scale-105">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">教育管理平台</h1>
            <p className="text-xl max-w-md text-center text-white/90">
              为教育工作者提供高效、便捷的管理工具，助力教育事业发展
            </p>
          </div>
        </div>
      </div>
      
      {/* 右侧登录面板 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* 移动端标题 */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">教育管理平台</h1>
            <p className="mt-2 text-gray-600">登录以访问系统</p>
          </div>
          
          {/* 登录卡片 */}
          <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">欢迎回来</CardTitle>
                  <CardDescription className="pt-1 text-gray-600">
                    请选择登录方式进入系统
                  </CardDescription>
                </div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* 登录方式选项卡 */}
              <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-xl h-14">
                  <TabsTrigger 
                    value="password" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-xl transition-all duration-200 py-3 flex items-center justify-center"
                  >
                    <KeyRound className="h-5 w-5 mr-2" />
                    <span className="font-medium">用户名密码</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="code" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-xl transition-all duration-200 py-3 flex items-center justify-center"
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    <span className="font-medium">手机验证码</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* 用户名密码登录表单 */}
                <TabsContent value="password">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* 用户名输入 */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-500" />
                        用户名
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                    
                    {/* 密码输入 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-gray-500" />
                          密码
                        </Label>
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                          忘记密码?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                    
                    {/* 登录按钮 */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-4 font-medium transition-all bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg shadow-md hover:shadow-lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        <>
                          登录
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* 验证码登录表单 */}
                <TabsContent value="code">
                  <form onSubmit={handleCodeSubmit} className="space-y-5">
                    {/* 手机号输入 */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        手机号
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="请输入手机号"
                          maxLength={11}
                          required
                          className="flex-1 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendCode}
                          disabled={isLoading || countdown > 0 || phone.length !== 11}
                          className="whitespace-nowrap h-12 min-w-28 transition-all rounded-lg border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        >
                          {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* 验证码输入 */}
                    {codeSent && (
                      <div className="space-y-2 animate-fadeIn">
                        <Label htmlFor="code" className="text-sm font-medium flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-gray-500" />
                          验证码
                        </Label>
                        <div className="flex w-full">
                          <InputOTP
                            maxLength={6}
                            value={verificationCode}
                            onChange={setVerificationCode}
                            className="w-full"
                          >
                            <InputOTPGroup className="w-full grid grid-cols-6 gap-2 sm:gap-3">
                              {Array.from({ length: 6 }).map((_, index) => (
                                <InputOTPSlot 
                                  key={index} 
                                  index={index}
                                  className="rounded-lg aspect-square w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-lg font-medium" 
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                    )}
                    
                    {/* 登录/下一步按钮 */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-4 font-medium transition-all bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-lg shadow-md hover:shadow-lg"
                      disabled={isLoading || (codeSent && verificationCode.length < 6) || (!codeSent && phone.length !== 11)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        <>
                          {codeSent ? '验证并登录' : '下一步'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              {/* 底部链接 */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <span className="text-sm text-gray-500">没有账号? </span>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  联系管理员
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 全局类型扩展
declare global {
  interface Window {
    __LOGIN_REDIRECT_IN_PROGRESS__?: boolean;
  }
} 