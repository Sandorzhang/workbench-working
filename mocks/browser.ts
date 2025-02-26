import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 日志输出所有处理器，便于调试
console.log('📊 MSW已载入以下handlers:', handlers.length);
handlers.forEach((handler, index) => {
  console.log(`${index + 1}. ${handler.info.method} ${handler.info.path}`);
});

// 创建worker
export const worker = setupWorker(...handlers);

// 添加事件监听
worker.events.on('request:start', ({ request }) => {
  console.log(`🔶 MSW拦截到请求: ${request.method} ${request.url}`);
});

worker.events.on('request:end', ({ request, response }) => {
  console.log(`✅ MSW已处理请求: ${request.method} ${request.url} (${response.status})`);
});

worker.events.on('unhandled:request', ({ request }) => {
  console.warn(`⚠️ MSW未拦截请求: ${request.method} ${request.url}`);
}); 