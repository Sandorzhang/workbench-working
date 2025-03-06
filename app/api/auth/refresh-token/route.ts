import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/features/auth/api/client';

export async function POST(request: NextRequest) {
  try {
    // 从请求的 Cookie 中获取刷新令牌
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: '刷新令牌不存在或已过期' },
        { status: 401 }
      );
    }

    // 调用 API 刷新令牌
    const response = await authApi.refreshToken(refreshToken);

    if (!response.success || response.code !== 0) {
      // 令牌无效，清除 Cookie
      const errorResponse = NextResponse.json(
        { success: false, message: '刷新令牌无效' },
        { status: 401 }
      );
      
      // 清除 Cookie
      errorResponse.cookies.set({
        name: 'refreshToken',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });
      
      return errorResponse;
    }

    // 获取新的令牌
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 更新刷新令牌 Cookie
    const successResponse = NextResponse.json({ 
      success: true,
      accessToken,
    });
    
    // 设置新的刷新令牌
    successResponse.cookies.set({
      name: 'refreshToken',
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 天
      path: '/',
    });

    return successResponse;
  } catch (error) {
    console.error('刷新令牌失败:', error);
    return NextResponse.json(
      { success: false, message: '刷新令牌过程中出错' },
      { status: 500 }
    );
  }
}