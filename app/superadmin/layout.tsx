"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  // 如果未认证或不是超级管理员，则重定向到仪表盘
  if (!isAuthenticated || (user && user.role !== 'superadmin')) {
    toast.error('您没有权限访问超级管理员区域');
    redirect("/workbench");
  }

  // 不再需要这里的布局代码，因为已经在AppLayout中处理
  return <>{children}</>;
} 