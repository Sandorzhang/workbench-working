import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';

// 验证处理程序配置
const validateHandlers = () => {
  if (!handlers || !Array.isArray(handlers)) {
    console.error('MSW处理程序不是有效数组!', handlers);
    return false;
  }
  
  if (handlers.length === 0) {
    console.warn('MSW处理程序数组为空!');
    return false;
  }
  
  console.log(`MSW处理程序数量: ${handlers.length}`);
  
  // 验证关键的认证处理程序是否存在
  const criticalEndpoints = [
    { pattern: '/api/auth/login', method: 'POST' },
    { pattern: 'http://localhost:3000/api/auth/login', method: 'POST' },
    { pattern: '*/api/auth/login', method: 'POST' },
    { pattern: '/api/auth/me', method: 'GET' },
    { pattern: '/api/auth/logout', method: 'POST' }
  ];
  
  // 验证关键端点
  console.log('验证关键API端点:');
  let missingEndpoints = 0;
  
  criticalEndpoints.forEach(endpoint => {
    let hasHandler = false;
    
    for (let i = 0; i < handlers.length; i++) {
      try {
        const handler = handlers[i];
        
        if (handler && handler.info) {
          const { method, path } = handler.info;
          
          if (method === endpoint.method) {
            // 检查路径是否匹配
            let pathMatches = false;
            const pathStr = String(path);
            
            pathMatches = 
              pathStr === endpoint.pattern || 
              pathStr.includes(endpoint.pattern) ||
              (pathStr.includes('*') && endpoint.pattern.includes(pathStr.replace('*', ''))) ||
              (endpoint.pattern.includes('*') && pathStr.includes(endpoint.pattern.replace('*', '')));
              
            if (pathMatches) {
              hasHandler = true;
              console.log(`✓ ${endpoint.method} ${endpoint.pattern} -> 匹配: ${pathStr}`);
              break;
            }
          }
        }
      } catch (err) {
        console.warn(`检查处理程序时出错:`, err);
      }
    }
    
    if (!hasHandler) {
      console.warn(`⚠️ 未找到 ${endpoint.method} ${endpoint.pattern} 处理程序!`);
      missingEndpoints++;
    }
  });
  
  return missingEndpoints === 0;
};

// 初始化MSW worker
export const worker = setupWorker(...handlers);

// 启动MSW
export const startMSW = async () => {
  // 验证处理程序配置
  validateHandlers();
  
  // 启动worker
  console.log('正在启动MSW worker...');
  
  try {
    await worker.start({
      onUnhandledRequest: (request, { warning, error }) => {
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
        
        try {
          const url = new URL(request.url);
          
          // 登录相关请求，发出更明显的警告
          if (url.pathname.includes('/api/auth/login')) {
            console.error(`⚠️⚠️⚠️ [MSW] 登录请求未被拦截! ${request.method} ${url.pathname}`);
            console.log(`请求URL: ${request.url}`);
            console.log(`当前处理程序路径:`, handlers.map(h => h.info?.path || 'unknown'));
            error();
            return;
          }
          
          // 忽略非API请求
          if (!url.pathname.includes('/api/')) {
            return;
          }
          
          // 记录未处理的API请求
          console.warn(`[MSW] 未处理的API请求: ${request.method} ${url.pathname}`);
        } catch (error) {
          console.error('[MSW] 无法解析请求URL:', error);
        }
        
        warning();
      },
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
        },
      },
    });
    
    console.log('✅ MSW worker已启动');
    
    // 添加调试信息到全局变量
    if (typeof window !== 'undefined') {
      // 设置MSW就绪标志，通知API层MSW已准备好拦截请求
      (window as any).__MSW_READY__ = true;
      
      (window as any).__MSW_DEBUG__ = {
        handlers: handlers.map(h => ({
          method: h.info?.method,
          path: h.info?.path,
        })),
        timestamp: new Date().toISOString()
      };
    }
    
    return true;
  } catch (error) {
    console.error('❌ 启动MSW时出错:', error);
    
    // 设置MSW初始化失败标志
    if (typeof window !== 'undefined') {
      (window as any).__MSW_READY__ = false;
    }
    
    return false;
  }
};