'use client';

import React, { useEffect } from 'react';

/**
 * MSW客户端初始化组件
 * 这个组件负责在客户端浏览器中初始化MSW，用于API模拟
 */
export function MSWInitializer() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
      // 导入和初始化MSW
      const initMsw = async () => {
        try {
          if (typeof window !== 'undefined') {
            // 仅在客户端环境执行
            console.log('🔨 正在初始化MSW...');
            const { startMSW } = await import('@/mocks/browser');
            
            // 启动MSW
            const success = await startMSW();
            console.log('MSW初始化结果:', success ? '成功' : '失败');
          }
        } catch (error) {
          console.error('MSW初始化失败:', error);
          // 设置MSW初始化失败标记
          if (typeof window !== 'undefined') {
            (window as any).__MSW_READY__ = false;
          }
        }
      };
      
      initMsw();
    }
  }, []);
  
  return null;
} 