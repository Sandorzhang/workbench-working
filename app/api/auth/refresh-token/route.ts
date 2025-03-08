import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/features/auth/api/client';

/**
 * 刷新访问令牌接口
 * 
 * 从HTTP-only Cookie中获取刷新令牌并请求新的访问令牌
 * 客户端通过tokenService.refreshAccessToken()调用
 */
export async function POST(request: NextRequest) {
  try {
    // 从Cookie获取刷新令牌
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: '刷新令牌不存在或已过期' },
        { status: 401 }
      );
    }
    
    // 使用刷新令牌获取新的访问令牌
    const response = await authApi.refreshToken(refreshToken);
    
    if (!response.success) {
      // 刷新令牌无效或过期，清除Cookie
      const errorResponse = NextResponse.json(
        { message: '刷新令牌已失效，请重新登录' },
        { status: 401 }
      );
      
      errorResponse.cookies.set({
        name: 'refreshToken',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0, // 立即过期
      });
      
      return errorResponse;
    }
    
    const data = response.data;
    
    // 创建成功响应
    const successResponse = NextResponse.json({
      accessToken: data.accessToken,
      success: true
    });
    
    // 如果存在新的刷新令牌，更新Cookie
    if (data.refreshToken) {
      successResponse.cookies.set({
        name: 'refreshToken',
        value: data.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7天有效期
      });
    }
    
    return successResponse;
  } catch (error) {
    console.error('刷新令牌处理失败:', error);
    
    return NextResponse.json(
      { message: '刷新令牌处理失败', error: String(error) },
      { status: 500 }
    );
  }
}