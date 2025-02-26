"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestMswPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testUserApi() {
    try {
      setLoading(true);
      setError(null);
      
      // 测试获取用户列表
      const response = await fetch('/api/users');
      const users = await response.json();
      
      setData({
        endpoint: '/api/users',
        status: response.status,
        data: users
      });
      
    } catch (err) {
      setError('API请求失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">MSW测试页面</h1>
      
      <div className="flex space-x-4">
        <Button 
          onClick={testUserApi} 
          disabled={loading}
        >
          {loading ? '请求中...' : '测试用户API'}
        </Button>
      </div>
      
      {error && (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
      
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>API响应: {data.endpoint}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">状态码: {data.status}</p>
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(data.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>MSW配置验证指南</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>如果MSW配置成功，你应该能看到：</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>浏览器控制台显示 "🔶 MSW Worker started" 消息</li>
            <li>点击"测试用户API"按钮后，返回模拟的用户数据</li>
            <li>网络请求被拦截（在开发者工具的Network标签中, 请求被标记为"Mocked"）</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
} 