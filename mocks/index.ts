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
      
      // 不再自动清除旧的Service Worker，避免循环重载
      // 只在开发环境中初始化MSW
      await worker.start({
        onUnhandledRequest: 'bypass',
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