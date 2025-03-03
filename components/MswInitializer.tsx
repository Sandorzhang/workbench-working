"use client";

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface MswInitializerProps {
  onInitialized?: () => void;
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
      if (process.env.NODE_ENV !== 'development') {
        setStatus('success');
        onInitialized?.();
        return;
      }

      const tryInit = async (): Promise<void> => {
        try {
          console.log(`尝试初始化 MSW (尝试 ${retryCountRef.current + 1}/${MAX_RETRIES})...`);
          
          // 导入MSW模块
          const { worker } = await import('@/mocks');
          
          // 检查service worker注册
          if ('serviceWorker' in navigator) {
            // 尝试初始化MSW
            await worker.start({
              onUnhandledRequest: 'warn',
              serviceWorker: {
                url: '/mockServiceWorker.js',
              },
            });
            
            // 确保默认会话可用
            const token = localStorage.getItem('token');
            if (!token) {
              console.log('设置默认测试token');
              localStorage.setItem('token', 'default-token');
            }
            
            console.log('✅ MSW初始化成功');
            setStatus('success');
            onInitialized?.();
          } else {
            throw new Error('浏览器不支持Service Worker');
          }
        } catch (error) {
          console.error(`❌ MSW初始化失败 (尝试 ${retryCountRef.current + 1}/${MAX_RETRIES}):`, error);
          
          if (retryCountRef.current < MAX_RETRIES - 1) {
            retryCountRef.current++;
            console.log(`等待 ${RETRY_DELAY}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return tryInit();
          }
          
          setStatus('error');
          toast.error('API模拟服务初始化失败，请刷新页面重试');
          throw error;
        }
      };

      try {
        await tryInit();
      } catch (error) {
        console.error('MSW初始化最终失败:', error);
      }
    };

    initMsw();
  }, [onInitialized]);

  // 仅在开发环境中的调试信息
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        padding: '4px 8px',
        background: status === 'success' ? '#4caf50' : status === 'error' ? '#f44336' : '#2196f3',
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
        <span>MSW: {status === 'pending' ? '初始化中...' : status === 'success' ? '已启动' : '启动失败'}</span>
        {status === 'error' && (
          <span style={{ fontSize: '10px' }}>(点击重试)</span>
        )}
      </div>
    );
  }

  return null;
} 