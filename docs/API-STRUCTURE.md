# API 结构指南

本文档描述了项目中API的组织结构和实现规范。

## 目录结构

```
└── features/
    └── [feature-name]/
        ├── api/
        │   ├── client.ts    # 客户端API实现
        │   └── server.ts    # 服务器端API实现(可选)
        ├── types.ts         # 类型定义
        ├── components/      # 特定功能组件
        ├── hooks/           # 特定功能钩子
        └── lib/             # 特定功能工具函数
└── shared/
    ├── api/
    │   ├── core.ts          # 核心API功能
    │   └── index.ts         # 统一导出所有API
    ├── lib/                 # 共享工具
    └── types/               # 共享类型
```

## API 实现规范

### 1. 核心API功能 (`shared/api/core.ts`)

包含共享的API处理功能:
- `buildApiPath`: 构建标准化API路径
- `handleRequest`: 处理API请求，包含错误处理逻辑
- `getAuthHeaders`: 获取认证头信息
- 接口定义: `ApiResponse<T>` 和 `ApiErrorResponse`

### 2. 功能模块API客户端 (`features/[feature-name]/api/client.ts`)

每个功能模块应该有自己的API客户端实现，例如：

```typescript
// features/academic-journey/api/client.ts
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { SomeType } from '../types';

const FEATURE = 'feature-name';

export const featureNameApi = {
  getAll: (): Promise<ApiResponse<SomeType[]>> => {
    return handleRequest(buildApiPath(FEATURE, '/endpoint'));
  },
  
  getById: (id: string): Promise<ApiResponse<SomeType>> => {
    return handleRequest(buildApiPath(FEATURE, `/${id}`));
  }
};
```

### 3. 统一API导出 (`shared/api/index.ts`)

所有功能模块的API客户端统一在此导出:

```typescript
export * from './core';

// 导入所有功能模块API
import { featureOneApi } from '@/features/feature-one/api/client';
import { featureTwoApi } from '@/features/feature-two/api/client';

// 统一导出
export const api = {
  featureOne: featureOneApi,
  featureTwo: featureTwoApi
};
```

### 4. 在组件中使用API

```typescript
import { api } from '@/shared/api';

function MyComponent() {
  const fetchData = async () => {
    try {
      const response = await api.featureName.getAll();
      // response.data 包含API响应数据
      // response.success 表示请求是否成功
    } catch (error) {
      // 处理错误
    }
  };
}
```

## API响应格式

所有API响应都应该遵循标准格式:

```typescript
interface ApiResponse<T> {
  data: T;          // 具体的响应数据
  code: number;     // 状态码，通常和HTTP状态码一致
  message: string;  // 状态消息
  success: boolean; // 请求是否成功
}
```

## 错误处理

API错误响应遵循标准格式:

```typescript
interface ApiErrorResponse {
  message: string;       // 错误消息
  code: string;          // 错误代码
  details?: any;         // 错误详情(可选)
}
```

## 路径规范

API路径应该遵循以下格式:

```
/api/[feature-name]/[endpoint]
```

例如:
- `/api/academic-journey/standards`
- `/api/academic-journey/classes/123/students` 