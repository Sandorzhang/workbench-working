"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // 只在认证状态加载完成后才进行处理
    if (!isLoading) {
      // 检查全局变量，避免多次跳转
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
      
      if (isAuthenticated) {
        const targetPath = user?.role === 'superadmin' ? '/superadmin' : '/workbench';
        console.log(`根页面：用户已认证，角色 [${user?.role}]，重定向到 ${targetPath}`);
        router.push(targetPath);
      } else {
        console.log('根页面：用户未认证，重定向到登录页');
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-4 text-lg">正在加载应用...</p>
    </div>
  );
} 