# 登录逻辑优化文档

本文档总结了针对登录逻辑的优化内容和进一步的优化建议。

## 已实施的优化

### 1. 令牌存储安全增强

**文件**: `shared/auth/token-service.ts`

**优化内容**:
- 将访问令牌主要存储在内存中，增强安全性
- 添加了对localStorage和全局变量存储方式的弃用警告
- 重构了令牌刷新逻辑，优先使用HTTP-only Cookie
- 添加了详细的错误处理和调试日志

**安全提升**:
- 减少了XSS攻击窃取令牌的风险
- 通过HTTP-only Cookie保护刷新令牌
- 保留了向后兼容性，同时推动代码迁移到更安全的方式

### 2. 统一的认证路由保护

**文件**: `components/auth/protected-route.tsx` 

**优化内容**:
- 创建了可复用的`ProtectedRoute`组件和`withAuth`高阶组件
- 统一处理认证检查、角色验证和加载状态
- 支持自定义重定向路径和加载组件

**使用示例**:
```tsx
// 作为组件包装器
<ProtectedRoute>
  <MyPageContent />
</ProtectedRoute>

// 作为高阶组件
export default withAuth(MyPageComponent);

// 带角色限制
<ProtectedRoute requiredRole="admin">
  <AdminOnlyContent />
</ProtectedRoute>
```

### 3. 错误处理优化

**文件**: `app/login/page.tsx`

**优化内容**:
- 创建了集中式错误映射和处理机制
- 统一错误消息格式，提高用户体验
- 从组件中移除MSW初始化相关代码
- 简化了重定向逻辑，使用React状态代替全局变量

### 4. HTTP-only Cookie支持

**新增文件**:
- `app/api/auth/refresh-token/route.ts`
- `app/api/auth/set-refresh-token/route.ts`
- `app/api/auth/clear-refresh-token/route.ts`

**优化内容**:
- 创建API端点处理HTTP-only Cookie的存储和获取
- 实现了安全的令牌刷新机制
- 支持在退出登录时清除Cookie

### 5. 中间件认证保护

**文件**: `middleware.ts`

**优化内容**:
- 增强了中间件以提供API保护
- 添加了令牌验证逻辑
- 实现了公开API路径白名单
- 添加了详细的请求日志记录

**实现细节**:
```typescript
// 检查是否是公开API
const isPublicApi = PUBLIC_API_PATHS.some(path => pathname.startsWith(path));

// 非公开API需要认证
if (!isPublicApi) {
  // 检查认证头信息
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: '需要认证', code: 401 },
      { status: 401 }
    );
  }
  
  // 验证令牌...
}
```

### 6. 登录尝试限制

**文件**: `mocks/handlers/auth.ts`

**优化内容**:
- 实现了登录尝试次数限制
- 添加了IP地址追踪逻辑
- 实现了临时阻止机制
- 自动重置尝试计数

**实现细节**:
```typescript
// 登录尝试限制配置
const MAX_LOGIN_ATTEMPTS = 5;         // 最大尝试次数
const BLOCK_DURATION = 15 * 60 * 1000; // 阻止时长(15分钟)
const ATTEMPT_RESET = 60 * 60 * 1000;  // 尝试重置时间(1小时)

// 检查是否超过最大尝试次数
if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
  attempt.blocked = true;
  attempt.blockExpires = now + BLOCK_DURATION;
  loginAttempts.set(ipAddress, attempt);
  
  return { 
    allowed: false, 
    message: `登录尝试次数过多，请等待 15 分钟后再试`
  };
}
```

### 7. 令牌自动刷新机制

**文件**: `shared/auth/token-service.ts`

**优化内容**:
- 实现了令牌自动刷新机制
- 在令牌过期前自动刷新
- 添加了令牌过期时间解析
- 提供令牌剩余有效期查询功能

**实现细节**:
```typescript
// 设置自动刷新定时器
const setupAutoRefresh = () => {
  // 计算刷新时间（过期前5分钟）
  const FIVE_MINUTES = 5 * 60 * 1000;
  const refreshDelay = Math.min(timeToExpiry - FIVE_MINUTES, timeToExpiry / 2);
  
  refreshTimer = setTimeout(async () => {
    await tokenService.refreshAccessToken();
  }, refreshDelay);
};
```

## 进一步优化建议

### 全局状态库集成

考虑使用React Query或SWR处理API请求：

```typescript
// 使用React Query示例
const { mutate: login, isLoading } = useMutation(
  (credentials) => authApi.login(credentials),
  {
    onSuccess: (data) => {
      // 处理登录成功
    }
  }
);
```

### 双因素认证支持

添加双因素认证支持，进一步提高安全性：

```typescript
// 双因素认证接口
interface TwoFactorAuthRequest {
  userId: string;
  token: string;  // 通常是TOTP令牌
}

// API方法
verifyTwoFactor: async (data: TwoFactorAuthRequest): Promise<ApiResponse<LoginResponse>> => {
  return handleRequest(
    buildApiPath(FEATURE, '/verify-2fa'),
    {
      method: 'POST',
      body: JSON.stringify(data)
    }
  );
}
```

### 用户会话管理

实现多设备登录管理功能：

```typescript
// 获取活跃会话列表
getActiveSessions: async (): Promise<ApiResponse<Array<SessionInfo>>> => {
  return handleRequest(buildApiPath(FEATURE, '/sessions'));
},

// 使指定会话失效
terminateSession: async (sessionId: string): Promise<ApiResponse<{success: boolean}>> => {
  return handleRequest(
    buildApiPath(FEATURE, `/sessions/${sessionId}`),
    { method: 'DELETE' }
  );
}
```

## 结论

所有计划的优化任务均已完成，显著提高了登录系统的安全性和可维护性。建议团队成员在开发中遵循这些最佳实践，逐步淘汰不安全的令牌存储方式。我们应该定期审查安全策略，确保持续改进认证系统。 