import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiErrorResponse } from "../lib/api-types";

// 基础API配置
// 根据环境变量设置API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// MSW配置
const ENABLE_MSW = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";
const MSW_READY_TIMEOUT = 30000; // 30秒超时

// 创建Axios实例
export const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    "Content-Type": "application/json",
  },
});

// 跟踪MSW初始化状态
let mswInitialized = false;

// 等待MSW准备就绪
const waitForMsw = async (): Promise<boolean> => {
  // 如果MSW被禁用或不在浏览器环境中，直接返回
  if (!ENABLE_MSW || typeof window === "undefined" || mswInitialized)
    return true;

  // 如果MSW已经就绪，直接返回
  if (window.__MSW_READY__ === true) {
    mswInitialized = true;
    return true;
  }

  // 等待MSW就绪，最多等待MSW_READY_TIMEOUT毫秒
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkMswReady = () => {
      // 如果MSW已就绪，标记为已初始化并解析Promise
      if (window.__MSW_READY__ === true) {
        mswInitialized = true;
        resolve(true);
        return;
      }

      // 检查是否超时
      if (Date.now() - startTime > MSW_READY_TIMEOUT) {
        console.warn("等待MSW就绪超时，继续API请求");
        // 标记为已初始化以避免再次等待
        mswInitialized = true;
        resolve(false);
        return;
      }

      // 继续等待
      setTimeout(checkMswReady, 100);
    };

    checkMswReady();
  });
};

// 为请求添加认证头
const getAuthHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    // console.log(`添加认证头，token: ${token.substring(0, 5)}...`);
    return { Authorization: `Bearer ${token}` };
  } else {
    // console.log("没有token，使用无认证头");
    return {};
  }
};

// 配置请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 在开发环境中且MSW启用时等待MSW就绪
    if (
      process.env.NODE_ENV === "development" &&
      ENABLE_MSW &&
      !mswInitialized
    ) {
      await waitForMsw();
    }

    // 每次请求时重新获取认证头，确保使用最新的token
    const authHeaders = getAuthHeaders();

    // 添加授权头
    if (authHeaders.Authorization && config.headers) {
      config.headers.Authorization = authHeaders.Authorization;
    }

    // 检查是否有认证头并记录日志
    const hasAuthHeader =
      config.headers && "Authorization" in Object(config.headers);

    // 只在开发环境记录API请求日志
    if (process.env.NODE_ENV === "development") {
      // console.log(
      //   `API请求: ${config.url} - Authorization头: ${
      //     hasAuthHeader ? "已设置" : "未设置"
      //   }`
      // );
    }

    return config;
  },
  (error) => {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }
);

// 配置响应拦截器
request.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data;
  },
  async (error: AxiosError) => {
    const response = error.response;

    // 处理401认证错误
    if (response?.status === 401) {
      console.error("认证失败 (401)，清除token并提示用户重新登录");
      // 清除无效token
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // console.log("尝试重定向到登录页");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (response.data as Record<string, any>) || {};
      const standardError: ApiErrorResponse = {
        message: errorData.message || "登录已过期，请重新登录",
        code: "401",
        details: errorData.details || {},
      };

      return Promise.reject(standardError);
    }

    // 处理404错误 - 这通常表示API路径问题或MSW未拦截
    if (response?.status === 404) {
      console.error(`API路径不存在 (404): ${error.config?.url}`);

      // 检查URL是否包含API路径
      if (error.config?.url?.includes("/api/")) {
        console.error(
          `检测到API路径 ${error.config.url} 返回404，这可能是MSW拦截问题`
        );
      }

      // 尝试获取响应内容以诊断问题
      const contentType = response.headers?.["content-type"];
      if (contentType && contentType.includes("text/html")) {
        const htmlText = response.data as string;
        const htmlSnippet =
          typeof htmlText === "string"
            ? htmlText.substring(0, 200) + "..."
            : "HTML内容无法获取";
        console.error("返回的HTML片段:", htmlSnippet);

        const standardError: ApiErrorResponse = {
          message: "API路径不存在，MSW可能未正确拦截请求",
          code: "API_PATH_NOT_FOUND",
          details: { url: error.config?.url, htmlSnippet },
        };

        return Promise.reject(standardError);
      }

      const standardError: ApiErrorResponse = {
        message: "API路径不存在，请检查请求路径或MSW配置",
        code: "404",
        details: { url: error.config?.url },
      };

      return Promise.reject(standardError);
    }

    // 处理响应类型错误
    if (response) {
      const contentType = response.headers?.["content-type"];
      if (contentType && contentType.includes("text/html")) {
        console.error(`API返回了HTML而不是JSON: ${error.config?.url}`);
        const htmlText = response.data as string;
        const htmlSnippet =
          typeof htmlText === "string"
            ? htmlText.substring(0, 200) + "..."
            : "HTML内容无法获取";
        console.error("返回的HTML片段:", htmlSnippet);

        const standardError: ApiErrorResponse = {
          message: "服务器返回了HTML而不是JSON，请检查API路径或MSW配置",
          code: "INVALID_RESPONSE_TYPE",
          details: { contentType, htmlSnippet },
        };

        return Promise.reject(standardError);
      }
    }

    // 处理其他错误
    console.error("API请求错误:", error);

    // 准备标准化的错误对象
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorData = (response?.data as Record<string, any>) || {};
    const standardError: ApiErrorResponse = {
      message: errorData.message || error.message || "请求失败",
      code: response ? String(response.status) : "UNKNOWN",
      details: errorData.details ||
        errorData || { originalError: error.message },
    };

    return Promise.reject(standardError);
  }
);

export default request;
