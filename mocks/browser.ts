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
  const authEndpoints = [
    { pattern: '/api/auth/login', method: 'POST' },
    { pattern: '/api/auth/me', method: 'GET' },
    { pattern: '/api/auth/logout', method: 'POST' }
  ];
  
  // 调试所有处理程序信息
  console.log('正在检查处理程序详情...');
  handlers.forEach((handler: any, index) => {
    try {
      if (handler && handler.info) {
        const { method, path } = handler.info;
        if (method && path) {
          console.log(`处理程序 #${index}: ${method} ${path}`);
        } else {
          console.log(`处理程序 #${index}: 无法提取method/path信息`, handler);
        }
      }
    } catch (err) {
      console.warn(`无法检查处理程序 #${index}`, err);
    }
  });
  
  authEndpoints.forEach(endpoint => {
    let hasHandler = false;
    
    for (let i = 0; i < handlers.length; i++) {
      try {
        const handler = handlers[i];
        
        // MSW v2格式 - 使用handler.info
        if (handler && handler.info) {
          const { method, path } = handler.info;
          
          if (method === endpoint.method) {
            // 检查路径是否匹配 - MSW v2 中path可能是RegExp或字符串
            let pathMatches = false;
            
            // 将path转换为字符串进行比较
            const pathStr = String(path);
            
            pathMatches = 
              pathStr === endpoint.pattern || 
              pathStr.includes(endpoint.pattern) ||
              (pathStr.includes('*') && endpoint.pattern.includes(pathStr.replace('*', '')));
              
            if (pathMatches) {
              hasHandler = true;
              console.log(`✓ 已找到 ${endpoint.method} ${endpoint.pattern} 处理程序: ${pathStr}`);
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
  
  // 特别检查登录处理程序 - 最重要的功能
  const loginHandlers = handlers.filter((handler: any) => {
    try {
      if (handler && handler.info) {
        const { method, path } = handler.info;
        const pathStr = String(path);
        return method === 'POST' && (
          pathStr === '/api/auth/login' || 
          pathStr.includes('/api/auth/login') || 
          pathStr === '*/api/auth/login'
        );
      }
      return false;
    } catch (err) {
      return false;
    }
  });
  
  if (loginHandlers.length > 0) {
    console.log(`找到 ${loginHandlers.length} 个登录处理程序`);
  } else {
    console.error('⚠️ 警告: 未找到登录处理程序! 这将导致登录功能失败!');
  }
  
  return true;
};

// 验证handlers配置
validateHandlers();

// 创建worker - MSW v2 setup
export const worker = setupWorker(...handlers);

// 输出调试信息
console.log('MSW browser worker已创建，准备启动');