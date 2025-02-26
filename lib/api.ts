// 通用fetch封装
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }
  
  return response.json();
}

// 用户API
export const userApi = {
  // 获取所有用户
  getUsers: () => fetcher<any[]>('/api/users'),
  
  // 获取单个用户
  getUser: (id: string) => fetcher<any>(`/api/users/${id}`),
  
  // 创建用户
  createUser: (userData: any) => 
    fetcher<any>('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),
  
  // 更新用户
  updateUser: (id: string, userData: any) => 
    fetcher<any>(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),
  
  // 删除用户
  deleteUser: (id: string) => 
    fetcher<void>(`/api/users/${id}`, {
      method: 'DELETE',
    }),
}; 