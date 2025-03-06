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
    { pattern: '/api/auth/me', method: 'GET' },
    { pattern: '/api/auth/logout', method: 'POST' }
  ];
  
  // 调试所有处理程序信息
  console.log('MSW处理程序清单:');
  handlers.forEach((handler: any, index) => {
    try {
      if (handler && handler.info) {
        const { method, path } = handler.info;
        if (method && path) {
          console.log(`${method.toUpperCase()} ${path}`);
        }
      }
    } catch (err) {
      console.warn(`无法检查处理程序 #${index}`, err);
    }
  });
  
  // 验证关键端点
  console.log('\n验证关键API端点:');
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
              (pathStr.includes('*') && endpoint.pattern.includes(pathStr.replace('*', '')));
              
            if (pathMatches) {
              hasHandler = true;
              console.log(`✓ ${endpoint.method} ${endpoint.pattern}`);
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
    }
  });
  
  return true;
};

// 初始化MSW worker
export const worker = setupWorker(...handlers);

// 启动MSW
export const startMSW = async () => {
  // 验证处理程序配置
  validateHandlers();
  
  // 设置响应转换器
  const customHandlers = handlers.map((handler: any) => handler);
  
  // 启动worker
  console.log('正在启动MSW...');
  
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    
    console.log('MSW 已成功启动');
    
    // 在window对象上设置标志
    if (typeof window !== 'undefined') {
      window.__MSW_READY__ = true;
    }
    
    return true;
  } catch (error) {
    console.error('启动MSW时出错:', error);
    return false;
  }
};