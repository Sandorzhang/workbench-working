export default async function initMocks() {
  // 仅在浏览器环境中初始化MSW
  if (typeof window !== 'undefined') {
    try {
      console.log('⏳ 开始初始化MSW...');
      
      // 检查service worker注册
      if (!('serviceWorker' in navigator)) {
        throw new Error('浏览器不支持Service Worker');
      }
      
      // 浏览器环境
      const { worker } = await import('./browser');
      
      // 更新worker启动配置
      await worker.start({
        // 使用"warn"而不是"bypass"可以减少未处理请求的警告
        onUnhandledRequest: (request, print) => {
          // 忽略静态资源和Next.js内部请求
          if (
            request.url.pathname.includes('/_next/') || 
            request.url.pathname.includes('.css') ||
            request.url.pathname.includes('.js') ||
            request.url.pathname.includes('.png') ||
            request.url.pathname.includes('.svg') ||
            request.url.pathname.includes('.ico')
          ) {
            return;
          }
          
          // 其他未处理的请求显示警告
          print.warning();
        },
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      
      console.log('🔶 MSW Browser Worker 启动成功');
    } catch (error) {
      console.error('❌ MSW初始化失败:', error);
    }
  } else {
    // 服务器端环境
    console.log('🔄 服务器端MSW不需要初始化Service Worker');
  }
} 