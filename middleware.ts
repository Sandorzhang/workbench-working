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

// 无需认证的API路径
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/login-with-code',
  '/api/auth/send-code',
  '/api/auth/refresh-token',
  '/api/auth/set-refresh-token',
  '/api/auth/clear-refresh-token'
];

// 简单的令牌验证，检查格式是否有效
// 注意：这只是基础验证，更严格的验证需在API处理程序中进行
function isTokenValid(token: string): boolean {
  // 检查令牌长度
  if (!token || token.length < 10) return false;
  
  try {
    // 检查是否为合法JWT格式
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // 检查每个部分是否为有效的Base64
    const isBase64 = (str: string) => {
      try {
        return btoa(atob(str)) === str;
      } catch (err) {
        return false;
      }
    };
    
    // 实际项目中可能需要验证签名，这里仅作格式检查
    return isBase64(parts[0].replace(/-/g, '+').replace(/_/g, '/')) &&
           isBase64(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
  } catch (error) {
    console.error('令牌验证失败:', error);
    return false;
  }
}

// 设置API请求的头部信息
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 跳过对静态资源的请求
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 对API请求进行处理
  if (pathname.includes('/api/')) {
    console.log('[Middleware] API请求:', request.method, pathname);
    
    // 检查是否是公开API
    const isPublicApi = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));
    
    // 非公开API需要认证
    if (!isPublicApi) {
      // 检查认证头信息
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Middleware] 拒绝请求: 缺少或无效的认证头', pathname);
        
        return NextResponse.json(
          { success: false, message: '需要认证', code: 401 },
          { status: 401 }
        );
      }
      
      // 提取令牌
      const token = authHeader.split(' ')[1];
      
      // 基础令牌格式验证
      if (!isTokenValid(token)) {
        console.log('[Middleware] 拒绝请求: 令牌格式无效', pathname);
        
        return NextResponse.json(
          { success: false, message: '无效的认证令牌', code: 401 },
          { status: 401 }
        );
      }
      
      console.log('[Middleware] 请求已通过令牌验证:', pathname);
    } else {
      console.log('[Middleware] 公开API无需认证:', pathname);
    }
    
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