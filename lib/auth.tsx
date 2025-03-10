"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  login as apiLogin,
  loginWithCode as apiLoginWithCode,
  sendVerificationCode as apiSendVerificationCode,
  logout as apiLogout,
  getCurrentUser as apiGetCurrentUser,
} from "../api/auth";
import { LoginResponse, Role } from "./api-types";
import md5 from "crypto-js/md5";

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  school?: string; // 用户所属学校
  schoolType?: string; // 学校类型
  permissions?: string[]; // 用户权限列表
}

// 认证上下文状态
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// 认证上下文方法
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  loginWithCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectToAppropriateRoute: () => void;
}

// 密码加盐的盐值（理想情况下应该存储在环境变量中）
const SALT = "workbench_secure_salt_2023";

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // 初始化检查用户已登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        console.log("正在验证用户会话，token:", token.substring(0, 5) + "...");

        // 使用API工具获取用户信息
        const userData = (await apiGetCurrentUser()) as User;

        // 更新 Redux 存储（如果使用 Redux）
        if (typeof window !== "undefined" && window.store) {
          window.store.dispatch({
            type: "auth/setUser",
            payload: userData,
          });
        }

        setState({
          isAuthenticated: true,
          user: userData,
          token: token,
          isLoading: false,
          error: null,
        });

        console.log("用户会话验证成功:", userData.name);
      } catch (error: any) {
        console.error("会话验证失败:", error);

        // 清除无效token
        localStorage.removeItem("token");

        // 更健壮的错误消息提取
        let errorMessage = "会话验证失败";

        if (error) {
          if (typeof error === "string") {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.code) {
            errorMessage = `认证错误 (${error.code})`;
          } else if (JSON.stringify(error) !== "{}") {
            // 如果错误对象不为空但没有消息，尝试将整个对象转为字符串
            errorMessage = `认证错误: ${JSON.stringify(error)}`;
          }
        }

        console.log("设置错误状态，错误消息:", errorMessage);

        setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: errorMessage,
        });

        // 显示错误提示
        toast.error(errorMessage);
      }
    };

    checkAuth();
  }, []);

  // 密码加密函数 - 使用 MD5 加盐
  const hashPassword = (password: string): string => {
    // 将密码与盐组合并进行 MD5 加密
    return md5(password + SALT).toString();
  };

  // 根据用户角色确定重定向路径
  const getRedirectPathByRole = (role: Role): string => {
    // 根据不同角色返回不同的路径
    switch (role) {
      case "superadmin":
        return "/superadmin";
      case "admin":
        return "/workbench";
      case "teacher":
        return "/workbench";
      case "student":
        return "/workbench";
      default:
        return "/workbench";
    }
  };

  // 重定向到合适的路由函数
  const redirectToAppropriateRoute = () => {
    if (!state.isAuthenticated || !state.user) {
      router.push("/login");
      return;
    }

    const redirectPath = getRedirectPathByRole(state.user.role);

    // 显示成功消息
    toast.success(
      `登录成功，即将跳转到${
        state.user.role === "superadmin" ? "超级管理员控制台" : "工作台"
      }...`
    );

    // 短暂延迟以显示成功消息
    setTimeout(() => {
      router.push(redirectPath);
    }, 1000);
  };

  // 用户名密码登录
  const login = async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("开始账号密码登录请求...");

      // 对密码进行加密
      const hashedPassword = hashPassword(password);

      // 使用API工具进行登录
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = (await apiLogin(username, hashedPassword)) as any;

      console.log("登录成功，获取到token和用户数据", data);

      // 先保存token到localStorage
      localStorage.setItem("token", data.token);

      // 如果使用 Redux，更新用户状态
      if (typeof window !== "undefined" && window.store) {
        window.store.dispatch({
          type: "auth/setUser",
          payload: data.user,
        });

        window.store.dispatch({
          type: "auth/setToken",
          payload: data.token,
        });
      }

      // 立即更新状态
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });

      toast.success("登录成功");

      // 自动重定向到合适的路由
      const redirectPath = getRedirectPathByRole(data.user.role);

      // 显示成功消息
      toast.success(
        `登录成功，即将跳转到${
          data.user.role === "superadmin" ? "超级管理员控制台" : "工作台"
        }...`
      );

      // 短暂延迟以显示成功消息
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("登录失败:", error);
      const errorMessage = error.message || "登录时发生错误";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  // 短信验证码登录
  const loginWithCode = async (phone: string, code: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("开始验证码登录请求...");

      // 使用API工具进行验证码登录
      const data = (await apiLoginWithCode(phone, code)) as LoginResponse;

      console.log("验证码登录成功，获取到token和用户数据", data);

      // 先保存token到localStorage
      localStorage.setItem("token", data.token);

      // 如果使用 Redux，更新用户状态
      if (typeof window !== "undefined" && window.store) {
        window.store.dispatch({
          type: "auth/setUser",
          payload: data.user,
        });

        window.store.dispatch({
          type: "auth/setToken",
          payload: data.token,
        });
      }

      // 立即更新状态
      setState({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });

      toast.success("登录成功");

      // 自动重定向到合适的路由
      const redirectPath = getRedirectPathByRole(data.user.role);

      // 显示成功消息
      toast.success(
        `登录成功，即将跳转到${
          data.user.role === "superadmin" ? "超级管理员控制台" : "工作台"
        }...`
      );

      // 短暂延迟以显示成功消息
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (error: any) {
      console.error("验证码登录失败:", error);
      const errorMessage = error.message || "验证码登录失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  // 发送短信验证码
  const sendVerificationCode = async (phone: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("发送验证码到手机:", phone);

      // 使用API工具发送验证码
      await apiSendVerificationCode(phone);

      setState((prev) => ({ ...prev, isLoading: false }));
      console.log("验证码发送成功");
      toast.success("验证码已发送");
    } catch (error: any) {
      console.error("验证码发送失败:", error);
      const errorMessage = error.message || "验证码发送失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  // 登出
  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      console.log("开始注销操作...");

      // 先记录当前token用于API调用
      const currentToken = localStorage.getItem("token");

      // 清除本地token
      localStorage.removeItem("token");
      console.log("已清除本地token");

      // 如果使用 Redux，清除用户状态
      if (typeof window !== "undefined" && window.store) {
        window.store.dispatch({ type: "auth/clearUser" });
        window.store.dispatch({ type: "auth/clearToken" });
      }

      try {
        // 尝试调用API，但不等待结果
        if (currentToken) {
          console.log("调用API进行服务器端登出");
          await apiLogout();
          console.log("API登出调用成功");
        } else {
          console.log("没有token，跳过API登出调用");
        }
      } catch (logoutError: any) {
        // 如果API调用失败，记录错误但继续删除本地状态
        console.error("注销API调用失败，但会继续清除本地状态:", logoutError);
      }

      // 清除本地状态
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });

      // 显示成功消息
      toast.success("已成功退出登录");

      // 重定向到登录页
      router.push("/login");
    } catch (error: any) {
      console.error("注销失败:", error);

      const errorMessage = error.message || "注销失败";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithCode,
        sendVerificationCode,
        logout,
        redirectToAppropriateRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 声明全局 Redux 存储类型
declare global {
  interface Window {
    store?: {
      dispatch: (action: any) => void;
      getState: () => any;
    };
  }
}

// 认证上下文使用钩子
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
};

// 页面级认证守卫 HOC
export const withAuth = (Component: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // 未通过认证，重定向到登录页
        router.push("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    // 如果还在加载，显示加载状态
    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700">认证中...</p>
          </div>
        </div>
      );
    }

    // 如果未认证且已加载完成，返回 null，等待重定向完成
    if (!isAuthenticated) {
      return null;
    }

    // 通过认证，渲染组件
    return <Component {...props} user={user} />;
  };

  return AuthenticatedComponent;
};

// 角色授权 HOC
export const withRole = (
  Component: React.ComponentType<any>,
  allowedRoles: Role[]
) => {
  const RoleAuthComponent = (props: any) => {
    const { isAuthenticated, isLoading, user, redirectToAppropriateRoute } =
      useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // 未通过认证，重定向到登录页
          router.push("/login");
        } else if (user && !allowedRoles.includes(user.role)) {
          // 未授权访问，重定向到合适的路由
          toast.error("您没有权限访问此页面");
          redirectToAppropriateRoute();
        }
      }
    }, [isAuthenticated, isLoading, user, router, redirectToAppropriateRoute]);

    // 如果还在加载，显示加载状态
    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-lg font-medium text-gray-700">认证中...</p>
          </div>
        </div>
      );
    }

    // 如果未认证或无权限，返回 null，等待重定向完成
    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
      return null;
    }

    // 通过认证和授权，渲染组件
    return <Component {...props} user={user} />;
  };

  return RoleAuthComponent;
};
