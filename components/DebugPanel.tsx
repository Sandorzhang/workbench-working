'use client';

import React, { useState, useEffect } from 'react';

interface ApiRequest {
  method: string;
  url: string;
  timestamp: Date;
  status?: number;
  error?: string;
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [isRecording, setIsRecording] = useState(true);

  // 设置全局API请求监听
  useEffect(() => {
    if (!isRecording) return;

    // 保存原始fetch函数
    const originalFetch = window.fetch;

    // 重写fetch以记录所有API请求
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // 正确处理不同类型的input
      const url = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.href
          : input.url;
      
      // 只记录API请求
      if (url.includes('/api/')) {
        const method = init?.method || 'GET';
        const request: ApiRequest = { 
          method, 
          url, 
          timestamp: new Date() 
        };
        
        try {
          const response = await originalFetch(input, init);
          // 克隆响应以避免消耗其body
          const clone = response.clone();
          request.status = clone.status;
          
          // 尝试解析响应，看是否能正确解析为JSON
          try {
            // 只有当状态码不是204并且Content-Type是JSON时才尝试解析
            const contentType = clone.headers.get('content-type');
            if (clone.status !== 204 && contentType && contentType.includes('application/json')) {
              await clone.json();
            }
          } catch (parseError) {
            request.error = '响应不是有效的JSON';
            console.error(`[DebugPanel] ${method} ${url} 返回的不是有效JSON`, parseError);
          }
          
          setRequests(prev => [request, ...prev].slice(0, 20));
          return response;
        } catch (error) {
          request.error = error instanceof Error ? error.message : '请求失败';
          setRequests(prev => [request, ...prev].slice(0, 20));
          throw error;
        }
      }
      
      // 不是API请求，正常处理
      return originalFetch(input, init);
    };

    // 清理函数，恢复原始fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [isRecording]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs z-[9999] rounded-bl"
      >
        调试
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-96 max-h-[80vh] overflow-auto bg-gray-800 text-white p-4 z-[9999] rounded-bl-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-bold">API 请求调试</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsRecording(!isRecording)} 
            className={`px-2 py-1 rounded text-xs ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {isRecording ? '停止记录' : '开始记录'}
          </button>
          <button 
            onClick={() => setRequests([])} 
            className="px-2 py-1 rounded bg-blue-500 text-xs"
          >
            清除
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="px-2 py-1 rounded bg-gray-500 text-xs"
          >
            关闭
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {requests.length === 0 ? (
          <div className="text-gray-400 text-sm">尚无记录的API请求</div>
        ) : (
          requests.map((req, index) => (
            <div key={index} className={`p-2 rounded text-xs ${req.error ? 'bg-red-800' : req.status && req.status >= 400 ? 'bg-orange-800' : 'bg-gray-700'}`}>
              <div className="flex justify-between">
                <span className="font-mono">{req.method} {new URL(req.url).pathname}</span>
                <span className="text-gray-400">{req.timestamp.toLocaleTimeString()}</span>
              </div>
              {req.status && (
                <div className="mt-1">
                  状态: <span className={req.status >= 400 ? 'text-red-400' : 'text-green-400'}>{req.status}</span>
                </div>
              )}
              {req.error && (
                <div className="mt-1 text-red-400">错误: {req.error}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 