"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth';
import { toast } from "sonner";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 使用 useEffect 处理权限检查和重定向
  useEffect(() => {
    // 输出调试信息
    console.log('超管布局 - 认证状态:', {
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role, 
      roleType: typeof user?.role,
      isLoading
    });
    
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
        console.log('超级管理员区域：未认证，重定向到登录页');
        try {
          router.replace('/login');
        } catch (error) {
          console.error('路由跳转失败:', error);
          // 使用window.location作为后备方案
          window.location.href = '/login';
        }
        return;
      } else if (user && user.role) {
        // 详细记录角色判断过程
        console.log('超级管理员区域检查 - 用户角色:', user.role);
        console.log('角色类型:', typeof user.role);
        
        // 确保角色字符串进行精确比较
        const isSuperAdmin = String(user.role).toLowerCase() === 'superadmin';
        console.log('是否为超级管理员:', isSuperAdmin);
        
        if (!isSuperAdmin) {
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
          try {
            router.replace('/workbench');
          } catch (error) {
            console.error('路由跳转失败:', error);
            // 使用window.location作为后备方案
            window.location.href = '/workbench';
          }
        } else {
          console.log('超级管理员区域：认证通过，角色验证成功');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

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