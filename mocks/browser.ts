import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 日志输出所有处理器，便于调试
console.log('📊 MSW已载入以下handlers:', handlers.length);
handlers.forEach((handler, index) => {
  console.log(`${index + 1}. ${handler.info.method} ${handler.info.path}`);
});

// 创建worker
export const worker = setupWorker(...handlers);

// 添加事件监听，添加安全检查
worker.events.on('request:start', ({ request }) => {
  // 排除静态资源请求的日志
  if (!request.url.includes('/_next/')) {
    console.log(`🔶 MSW拦截到请求: ${request.method} ${request.url}`);
  }
});

worker.events.on('request:end', ({ request, response }) => {
  // 添加安全检查，确保response存在
  if (response && !request.url.includes('/_next/')) {
    console.log(`✅ MSW已处理请求: ${request.method} ${request.url} (${response.status})`);
  }
});

worker.events.on('unhandled:request', ({ request }) => {
  // 排除静态资源请求的警告
  if (!request.url.includes('/_next/')) {
    console.warn(`⚠️ MSW未拦截请求: ${request.method} ${request.url}`);
  }
}); 