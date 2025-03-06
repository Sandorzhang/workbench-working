import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 排除的路径
const EXCLUDED_PATHS = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/static',
];

// 设置API请求的头部信息
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 跳过对静态资源的请求
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 记录所有API请求
  if (pathname.includes('/api/')) {
    console.log('[Middleware] API请求:', request.method, pathname);
    
    // 检查认证头信息
    const authHeader = request.headers.get('authorization');
    console.log('[Middleware] 认证头信息:', authHeader || '无认证头');
    
    // 获取并记录所有请求头
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('[Middleware] 请求头:', JSON.stringify(headers));
  }
  
  return NextResponse.next();
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
  ],
}; 