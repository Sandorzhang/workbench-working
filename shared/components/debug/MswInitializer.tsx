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
  
  // 检查是否启用了API模拟
  const shouldUseMsw = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
  const environment = process.env.NEXT_PUBLIC_ENV || 'development';

  useEffect(() => {
    // 如果没有启用API模拟，则直接返回
    if (!shouldUseMsw) {
      console.log(`当前环境(${environment})未启用API模拟，跳过MSW初始化`);
      setStatus('success');
      window.__MSW_READY__ = true;
      return;
    }

    // 防止重复初始化
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    // 添加全局变量标记MSW状态 - 显式设置为false表示正在初始化中
    window.__MSW_READY__ = false;
    console.log("MSW初始化开始，将__MSW_READY__设置为false");

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
                request.url.includes('favicon') ||
                // 忽略Next.js RSC请求
                request.url.includes('_rsc=')
              ) {
                return;
              }
              
              // 忽略页面路由请求
              try {
                const urlPath = new URL(request.url).pathname;
                // 如果是页面路由（非API路径），且不是静态资源，则仅显示警告但不阻断
                if (!urlPath.includes('/api/') && !urlPath.includes('/_next/')) {
                  console.warn(`[MSW] 页面路由请求未被处理: ${request.method} ${urlPath}`);
                  return; // 不显示警告，直接返回
                }
                
                // 特别检查常见的API路径
                if (urlPath.includes('/api/superadmin/')) {
                  console.warn(`[MSW] 超级管理员API请求未被拦截: ${request.method} ${urlPath}`);
                  console.warn(`[MSW] 检查MSW是否配置了对应的处理程序，路径前缀应该包含通配符(*)`);
                }
              } catch (err) {
                console.error('[MSW] 无法解析请求URL', err);
              }
              
              // 详细记录未处理的请求
              console.warn(`[MSW] 未处理的请求: ${request.method} ${request.url}`);
              
              // 如果是API请求但没有被处理，增加更明显的警告
              if (request.url.includes('/api/')) {
                console.error(`[MSW] ⚠️ API请求未被拦截: ${request.method} ${request.url} - 这可能导致解析错误`);
                // 检查这个URL是否有对应的处理器
                try {
                  const urlPath = new URL(request.url).pathname;
                  console.error(`[MSW] 检查路径 '${urlPath}' 是否有对应的处理器配置`);
                } catch (err) {
                  console.error('[MSW] 无法解析请求URL', err);
                }
                toast.error(`API请求未被拦截: ${request.method} ${new URL(request.url).pathname}`);
              }
              
              print.warning();
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
          console.log("MSW初始化完成，将__MSW_READY__设置为true");
          
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
          // 即使MSW初始化失败，也将其标记为ready以防止API调用卡住
          window.__MSW_READY__ = true;
          console.log("MSW初始化失败，但将__MSW_READY__设置为true以避免API调用被阻塞");
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
        <span>
          {shouldUseMsw 
            ? `MSW [${environment}]: ${status === 'pending' ? '初始化中...' : status === 'success' ? '已启用' : '初始化失败 (点击刷新)'}`
            : `API [${environment}]: ${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}`
          }
        </span>
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