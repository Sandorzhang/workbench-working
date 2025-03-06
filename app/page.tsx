"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // 如果还在加载，提前返回
    if (isLoading) {
      return;
    }

    // 检查是否已经在进行跳转，避免多次跳转
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.__LOGIN_REDIRECT_IN_PROGRESS__) {
        console.log('根页面：跳转已在进行中，忽略');
        return;
      }
    }
    
    // 设置全局标记，避免重复跳转
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.__LOGIN_REDIRECT_IN_PROGRESS__ = true;
      // 5秒后清除标记，以防万一
      setTimeout(() => {
        // @ts-ignore
        window.__LOGIN_REDIRECT_IN_PROGRESS__ = false;
      }, 5000);
    }
    
    // 根据认证状态和用户角色决定重定向目标
    if (isAuthenticated) {
      const targetPath = user?.role === 'superadmin' ? '/superadmin' : '/workbench';
      console.log(`根页面：用户已认证，角色 [${user?.role}]，重定向到 ${targetPath}`);
      router.push(targetPath);
    } else {
      console.log('根页面：用户未认证，重定向到登录页');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          正在加载应用...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {isLoading ? "验证登录状态中" : "准备重定向"}
        </p>
      </div>
    </div>
  );
} 