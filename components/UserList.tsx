"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export function UserList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, _setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      // TODO: 从API获取用户列表
      // const data = await userApi.getUsers();
      // setUsers(data);
      setError(null);
    } catch (err) {
      setError("加载用户列表失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(_id: string) {
    try {
      // await userApi.deleteUser(id);
      // 重新加载用户列表
      loadUsers();
    } catch (err) {
      console.error("删除用户失败", err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <Button onClick={loadUsers}>重试</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">用户列表</h2>

      {users.length === 0 ? (
        <p>没有用户</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p>{user.email}</p>
                    <p className="text-sm text-gray-500">
                      加入时间: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id)}
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
