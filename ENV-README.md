# 环境配置说明

本项目支持三种环境配置：

1. **开发环境（Development）**：使用MSW进行API模拟
2. **测试环境（Test）**：连接到测试服务器的真实API
3. **生产环境（Production）**：连接到生产环境的真实API

## 环境变量文件

项目包含三个环境变量文件：

- `.env.development` - 开发环境配置，启用MSW模拟
- `.env.test` - 测试环境配置，连接测试服务器API
- `.env.production` - 生产环境配置，连接生产环境API

## 如何切换环境

### 开发时切换环境

使用以下命令在开发时切换不同的环境：

```bash
# 使用MSW模拟API（默认开发环境）
npm run dev:msw

# 使用测试服务器API
npm run dev:test

# 使用生产环境API
npm run dev:prod
```

### 构建时选择环境

构建项目时可以选择目标环境：

```bash
# 构建测试环境版本
npm run build:test

# 构建生产环境版本
npm run build:prod
```

## 环境变量说明

每个环境文件中包含以下变量：

- `NEXT_PUBLIC_API_MOCKING` - 是否启用API模拟（enabled/disabled）
- `NEXT_PUBLIC_API_BASE_URL` - API基础URL
- `NEXT_PUBLIC_ENV` - 当前环境名称（development/test/production）

## 技术实现

1. 在开发环境中，使用MSW拦截API请求并返回模拟数据
2. 在测试和生产环境中，API请求会被转发到实际的后端服务器
3. 环境变量控制API请求的目标和MSW的启用状态

## 注意事项

- 切换环境后需要重启开发服务器
- 确保测试环境和生产环境的API URL配置正确
- 在提交代码前，确保不要包含敏感的API密钥或凭据 