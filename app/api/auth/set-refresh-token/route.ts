import { NextRequest, NextResponse } from 'next/server';

/**
 * 设置HTTP-only刷新令牌Cookie
 * 
 * 该API接收刷新令牌并将其设置为HTTP-only Cookie
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未提供令牌' },
        { status: 400 }
      );
    }
    
    // 创建响应
    const response = NextResponse.json({ success: true });
    
    // 设置HTTP-only Cookie
    response.cookies.set({
      name: 'refreshToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7天有效期
    });
    
    return response;
  } catch (error) {
    console.error('设置刷新令牌失败:', error);
    
    return NextResponse.json(
      { success: false, message: '设置刷新令牌失败', error: String(error) },
      { status: 500 }
    );
  }
}