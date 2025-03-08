'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[]; // 可选，指定所需角色
  redirectPath?: string; // 可选，指定未认证时的重定向路径
  loadingComponent?: ReactNode; // 可选，自定义加载组件
}

/**
 * 保护路由组件
 * 
 * 用于包装需要认证的页面组件，提供统一的认证检查和加载状态处理
 * 
 * 示例使用:
 * ```tsx
 * export default function MyProtectedPage() {
 *   return (
 *     <ProtectedRoute>
 *       <MyActualPageContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 * 
 * 带角色限制:
 * ```tsx
 * <ProtectedRoute requiredRole="admin">
 *   <AdminOnlyContent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectPath = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 等待认证状态加载完成
    if (!isLoading) {
      // 检查是否已认证
      if (!isAuthenticated) {
        toast.error('请先登录以访问此页面');
        router.replace(redirectPath);
        return;
      }

      // 检查角色要求
      if (requiredRole && user) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasRequiredRole = roles.includes(user.role as string);

        if (!hasRequiredRole) {
          toast.error('您没有权限访问此页面');
          router.replace('/'); // 重定向到首页
          return;
        }
      }

      // 所有检查通过
      setAuthChecked(true);
    }
  }, [isAuthenticated, isLoading, user, router, redirectPath, requiredRole]);

  // 显示加载状态
  if (isLoading || !authChecked) {
    return loadingComponent || (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 认证通过，渲染子组件
  return <>{children}</>;
}

/**
 * 高阶组件，用于快速包装页面组件
 * 
 * 示例使用:
 * ```tsx
 * const MyPage = () => {
 *   return <div>受保护内容</div>;
 * };
 * 
 * export default withAuth(MyPage);
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function WithAuthComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 