"use client";

import { useEffect, useState } from 'react';
import { MswInitializer } from './MswInitializer';

export function ClientMswWrapper({ children }: { children: React.ReactNode }) {
  const [isMswReady, setIsMswReady] = useState(false);
  
  useEffect(() => {
    // 检查MSW是否已准备就绪
    if (typeof window !== 'undefined' && window.__MSW_READY__ === true) {
      setIsMswReady(true);
      return;
    }
    
    // 如果没有准备好，设置一个轮询检查
    const checkMswReady = () => {
      if (typeof window !== 'undefined' && window.__MSW_READY__ === true) {
        setIsMswReady(true);
        return;
      }
      
      // 每100ms检查一次，直到就绪
      setTimeout(checkMswReady, 100);
    };
    
    checkMswReady();
    
    // 超时保护 - 5秒后即使MSW未就绪也继续
    const timeoutId = setTimeout(() => {
      console.warn('MSW未在预期时间内就绪，将继续渲染应用');
      setIsMswReady(true);
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <>
      <MswInitializer onInitialized={() => setIsMswReady(true)} />
      {isMswReady ? children : <div>正在准备模拟环境...</div>}
    </>
  );
} 