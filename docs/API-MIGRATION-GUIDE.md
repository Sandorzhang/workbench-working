# API 迁移指南

本文档提供了将现有API实现迁移到新API结构的步骤和示例。

## 迁移步骤

### 1. 为功能模块创建API客户端

在对应的功能模块目录下创建`api/client.ts`文件：

```
mkdir -p features/[feature-name]/api
touch features/[feature-name]/api/client.ts
```

### 2. 实现API客户端

按照以下模板实现API客户端：

```typescript
/**
 * Client-side API methods for [feature-name]
 */
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { Type1, Type2 } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = '[feature-name]';

/**
 * [feature-name] API client with standardized paths
 */
export const featureNameApi = {
  /**
   * API方法的说明
   */
  methodName: async (param1: string, param2: number): Promise<ApiResponse<Type1>> => {
    return handleRequest(buildApiPath(FEATURE, `/endpoint/${param1}?param2=${param2}`));
  },

  /**
   * 带有请求体的POST示例
   */
  createItem: async (data: Type2): Promise<ApiResponse<Type1>> => {
    return handleRequest(
      buildApiPath(FEATURE, '/items'),
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }
};
```

### 3. 更新`shared/api/index.ts`

将新的API客户端添加到统一导出中：

```typescript
// shared/api/index.ts
// ...现有的导入

// 添加新的功能模块API
import { featureNameApi } from '@/features/feature-name/api/client';

// 更新统一导出
export const api = {
  // ...现有API
  featureName: featureNameApi
};
```

### 4. 更新使用API的组件

将组件中的API调用更新为使用新的API客户端：

**旧版本:**
```typescript
// 从独立文件导入API
import { someApiFunction } from '@/lib/api-feature-name';

// 使用API
const data = await someApiFunction(param);
```

**新版本:**
```typescript
// 从统一API导出中导入
import { api } from '@/shared/api';

// 使用新的API客户端
const response = await api.featureName.methodName(param);
const data = response.data;
```

## 迁移示例

### 示例：从`lib/api-academic-journey.ts`迁移到`features/academic-journey/api/client.ts`

**旧版本 (lib/api-academic-journey.ts):**
```typescript
import { StandardsResponse } from '@/types/academic-journey';

export async function getLearningStandards(): Promise<StandardsResponse> {
  const response = await fetch('/api/academic-journey/standards');
  
  if (!response.ok) {
    throw new Error('Failed to fetch learning standards');
  }
  
  return response.json();
}
```

**新版本 (features/academic-journey/api/client.ts):**
```typescript
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/api/core';
import { StandardsResponse } from '../types';

const FEATURE = 'academic-journey';

export const academicJourneyApi = {
  getLearningStandards: async (): Promise<ApiResponse<StandardsResponse>> => {
    return handleRequest(buildApiPath(FEATURE, '/standards'));
  }
};
```

**组件中的使用:**
```typescript
// 旧版本
import { getLearningStandards } from '@/lib/api-academic-journey';

const fetchData = async () => {
  const data = await getLearningStandards();
  // 使用data...
};

// 新版本
import { api } from '@/shared/api';

const fetchData = async () => {
  const response = await api.academicJourney.getLearningStandards();
  const data = response.data;
  // 使用data...
};
```

## 迁移检查清单

1. [ ] 确保所有功能模块都有自己的API客户端实现
2. [ ] 确保所有API客户端都已添加到统一导出中
3. [ ] 确保所有组件都已更新为使用新的API客户端
4. [ ] 确保所有响应处理都已适配新的响应格式 (data.xxx -> response.data.xxx)
5. [ ] 删除旧的API实现文件 