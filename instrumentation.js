// 这是Next.js的instrumentation入口，用于设置服务器端MSW
export async function register() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      console.log('🔶 正在启动服务器端 MSW...');
      
      try {
        const { server } = await import('./mocks/node');
        server.listen({ onUnhandledRequest: 'warn' });
        console.log('✅ 服务器端 MSW 启动成功');
      } catch (error) {
        console.error('❌ 服务器端 MSW 启动失败:', error);
      }
    }
  }
} 