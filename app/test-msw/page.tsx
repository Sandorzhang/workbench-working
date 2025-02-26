"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestMswPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swStatus, setSwStatus] = useState<'checking' | 'registered' | 'not-found'>('checking');

  useEffect(() => {
    // 检查Service Worker注册状态
    async function checkServiceWorker() {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const hasMockSw = registrations.some(reg => 
            reg.active && reg.active.scriptURL.includes('mockServiceWorker.js')
          );
          
          setSwStatus(hasMockSw ? 'registered' : 'not-found');
        } else {
          setSwStatus('not-found');
        }
      } catch (err) {
        console.error('检查Service Worker失败:', err);
        setSwStatus('not-found');
      }
    }
    
    // 设置延迟，避免与初始化冲突
    const timer = setTimeout(checkServiceWorker, 1000);
    return () => clearTimeout(timer);
  }, []);

  async function testUserApi() {
    try {
      setLoading(true);
      setError(null);
      
      // 记录请求开始
      console.log('🚀 发送API请求: /api/users');
      
      // 使用更多选项确保不使用缓存
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
        },
      });
      
      console.log('📥 收到响应:', response);
      console.log('📥 响应状态:', response.status);
      console.log('📥 响应头:', Object.fromEntries([...response.headers.entries()]));
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const users = await response.json();
        setData({
          endpoint: '/api/users',
          status: response.status,
          contentType,
          data: users
        });
      } else {
        // 如果不是JSON，获取文本内容用于调试
        const text = await response.text();
        throw new Error(`非JSON响应 (${contentType}): ${text.slice(0, 100)}...`);
      }
    } catch (err) {
      setError('API请求失败: ' + (err instanceof Error ? err.message : String(err)));
      console.error('API请求错误:', err);
    } finally {
      setLoading(false);
    }
  }

  async function resetServiceWorker() {
    try {
      setLoading(true);
      setError(null);
      
      // 清除所有已注册的Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('🧹 已清除所有Service Workers');
        
        // 不再自动重载，而是显示成功消息
        setError('已清除Service Worker，点击"手动刷新页面"按钮重新加载');
      }
    } catch (err) {
      setError('重置Service Worker失败: ' + (err instanceof Error ? err.message : String(err)));
      console.error('重置错误:', err);
    } finally {
      setLoading(false);
    }
  }

  // 添加一个手动刷新页面的函数
  function refreshPage() {
    window.location.reload();
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">MSW测试页面</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>MSW状态检查</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-bold">Service Worker状态: </span>
              {swStatus === 'checking' && '检查中...'}
              {swStatus === 'registered' && '✅ 已注册'}
              {swStatus === 'not-found' && '❌ 未注册'}
            </p>
            {swStatus === 'not-found' && (
              <div className="bg-yellow-100 p-3 rounded-md text-yellow-800">
                <p className="font-bold">未检测到MSW Service Worker</p>
                <p>确保已运行: npx msw init public/ --save</p>
                <p>并重新加载页面</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex space-x-4">
        <Button 
          onClick={testUserApi} 
          disabled={loading}
        >
          {loading ? '请求中...' : '测试用户API'}
        </Button>
        
        <Button 
          onClick={resetServiceWorker}
          variant="outline"
          disabled={loading}
        >
          重置Service Worker
        </Button>
        
        <Button 
          onClick={refreshPage}
          variant="secondary"
        >
          手动刷新页面
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
            <p className="mb-2">Content-Type: {data.contentType}</p>
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
          <CardTitle>调试说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>请检查浏览器控制台，查看是否有以下消息:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>✅ MSW初始化成功</li>
            <li>🔶 MSW拦截到请求</li>
          </ul>
          <p>如果看不到这些消息，可能是MSW未正确初始化。</p>
        </CardContent>
      </Card>
    </div>
  );
} 