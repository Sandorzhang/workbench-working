# API Design & Implementation Guide

本文档介绍了基于 MSW(Mock Service Worker)实现的 API 设计和使用方法。这些 API 用于支持包括用户认证、工作台配置、智能体交互、日历事件和教案管理等功能。

## 环境配置

系统使用环境变量来配置 API 基础 URL 和 MSW 设置：

| 环境变量               | 说明         | 开发环境默认值              | 生产环境默认值 |
| ---------------------- | ------------ | --------------------------- | -------------- |
| NEXT_PUBLIC_API_URL    | API 基础 URL | http://192.168.10.75/server | /              |
| NEXT_PUBLIC_ENABLE_MSW | 是否启用 MSW | true                        | false          |

环境变量配置文件：

- `.env` - 默认配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## API 概览

以下是实现的主要 API 端点:

### 1. 用户认证 API

| 接口 | 路径              | 方法 | 描述                 |
| ---- | ----------------- | ---- | -------------------- |
| 登录 | `/api/auth/login` | POST | 用户登录并获取 token |

### 2. 工作台配置 API

| 接口           | 路径                                | 方法 | 描述                           |
| -------------- | ----------------------------------- | ---- | ------------------------------ |
| 获取工作台配置 | `/api/workbench-config`             | GET  | 根据用户角色获取工作台模块配置 |
| 获取模块详情   | `/api/workbench-config/:id`         | GET  | 获取特定模块的详细信息         |
| 更新偏好设置   | `/api/workbench-config/preferences` | POST | 更新用户的工作台偏好设置       |

### 3. 智能体 API

| 接口           | 路径                   | 方法 | 描述                       |
| -------------- | ---------------------- | ---- | -------------------------- |
| 获取智能体列表 | `/api/agents`          | GET  | 获取用户可访问的智能体列表 |
| 获取智能体详情 | `/api/agents/:id`      | GET  | 获取特定智能体的详情       |
| 智能体对话     | `/api/agents/:id/chat` | POST | 与特定智能体进行对话       |

### 4. 日历事件 API

| 接口         | 路径                       | 方法   | 描述             |
| ------------ | -------------------------- | ------ | ---------------- |
| 获取日历事件 | `/api/calendar-events`     | GET    | 获取日历事件列表 |
| 创建日历事件 | `/api/calendar-events`     | POST   | 创建新的日历事件 |
| 更新日历事件 | `/api/calendar-events/:id` | PUT    | 更新特定日历事件 |
| 删除日历事件 | `/api/calendar-events/:id` | DELETE | 删除特定日历事件 |

### 5. 单课教案 API

| 接口         | 路径                      | 方法   | 描述                       |
| ------------ | ------------------------- | ------ | -------------------------- |
| 获取教案列表 | `/api/teaching-plans`     | GET    | 获取单课教案列表(支持分页) |
| 获取教案详情 | `/api/teaching-plans/:id` | GET    | 获取特定单课教案的详情     |
| 创建教案     | `/api/teaching-plans`     | POST   | 创建新的单课教案           |
| 更新教案     | `/api/teaching-plans/:id` | PUT    | 更新特定单课教案           |
| 删除教案     | `/api/teaching-plans/:id` | DELETE | 删除特定单课教案           |

### 6. 单元教案 API

| 接口             | 路径                        | 方法   | 描述                       |
| ---------------- | --------------------------- | ------ | -------------------------- |
| 获取单元教案列表 | `/api/teaching-designs`     | GET    | 获取单元教案列表(支持分页) |
| 获取单元教案详情 | `/api/teaching-designs/:id` | GET    | 获取特定单元教案的详情     |
| 创建单元教案     | `/api/teaching-designs`     | POST   | 创建新的单元教案           |
| 更新单元教案     | `/api/teaching-designs/:id` | PUT    | 更新特定单元教案           |
| 删除单元教案     | `/api/teaching-designs/:id` | DELETE | 删除特定单元教案           |

## 认证机制

所有 API 除登录外都需要在请求头中提供 Bearer 令牌:

```
Authorization: Bearer <token>
```

登录 API 会返回 token，客户端需要将其存储在 localStorage 中，并在后续请求中附加到请求头。

## 前端使用示例

已创建`api/auth.ts`文件提供了封装好的 API 调用函数：

```typescript
// 登录示例
import { login } from "../api/auth";

async function loginUser(username: string, password: string) {
  try {
    const result = await login(username, password);
    // 登录成功，处理返回结果
    //console.log("登录成功:", result);
  } catch (error) {
    // 处理错误
    console.error("登录失败:", error);
  }
}

// 获取工作台配置示例
async function getWorkbenchConfig() {
  try {
    const config = await api.workbench.getConfig();
    // 处理工作台配置
    //console.log("工作台配置:", config);
  } catch (error) {
    console.error("获取配置失败:", error);
  }
}

// 获取智能体列表示例
async function getAgents() {
  try {
    const response = await api.agents.getList();
    // 处理智能体列表
    //console.log("智能体列表:", response.agents);
  } catch (error) {
    console.error("获取智能体失败:", error);
  }
}

// 获取教案列表示例(带分页)
async function getTeachingPlans(page = 1, pageSize = 10) {
  try {
    const response = await api.teachingPlans.getList(page, pageSize);
    // 处理教案列表
    //console.log("教案列表:", response.plans);
    //console.log("总数:", response.total);
  } catch (error) {
    console.error("获取教案失败:", error);
  }
}
```

## 数据模型

详细的类型定义在`lib/api-types.ts`文件中，包括:

- 用户(User)
- 工作台模块(WorkbenchModule)
- 智能体(Agent)
- 日历事件(CalendarEvent)
- 教案(TeachingPlan)

## MSW Mock 实现

所有 API 使用 MSW 进行模拟，实现文件位于:

- `mocks/handlers/auth.ts` - 认证相关 API
- `mocks/handlers/workbench.ts` - 工作台配置 API
- `mocks/handlers/agents.ts` - 智能体相关 API
- `mocks/handlers/calendar.ts` - 日历事件 API
- `mocks/handlers/teaching-plans.ts` - 教案相关 API

## 角色和权限

系统定义了三种角色:

1. **admin** - 管理员，可访问所有功能
2. **teacher** - 教师，可访问教学相关功能
3. **student** - 学生，访问有限的功能

不同角色能看到的工作台模块不同，通过`workbench.ts`中的`visibleTo`属性控制。

## 错误处理

所有 API 遵循统一的错误响应格式:

```json
{
  "message": "错误描述",
  "code": "错误代码",
  "details": {
    /* 详细错误信息 */
  }
}
```

常见 HTTP 状态码:

- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器错误

## 开发建议

1. 使用`lib/api.ts`中的函数进行 API 调用
2. 异步请求时使用 try-catch 处理可能的错误
3. 登录后将 token 存储在 localStorage 中
4. 注销时清除 localStorage 中的 token
5. 表单提交前进行客户端验证，减少无效请求
