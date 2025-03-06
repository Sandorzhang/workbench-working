import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 创建响应
    const response = NextResponse.json({ success: true });
    
    // 在响应中设置过期的 Cookie 来清除它
    response.cookies.set({
      name: 'refreshToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 立即过期
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('清除刷新令牌 Cookie 失败:', error);
    return NextResponse.json(
      { success: false, message: '清除刷新令牌失败' },
      { status: 500 }
    );
  }
}