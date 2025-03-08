"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function MswDebugPage() {
  const [mswStatus, setMswStatus] = useState<{
    status: 'pending' | 'active' | 'inactive';
    handlers: any[];
    timestamp: string;
  }>({
    status: 'pending',
    handlers: [],
    timestamp: '',
  });
  
  const [loginTest, setLoginTest] = useState({
    username: 'admin',
    password: 'admin',
    loading: false,
    result: null as any,
    error: null as any,
  });

  useEffect(() => {
    // 检查MSW状态
    if (typeof window !== 'undefined') {
      const status = window.__MSW_READY__ ? 'active' : 'inactive';
      const debug = (window as any).__MSW_DEBUG__ || {};
      
      setMswStatus({
        status,
        handlers: debug.handlers || [],
        timestamp: debug.timestamp || '',
      });
    }
  }, []);

  const testMswLogin = async () => {
    setLoginTest(prev => ({ ...prev, loading: true, result: null, error: null }));
    
    try {
      // 直接使用fetch发送请求到登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: loginTest.username,
          verify: loginTest.password,
          type: 'password',
        }),
      });
      
      const data = await response.json();
      
      setLoginTest(prev => ({ 
        ...prev, 
        loading: false, 
        result: data,
      }));
      
      // 如果成功，验证token是否已保存
      if (data.success) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          toast.success('登录成功并已保存令牌');
        } else {
          toast.error('登录成功但未保存令牌');
        }
      } else {
        toast.error(`登录失败: ${data.message}`);
      }
    } catch (error) {
      console.error('测试登录失败:', error);
      setLoginTest(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : String(error) 
      }));
      toast.error('请求失败，可能MSW未拦截请求');
    }
  };

  const activateMsw = () => {
    try {
      localStorage.setItem('msw-enabled', 'true');
      window.location.reload();
    } catch (e) {
      toast.error('激活MSW失败');
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MSW调试面板</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">MSW状态</h2>
          <span className={`px-2 py-1 rounded text-sm ${
            mswStatus.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : mswStatus.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {mswStatus.status === 'active' 
              ? '已启用' 
              : mswStatus.status === 'pending' 
                ? '初始化中'
                : '未启用'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {mswStatus.timestamp && (
            <p>初始化时间: {new Date(mswStatus.timestamp).toLocaleString()}</p>
          )}
          
          {!window.__MSW_READY__ && (
            <div className="mt-2">
              <button 
                onClick={activateMsw}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                激活MSW
              </button>
              <button 
                onClick={refreshPage}
                className="ml-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                刷新页面
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">测试登录</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                value={loginTest.username}
                onChange={e => setLoginTest(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={loginTest.password}
                onChange={e => setLoginTest(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
              />
            </div>
            
            <button
              onClick={testMswLogin}
              disabled={loginTest.loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loginTest.loading ? '测试中...' : '测试登录'}
            </button>
          </div>
          
          {loginTest.error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
              <p className="font-medium">错误</p>
              <p className="text-sm">{loginTest.error}</p>
            </div>
          )}
          
          {loginTest.result && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="font-medium">响应</p>
              <pre className="text-xs overflow-auto mt-2 p-2 bg-gray-800 text-white rounded">
                {JSON.stringify(loginTest.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">本地存储</h2>
          
          <div className="space-y-2">
            {(typeof window !== 'undefined') && (
              <>
                <div>
                  <span className="font-medium text-sm">访问令牌: </span>
                  <span className="text-sm text-gray-600 break-all">
                    {localStorage.getItem('accessToken') || '未设置'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-sm">刷新令牌: </span>
                  <span className="text-sm text-gray-600 break-all">
                    {localStorage.getItem('refreshToken') || '未设置'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-sm">用户信息: </span>
                  <span className="text-sm text-gray-600">
                    {localStorage.getItem('user') 
                      ? '已设置' 
                      : '未设置'}
                  </span>
                  
                  {localStorage.getItem('user') && (
                    <pre className="text-xs overflow-auto mt-1 p-2 bg-gray-800 text-white rounded">
                      {JSON.stringify(JSON.parse(localStorage.getItem('user') || '{}'), null, 2)}
                    </pre>
                  )}
                </div>
                
                <div>
                  <span className="font-medium text-sm">MSW启用状态: </span>
                  <span className="text-sm text-gray-600">
                    {localStorage.getItem('msw-enabled') || '未设置'}
                  </span>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      localStorage.removeItem('user');
                      window.__AUTH_TOKEN__ = undefined;
                      toast.success('已清除所有令牌');
                      setTimeout(() => window.location.reload(), 500);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    清除所有令牌
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">MSW处理程序 ({mswStatus.handlers.length})</h2>
        
        {mswStatus.handlers.length > 0 ? (
          <div className="overflow-auto max-h-96">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">方法</th>
                  <th className="px-4 py-2 text-left">路径</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mswStatus.handlers.map((handler, idx) => (
                  <tr key={idx} className={handler.path?.includes('/api/auth/login') ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2">{handler.method || '未知'}</td>
                    <td className="px-4 py-2 font-mono">{handler.path || '未知'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">未找到处理程序</p>
        )}
      </div>
    </div>
  );
} 