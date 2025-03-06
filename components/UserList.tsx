"use client";

import { useState, useEffect } from 'react';
import { api } from '@/shared/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// 定义用户类型
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
};

// 模拟用户API服务
const userService = {
  getUsers: async (): Promise<User[]> => {
    // 这里应该调用真实的API，现在我们只是模拟
    // 在实际实现中，你可以替换为正确的API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: '张三',
            email: 'zhangsan@example.com',
            avatar: 'https://i.pravatar.cc/150?img=1',
            createdAt: new Date().toISOString(),
          },
          // 更多用户数据...
        ]);
      }, 1000);
    });
  },
  deleteUser: async (id: string): Promise<void> => {
    // 模拟删除操作
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`删除用户: ${id}`);
        resolve();
      }, 500);
    });
  }
};

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('加载用户列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      // 重新加载用户列表
      handleLoadUsers();
    } catch (err) {
      console.error('删除用户失败', err);
    }
  };

  useEffect(() => {
    handleLoadUsers();
  }, []);

  // 早期返回 - 加载状态
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">用户列表</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 早期返回 - 错误状态
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">用户列表</h2>
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={handleLoadUsers}
            className="mt-2"
            aria-label="重试加载用户列表"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">用户列表</h2>
      
      {users.length === 0 ? (
        <p className="p-4 text-center bg-gray-50 rounded-md">没有用户数据</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <img 
                    src={user.avatar} 
                    alt={`${user.name}的头像`}
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      加入时间: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteUser(user.id)}
                  aria-label={`删除用户 ${user.name}`}
                >
                  删除
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 