'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 特别检查JSON解析错误
    if (error.message.includes('Unexpected token')) {
      console.error('检测到JSON解析错误，可能是API返回了HTML而不是JSON');
      console.error('错误消息:', error.message);
      
      // 尝试提取更多信息
      if (error.stack) {
        const stack = error.stack;
        console.error('错误调用栈:', stack);
        
        // 尝试从堆栈中提取API URL
        const urlMatch = stack.match(/https?:\/\/[^/]+\/api\/[^\s]+/);
        if (urlMatch) {
          console.error('可能有问题的API请求URL:', urlMatch[0]);
          toast.error(`API请求失败: ${urlMatch[0]}`);
        }
      }
      
      toast.error('API返回了意外的HTML数据而非JSON，请检查控制台');
    }
  }

  public render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 否则使用默认错误UI
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">加载数据时出错</h2>
          <p className="text-red-700 mt-2">{this.state.error?.message || '未知错误'}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 