"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 使用 useEffect 处理权限检查和重定向
  useEffect(() => {
    // 只有当认证状态加载完成后才进行检查
    if (!isLoading) {
      // 检查全局变量，避免多次跳转
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.__LOGIN_REDIRECT_IN_PROGRESS__) {
          console.log('超管布局：跳转已在进行中，忽略');
          return;
        }
      }
      
      if (!isAuthenticated) {
        console.log('超级管理员区域：未认证，不显示内容');
        // 不再主动跳转，让路由系统处理
      } else if (user && user.role !== 'superadmin') {
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
        
        console.log('超级管理员区域：非超级管理员，重定向到工作台');
        toast.error('您没有权限访问超级管理员区域');
        router.push('/workbench');
      } else {
        console.log('超级管理员区域：认证通过，角色验证成功');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // 在加载状态或未通过权限验证时，可以显示加载状态
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">正在加载...</div>;
  }

  // 只有通过权限检查的用户才能看到实际内容
  if (isAuthenticated && user && user.role === 'superadmin') {
    return <>{children}</>;
  }

  // 对于未通过权限检查的用户，显示空白页面（实际重定向会在useEffect中处理）
  return <div className="flex items-center justify-center h-screen">检查权限中...</div>;
} 