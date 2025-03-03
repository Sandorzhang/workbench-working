"use client";

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { SetupWorkerApi, StartOptions } from 'msw/browser';

interface MswInitializerProps {
  onInitialized?: () => void;
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

export function MswInitializer({ onInitialized }: MswInitializerProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const initAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒

  useEffect(() => {
    // 防止重复初始化
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    const initMsw = async () => {
      // 始终在开发环境中启用MSW
      // if (process.env.NODE_ENV !== 'development') {
      //   setStatus('success');
      //   onInitialized?.();
      //   return;
      // }

      const tryInit = async (): Promise<void> => {
        try {
          console.log(`尝试初始化 MSW (尝试 ${retryCountRef.current + 1}/${MAX_RETRIES})...`);
          
          // 导入MSW模块
          const { worker } = await import('@/mocks');
          
          // 检查service worker注册
          if ('serviceWorker' in navigator) {
            console.log('浏览器支持 Service Worker, 开始初始化 MSW...');
            
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
                
                // 记录未处理的请求
                console.warn(`[MSW] 未处理的请求: ${request.method} ${request.url}`);
                print.warning();
              },
              serviceWorker: {
                url: '/mockServiceWorker.js',
                options: {
                  scope: '/',
                },
              },
            });
            
            // 确保默认会话可用
            const token = localStorage.getItem('token');
            if (!token) {
              console.log('设置默认测试token');
              localStorage.setItem('token', 'default-token');
            }
            
            console.log('MSW 初始化成功!');
            setStatus('success');
            onInitialized?.();
          } else {
            console.error('浏览器不支持 Service Worker, MSW 无法初始化');
            setStatus('error');
          }
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
        }
      };
      
      await tryInit();
    };
    
    initMsw();
  }, [onInitialized]);
  
  // 显示MSW状态
  return (
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
    >
      <span>MSW: {status === 'pending' ? '初始化中...' : status === 'success' ? '已启用' : '初始化失败'}</span>
    </div>
  );
} 