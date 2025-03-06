"use client";

import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { toast } from 'sonner';

// 创建MSW状态上下文
export const MswContext = createContext<{
  status: 'pending' | 'success' | 'error';
  isReady: boolean;
}>({
  status: 'pending',
  isReady: false,
});

// 导出上下文钩子
export const useMsw = () => useContext(MswContext);

interface MswInitializerProps {
  onInitialized?: () => void;
  children?: React.ReactNode;
}

export function MswInitializer({ onInitialized, children }: MswInitializerProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const initAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒

  // 是否开启MSW模拟 - 直接从环境变量读取
  const isMswEnabled = typeof window !== 'undefined' 
    ? localStorage.getItem('msw-enabled') === 'true' 
        || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled')
    : false;
    
  // 当前环境
  const environment = typeof process !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development')
    : 'development';

  // 调试环境变量
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[MSW状态] 环境检测:');
      console.log('- NEXT_PUBLIC_API_MOCKING:', typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_MOCKING : '未知');
      console.log('- 启用状态:', isMswEnabled ? '已启用' : '未启用');
      console.log('- 环境:', environment);
      
      // 保存状态到localStorage方便调试
      localStorage.setItem('msw-environment', JSON.stringify({
        enabled: isMswEnabled,
        env: environment,
        apiMocking: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_MOCKING : null,
        timestamp: new Date().toISOString()
      }));
    }
  }, [isMswEnabled, environment]);

  useEffect(() => {
    // 如果未启用MSW或者不是客户端，则直接返回
    if (!isMswEnabled || typeof window === 'undefined') {
      console.log(`MSW未启用或不在客户端环境，跳过初始化`);
      setStatus('success');
      if (typeof window !== 'undefined') {
        window.__MSW_READY__ = true;
      }
      return;
    }

    // 防止重复初始化
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    // 设置MSW状态为未就绪
    window.__MSW_READY__ = false;
    console.log("⏳ MSW初始化开始...");

    const initMsw = async () => {
      const tryInit = async (): Promise<void> => {
        try {
          console.log(`尝试初始化MSW (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
          
          // 检查Service Worker支持
          if (!navigator.serviceWorker) {
            throw new Error('浏览器不支持Service Worker');
          }
          
          // 导入MSW模块
          console.log('正在动态导入MSW模块...');
          const { worker, startMSW } = await import('@/mocks/browser');
          
          console.log('正在启动MSW worker...');
          const success = await startMSW();
          
          if (!success) {
            throw new Error('MSW启动失败');
          }
          
          console.log('✅ MSW初始化成功!');
          setStatus('success');
          
          // 标记MSW准备就绪
          window.__MSW_READY__ = true;
          localStorage.setItem('msw-enabled', 'true');
          
          // 添加页面底部指示器
          document.body.classList.add('msw-enabled');
          
          onInitialized?.();
        } catch (error) {
          console.error(`❌ MSW初始化失败:`, error);
          
          if (retryCountRef.current < MAX_RETRIES - 1) {
            retryCountRef.current++;
            console.log(`等待${RETRY_DELAY}ms后重试...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return tryInit();
          }
          
          console.error('MSW初始化失败，已达到最大重试次数');
          setStatus('error');
          
          // 即使失败也标记为ready以防止API调用挂起
          window.__MSW_READY__ = true;
          toast.error('模拟服务初始化失败，请刷新页面重试');
        }
      };
      
      await tryInit();
    };
    
    initMsw();
  }, [onInitialized, isMswEnabled, environment]);
  
  // 提供上下文值
  const contextValue = {
    status,
    isReady: status === 'success'
  };
  
  // 显示MSW状态
  return (
    <MswContext.Provider value={contextValue}>
      {isMswEnabled && (
        <div 
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            padding: '4px 8px',
            background: status === 'pending' ? '#2196f3' : status === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            fontSize: '12px',
            zIndex: 9999,
            borderTopLeftRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onClick={() => {
            if (status === 'error') {
              window.location.reload();
            }
          }}
        >
          <span>
            MSW {status === 'pending' ? '初始化中...' : status === 'success' ? '已启用' : '初始化失败'}
          </span>
        </div>
      )}
      {children}
    </MswContext.Provider>
  );
} 

// 声明全局变量
declare global {
  interface Window {
    __MSW_READY__?: boolean;
  }
} 