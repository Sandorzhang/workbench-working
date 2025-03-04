import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义中间件函数
export function middleware(request: NextRequest) {
  // 获取路径
  const path = request.nextUrl.pathname;

  // 仅记录API请求
  if (path.startsWith('/api/')) {
    console.log(`[Middleware] API请求: ${request.method} ${path}`);
    console.log('[Middleware] 请求头:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  }

  // 继续处理请求
  return NextResponse.next();
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
  ],
}; 