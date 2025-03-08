'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// 导入测试函数
import { testLogin, testSendCode, testCodeLogin, runTests } from '@/test-login';

export default function LoginTestPage() {
  // 账号密码登录状态
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // 验证码登录状态
  const [phone, setPhone] = useState('13800138000');
  const [code, setCode] = useState('123456');
  const [isSending, setIsSending] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<any>(null);
  
  // 处理账号密码登录
  const handleLogin = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const loginResult = await testLogin(username, password);
      setResult(loginResult);
      
      if (loginResult.success) {
        toast.success('登录成功!');
      } else {
        toast.error(`登录失败: ${loginResult.error}`);
      }
    } catch (error) {
      console.error('登录测试失败:', error);
      setResult({ success: false, error: error instanceof Error ? error.message : '未知错误' });
      toast.error('登录测试失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理发送验证码
  const handleSendCode = async () => {
    setIsSending(true);
    setCodeResult(null);
    
    try {
      const sendResult = await testSendCode(phone);
      
      if (sendResult.success) {
        toast.success('验证码发送成功!');
        if (sendResult.code) {
          setCode(sendResult.code);
        }
      } else {
        toast.error(`验证码发送失败: ${sendResult.error}`);
      }
    } catch (error) {
      console.error('验证码发送测试失败:', error);
      toast.error('验证码发送测试失败');
    } finally {
      setIsSending(false);
    }
  };
  
  // 处理验证码登录
  const handleCodeLogin = async () => {
    setIsCodeLoading(true);
    setCodeResult(null);
    
    try {
      const loginResult = await testCodeLogin(phone, code);
      setCodeResult(loginResult);
      
      if (loginResult.success) {
        toast.success('验证码登录成功!');
      } else {
        toast.error(`验证码登录失败: ${loginResult.error}`);
      }
    } catch (error) {
      console.error('验证码登录测试失败:', error);
      setCodeResult({ success: false, error: error instanceof Error ? error.message : '未知错误' });
      toast.error('验证码登录测试失败');
    } finally {
      setIsCodeLoading(false);
    }
  };
  
  // 运行所有测试
  const handleRunAllTests = async () => {
    setIsLoading(true);
    setIsSending(true);
    setIsCodeLoading(true);
    setResult(null);
    setCodeResult(null);
    
    try {
      await runTests();
      toast.success('所有测试完成!');
    } catch (error) {
      console.error('测试运行失败:', error);
      toast.error('测试运行失败');
    } finally {
      setIsLoading(false);
      setIsSending(false);
      setIsCodeLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">登录功能测试</h1>
      <p className="text-gray-500 mb-8">
        这个页面用于测试登录功能是否正常工作，包括账号密码登录和验证码登录。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 账号密码登录测试 */}
        <Card>
          <CardHeader>
            <CardTitle>账号密码登录测试</CardTitle>
            <CardDescription>
              测试账号密码登录功能是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || !username || !password}
                className="w-full"
              >
                {isLoading ? '登录中...' : '测试登录'}
              </Button>
            </div>
            
            {result && (
              <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '登录成功' : '登录失败'}
                </h3>
                {result.success ? (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>用户名: {result.data.user.username}</p>
                    <p>姓名: {result.data.user.name}</p>
                    <p>角色: {result.data.user.role}</p>
                    <p>Token: {result.data.accessToken.substring(0, 15)}...</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-600">{result.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 验证码登录测试 */}
        <Card>
          <CardHeader>
            <CardTitle>验证码登录测试</CardTitle>
            <CardDescription>
              测试手机验证码登录功能是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendCode} 
                  disabled={isSending || !phone || phone.length !== 11}
                  variant="outline"
                >
                  {isSending ? '发送中...' : '发送验证码'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleCodeLogin} 
                disabled={isCodeLoading || !phone || !code}
                className="w-full"
              >
                {isCodeLoading ? '登录中...' : '测试验证码登录'}
              </Button>
            </div>
            
            {codeResult && (
              <div className={`mt-4 p-4 rounded-md ${codeResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium ${codeResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {codeResult.success ? '登录成功' : '登录失败'}
                </h3>
                {codeResult.success ? (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>用户名: {codeResult.data.user.username}</p>
                    <p>姓名: {codeResult.data.user.name}</p>
                    <p>角色: {codeResult.data.user.role}</p>
                    <p>Token: {codeResult.data.accessToken.substring(0, 15)}...</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-600">{codeResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>运行所有测试</CardTitle>
            <CardDescription>
              自动运行所有登录测试，结果将在控制台显示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunAllTests} 
              disabled={isLoading || isSending || isCodeLoading}
              variant="default"
              size="lg"
              className="w-full"
            >
              {isLoading || isSending || isCodeLoading ? '测试运行中...' : '运行所有测试'}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              注意: 测试结果将在浏览器控制台中显示，请按F12打开开发者工具查看。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 