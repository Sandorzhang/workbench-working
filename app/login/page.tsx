'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const VerificationCodeInput = ({ 
  value, 
  onChange, 
  length = 6 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  length?: number;
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  // 初始化refs数组
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);
  
  // 当单个数字输入框值变化时
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const target = e.target;
    let targetValue = target.value;
    
    // 确保只接受单个数字
    targetValue = targetValue.replace(/[^0-9]/g, '');
    
    if (targetValue.length > 1) {
      targetValue = targetValue[targetValue.length - 1];
    }
    
    // 创建新的验证码字符串
    const newCode = value.split('');
    newCode[index] = targetValue;
    const newCodeString = newCode.join('');
    
    // 调用父组件的onChange
    onChange(newCodeString);
    
    // 聚焦下一个输入框
    if (targetValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // 处理键盘事件（退格键等）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // 如果是退格键并且当前输入框是空的，焦点移到前一个
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // 从验证码字符串中提取每个字符
  const codeArray = value.padEnd(length, '').split('');
  
  return (
    <div className="flex gap-2 justify-between">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-xl"
          value={codeArray[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el: HTMLInputElement | null) => (inputRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>('password');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  const router = useRouter();
  const { login, loginWithCode, sendVerificationCode, isAuthenticated, isLoading, error } = useAuth();

  React.useEffect(() => {
    // 如果已认证，重定向到工作台
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 倒计时逻辑
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && codeSent) {
      // 倒计时结束
    }
  }, [countdown, codeSent]);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) return;
    await login(username, password);
  };

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11 || isLoading || countdown > 0) return;
    
    await sendVerificationCode(phone);
    setCodeSent(true);
    setCountdown(60); // 60秒倒计时
  };

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone || !verificationCode || verificationCode.length < 6) return;
    await loginWithCode(phone, verificationCode);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 左侧大图 */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-90" />
        <Image
          src="https://images.unsplash.com/photo-1627556704302-624286467c65?q=80&w=1887&auto=format&fit=crop"
          alt="教育背景"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <h1 className="text-4xl font-bold mb-4">教育管理平台</h1>
          <p className="text-xl max-w-md text-center">
            为教育工作者提供高效、便捷的管理工具，助力教育事业发展
          </p>
        </div>
      </div>
      
      {/* 右侧登录面板 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">账号登录</CardTitle>
            <CardDescription>
              请选择登录方式进入系统
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="password">用户名密码</TabsTrigger>
                <TabsTrigger value="code">手机验证码</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">密码</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中
                      </>
                    ) : '登录'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="code">
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                        placeholder="请输入手机号"
                        maxLength={11}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendCode}
                        disabled={isLoading || countdown > 0 || phone.length !== 11}
                        className="whitespace-nowrap"
                      >
                        {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">验证码</Label>
                    <VerificationCodeInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading || !codeSent || verificationCode.length < 6}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中
                      </>
                    ) : '登录'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>提示：管理员账号 admin / password123，教师账号 teacher / password123</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 