import { NextRequest, NextResponse } from 'next/server';

/**
 * 清除HTTP-only刷新令牌Cookie
 * 
 * 在用户退出登录时调用此接口，清除刷新令牌
 */
export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json({ success: true });
    
    // 清除刷新令牌Cookie
    response.cookies.set({
      name: 'refreshToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // 立即过期
    });
    
    return response;
  } catch (error) {
    console.error('清除刷新令牌失败:', error);
    
    return NextResponse.json(
      { success: false, message: '清除刷新令牌失败', error: String(error) },
      { status: 500 }
    );
  }
}