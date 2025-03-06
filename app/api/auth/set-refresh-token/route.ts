import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: '刷新令牌无效' },
        { status: 400 }
      );
    }

    // 创建响应
    const response = NextResponse.json({ success: true });
    
    // 在响应中设置 HTTP-only Cookie
    response.cookies.set({
      name: 'refreshToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('设置刷新令牌 Cookie 失败:', error);
    return NextResponse.json(
      { success: false, message: '设置刷新令牌失败' },
      { status: 500 }
    );
  }
}