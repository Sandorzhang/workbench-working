export async function register() {
  // 确保只在服务器端运行
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      console.log('🔶 正在启动服务器端 MSW...');
      
      const { server } = await import('./mocks/node');
      server.listen({ onUnhandledRequest: 'warn' });
      
      console.log('✅ 服务器端 MSW 启动成功');
    }
  }
} 