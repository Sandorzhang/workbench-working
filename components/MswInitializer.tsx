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

// MSW request and print types
interface MswRequest extends Request {
  url: string;
  method: string;
}

interface MswPrint {
  warning: () => void;
  error: () => void;
}

export function MswInitializer({ onInitialized, children }: MswInitializerProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const initAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒

  useEffect(() => {
    // 防止重复初始化
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    // 添加全局变量标记MSW状态
    window.__MSW_READY__ = false;

    const initMsw = async () => {
      const tryInit = async (): Promise<void> => {
        try {
          console.log(`尝试初始化 MSW (尝试 ${retryCountRef.current + 1}/${MAX_RETRIES})...`);
          
          // 检查service worker注册
          if (!navigator.serviceWorker) {
            console.error('浏览器不支持 Service Worker, MSW 无法初始化');
            setStatus('error');
            return;
          }
          
          // 导入MSW模块
          const { worker } = await import('@/mocks');
          
          console.log('准备启动MSW worker...');
          
          // 尝试初始化MSW
          await worker.start({
            onUnhandledRequest: (request: MswRequest, print: MswPrint) => {
              // 忽略静态资源请求
              if (
                request.url.includes('/_next/') || 
                request.url.includes('.svg') || 
                request.url.includes('.png') || 
                request.url.includes('.jpg') || 
                request.url.includes('.ico') ||
                request.url.includes('favicon')
              ) {
                return;
              }
              
              // 详细记录未处理的请求
              console.warn(`[MSW] 未处理的请求: ${request.method} ${request.url}`);
              
              // 如果是API请求但没有被处理，增加更明显的警告
              if (request.url.includes('/api/')) {
                console.error(`[MSW] ⚠️ API请求未被拦截: ${request.method} ${request.url} - 这可能导致解析错误`);
                toast.error(`API请求未被拦截: ${request.method} ${new URL(request.url).pathname}`);
              }
              
              print.warning();
            },
            serviceWorker: {
              url: '/mockServiceWorker.js',
              options: {
                scope: '/',
              },
            },
          });
          
          console.log('MSW worker 启动成功');
          
          // 确保默认会话可用
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('设置默认测试token');
            localStorage.setItem('token', 'default-token');
            
            // 通知控制台
            console.info('已设置默认测试token: default-token');
            console.info('此token将用于开发环境中的自动身份验证');
          } else {
            console.log('已存在token:', token.substring(0, 5) + '...');
          }
          
          console.log('MSW 初始化成功!');
          setStatus('success');
          
          // 标记MSW准备就绪
          window.__MSW_READY__ = true;
          
          onInitialized?.();
        } catch (error) {
          console.error(`MSW 初始化失败 (尝试 ${retryCountRef.current + 1}/${MAX_RETRIES}):`, error);
          
          if (retryCountRef.current < MAX_RETRIES - 1) {
            retryCountRef.current++;
            console.log(`等待 ${RETRY_DELAY}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return tryInit();
          }
          
          console.error('MSW 初始化失败，已达到最大重试次数');
          setStatus('error');
          toast.error('模拟服务初始化失败，请刷新页面重试');
        }
      };
      
      await tryInit();
    };
    
    initMsw();
  }, [onInitialized]);
  
  // 提供上下文值
  const contextValue = {
    status,
    isReady: status === 'success'
  };
  
  // 显示MSW状态
  return (
    <MswContext.Provider value={contextValue}>
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
        <span>MSW: {status === 'pending' ? '初始化中...' : status === 'success' ? '已启用' : '初始化失败 (点击刷新)'}</span>
      </div>
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