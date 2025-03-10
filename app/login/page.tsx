"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  KeyRound,
  Smartphone,
  ArrowRight,
  User,
  ShieldCheck,
  Mail,
} from "lucide-react";
// import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string>("password");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const { login, loginWithCode, sendVerificationCode, isLoading, error } =
    useAuth();

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // 倒计时逻辑
  useEffect(() => {
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

    // 表单验证
    if (!username) {
      toast.error("请输入用户名");
      return;
    }

    if (!password) {
      toast.error("请输入密码");
      return;
    }

    // 调用登录
    await login(username, password);
  };

  const handleSendCode = async () => {
    if (!phone) {
      toast.error("请输入手机号码");
      return;
    }

    if (phone.length !== 11) {
      toast.error("请输入正确的手机号码格式");
      return;
    }

    if (isLoading || countdown > 0) return;

    try {
      await sendVerificationCode(phone);
      setCodeSent(true);
      setCountdown(60); // 60秒倒计时
      toast.success("验证码已发送，请注意查收");
    } catch (error) {
      // 错误已在 auth context 中处理
      console.log("error", error);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 如果验证码尚未发送，则触发发送验证码
    if (!codeSent) {
      if (phone.length === 11) {
        await handleSendCode();
      } else {
        toast.error("请输入正确的手机号码");
      }
      return;
    }

    // 验证码格式检查
    if (verificationCode.length !== 6) {
      toast.error("请输入6位验证码");
      return;
    }

    // 调用验证码登录
    await loginWithCode(phone, verificationCode);
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 左侧大图 */}
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
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">
              教育管理平台
            </h1>
            <p className="text-xl max-w-md text-center text-white/90">
              为教育工作者提供高效、便捷的管理工具，助力教育事业发展
            </p>
          </div>
        </div>
      </div>

      {/* 右侧登录面板 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900">教育管理平台</h1>
            <p className="mt-2 text-gray-600">登录以访问系统</p>
          </div>

          <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    欢迎回来
                  </CardTitle>
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
              <Tabs
                defaultValue="password"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
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

                <TabsContent value="password">
                  <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        <User className="h-4 w-4 text-gray-500" />
                        用户名
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setUsername(e.target.value)
                        }
                        placeholder="请输入用户名"
                        className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium flex items-center gap-1.5"
                        >
                          <ShieldCheck className="h-4 w-4 text-gray-500" />
                          密码
                        </Label>
                        <a
                          href="#"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          忘记密码?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        placeholder="请输入密码"
                        className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

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

                <TabsContent value="code">
                  <form onSubmit={handleCodeSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        手机号码
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPhone(e.target.value)
                          }
                          placeholder="请输入手机号码"
                          className="h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                        <Button
                          type="button"
                          onClick={handleSendCode}
                          className="h-12 px-4 font-medium transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg"
                          disabled={isLoading || countdown > 0}
                        >
                          {countdown > 0 ? `${countdown}秒` : "获取验证码"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="code"
                        className="text-sm font-medium flex items-center gap-1.5"
                      >
                        <ShieldCheck className="h-4 w-4 text-gray-500" />
                        验证码
                      </Label>
                      <InputOTP
                        maxLength={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-[48px] h-[48px] text-center text-lg font-semibold border border-gray-300 rounded-md"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

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
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center p-6 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>如需帮助，请联系系统管理员</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
