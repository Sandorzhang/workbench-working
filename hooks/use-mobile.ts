import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * 检测当前视口是否为移动设备尺寸的钩子
 * @returns {boolean} 当前视口是否为移动设备尺寸
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // 早期返回：如果不在浏览器环境中
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // 添加事件监听器
    mql.addEventListener("change", handleResize);
    
    // 立即设置初始值
    handleResize();
    
    // 清理函数
    return () => mql.removeEventListener("change", handleResize);
  }, []);

  // 确保返回布尔值
  return Boolean(isMobile);
};
