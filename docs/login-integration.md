# 登录集成指南

本文档介绍如何将前端登录功能与后端API进行集成，以及如何在不同环境中配置和测试登录功能。

## 环境配置

项目支持三种环境配置：

1. **开发环境（Development）**
   - 使用MSW进行API模拟
   - 配置文件：`.env.development`
   - 启动命令：`npm run dev:msw`

2. **测试环境（Test）**
   - 使用真实API
   - 配置文件：`.env.test`
   - 启动命令：`npm run dev:test`

3. **生产环境（Production）**
   - 使用真实API
   - 配置文件：`.env.production`
   - 启动命令：`npm run dev:prod`或`npm run build:prod && npm run start`

## 登录功能集成

登录功能已与真实后端API进行集成，主要包括以下功能：

1. **账号密码登录**
   - 请求地址：`/auth/backend/login`
   - 请求方式：`POST`
   - 请求参数：
     ```json
     {
       "identity": "用户名",
       "verify": "密码",
       "type": "ACCOUNT"
     }
     ```

2. **获取当前用户信息**
   - 请求地址：`/auth/backend/me`
   - 请求方式：`GET`
   - 请求头：需要包含有效的 `Authorization: Bearer <accessToken>`

3. **手机验证码登录** (暂时使用MSW模拟)
   - 请求地址：`/auth/login-with-code`
   - 请求方式：`POST`
   - 请求参数：
     ```json
     {
       "phone": "手机号",
       "code": "验证码"
     }
     ```

3. **发送短信验证码** (暂时使用MSW模拟)
   - 请求地址：`/auth/send-code`
   - 请求方式：`POST`
   - 请求参数：
     ```json
     {
       "phone": "手机号"
     }
     ```

## 响应数据结构

登录成功后的响应数据结构如下：

```json
{
  "code": 0,
  "msg": "成功",
  "data": {
    "accessToken": "令牌",
    "refreshToken": "刷新令牌",
    "user": {
      "id": "用户ID",
      "name": "用户名称",
      "gender": null,
      "avatar": null,
      "phoneNumber": null,
      "email": null,
      "school": null,
      "role": {
        "id": "角色ID",
        "name": "角色名称"
      },
      "password": "密码哈希",
      "account": "账号",
      "schoolId": "学校ID",
      "schoolName": "学校名称",
      // 其他用户信息...
    },
    "school": {
      "id": "学校ID",
      "name": "学校名称",
      "logo": "学校Logo",
      "period": "学校阶段"
    },
    "terminal": "终端类型",
    "terminalList": ["可用终端列表"],
    "permissions": ["权限列表"],
    "role": {
      "id": "角色ID",
      "name": "角色名称",
      "weight": null,
      "description": null,
      "userId": null,
      "isBuiltIn": true,
      "terminal": "终端类型"
    },
    "roleList": [
      // 角色列表
    ],
    "schoolList": null
  }
}
```

## 如何测试

1. **使用测试环境配置启动项目**

   ```bash
   npm run dev:test
   ```

   这将使用`.env.test`配置文件启动项目，并连接到真实的后端API。

2. **验证登录是否成功**

   - 登录成功后，系统会自动存储`accessToken`和`refreshToken`到`localStorage`中
   - 登录成功后将重定向到工作台页面
   - 可以在浏览器控制台中查看请求和响应日志，确认API调用是否成功

## 登录流程

1. 用户输入账号和密码
2. 前端发送登录请求到后端
3. 后端验证账号和密码
4. 验证成功后，后端返回用户信息、令牌等数据
5. 前端保存令牌和用户信息
6. 前端重定向到工作台页面

## 常见问题排查

1. **登录失败**
   - 检查用户名和密码是否正确
   - 检查API地址是否配置正确
   - 查看浏览器控制台的请求日志和错误信息

2. **令牌失效**
   - 系统会自动清除失效的令牌并重定向到登录页面
   - 如需手动清除令牌，可执行：
     ```javascript
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
     ```

3. **环境配置问题**
   - 确保使用了正确的环境配置命令启动项目
   - 检查`.env.test`文件中的API地址是否正确

## 后端API路径映射

为方便参考，以下是所有与认证相关的API路径映射：

| 功能 | API路径 | 方法 |
|------|---------|------|
| 登录 | `/auth/backend/login` | POST |
| 获取当前用户信息 | `/auth/backend/me` | GET |
| 登出 | `/auth/backend/logout` | POST |
| 发送验证码 | `/auth/send-code` | POST |
| 验证码登录 | `/auth/login-with-code` | POST |

注意：目前后端可能只支持账号密码登录方式（`/auth/backend/login`），其他API路径如验证码登录等可能需要与后端团队确认。

## 用户信息处理

由于后端API中可能不存在`/auth/backend/me`接口，我们采取了以下备选方案：

1. **在登录成功后保存用户信息**：
   - 将用户信息直接从登录响应中保存到localStorage
   - 避免依赖单独的用户信息API

2. **多路径尝试获取用户信息**：
   - 按顺序尝试多个可能的API路径：
     - `/auth/backend/me`
     - `/auth/me`
     - `/user/current`
     - `/user/info`
     - `/auth/backend/user/current`
     - `/api/auth/me`

3. **降级机制**：
   - 当无法获取用户信息但有有效token时，使用基本用户信息保持登录状态
   - 确保UI不会因为缺少用户信息API而崩溃

这种方法提供了最大的兼容性，确保即使API结构发生变化，登录功能仍能正常工作。 