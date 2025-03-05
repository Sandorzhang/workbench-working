"use client";

import { ReactNode, useEffect } from "react";
import { redirect, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  // 如果未登录，重定向到登录页面
  if (isAuthenticated === false) {
    redirect("/login");
  }

  // 如果不是超级管理员，重定向到仪表盘
  if (user?.role !== "superadmin") {
    redirect("/dashboard");
  }

  // 不再需要这里的布局代码，因为已经在AppLayout中处理
  return <>{children}</>;
} 