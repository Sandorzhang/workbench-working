"use client";

import { useEffect, useState, useRef } from 'react';

export function MswInitializer() {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    // 防止重复初始化
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    const initMsw = async () => {
      if (process.env.NODE_ENV !== 'development') {
        setStatus('success');
        return;
      }

      try {
        // 导入MSW模块
        const { worker } = await import('@/mocks');
        
        // 检查service worker注册
        if ('serviceWorker' in navigator) {
          // 尝试初始化MSW
          await worker.start({
            // 使用"warn"而不是"bypass"可以减少未处理请求的警告
            onUnhandledRequest: 'warn',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          });
          
          console.log('✅ MSW初始化成功');
          setStatus('success');
        } else {
          console.error('❌ 浏览器不支持Service Worker');
          setStatus('error');
        }
      } catch (error) {
        console.error('❌ MSW初始化失败:', error);
        setStatus('error');
      }
    };

    initMsw();
  }, []);

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
        borderTopLeftRadius: '4px'
      }}>
        MSW: {status === 'pending' ? '初始化中...' : status === 'success' ? '已启动' : '启动失败'}
      </div>
    );
  }

  return null;
} 