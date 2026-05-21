# Backstage 中后台管理系统设计文档

## 1. 项目概述
这是一个基于现代全栈 TypeScript 架构的个人基金与资产管理系统。

## 2. 技术栈
- **Monorepo 管理**: `pnpm` workspaces
- **前端**: Vue 3, Vite, TypeScript, Element Plus, Pinia, Axios, ECharts
- **后端**: NestJS, TypeScript
- **数据库**: MySQL 8.0
- **ORM**: Prisma
- **认证**: JWT (JSON Web Token)
- **授权**: 基于 RBAC (Role-Based Access Control) 的按钮级权限控制
- **API 文档**: Swagger
- **部署**: Docker, Nginx

## 3. 架构设计
### 3.1 Monorepo 结构
```text
backstage/
├── packages/
│   ├── web/                # Vue 3 前端
│   ├── server/             # NestJS 后端
│   └── shared/             # 共享 TypeScript 类型与枚举
├── pnpm-workspace.yaml
└── docker-compose.yml
```

### 3.2 数据库模型 (Prisma)
- **User**: 用户认证与基本信息。
- **Role**: 角色定义。
- **Menu/Permission**: 导航菜单及操作级权限（如：`user:create`）。
- **UserRole / RoleMenu**: RBAC 多对多关联表。
- **Fund**: 基金元数据。
- **TradeRecord**: 买入/卖出交易历史。
- **AssetSnapshot**: 每日资产快照，用于趋势图表。

### 3.3 安全与权限
- **认证**: JWT 存储在 HTTP-only Cookie 或 LocalStorage。
- **后端授权**: 在 NestJS 中使用自定义 `RolesGuard` 校验数据库中的用户权限。
- **前端授权**: 
  - 基于后端返回菜单数据的动态路由。
  - 使用自定义指令 `v-permission` 实现按钮级访问控制。

## 4. 功能模块
1. **核心管理**: 登录、用户/角色/菜单管理。
2. **基金管理**: 基金的增删改查、净值跟踪。
3. **交易追踪**: 记录交易细节，自动计算盈亏。
4. **数据看板**: 使用 ECharts 可视化资产分布和业绩趋势。

## 5. 实施阶段
- **第一阶段**: 基础设施搭建 (Monorepo 设置, Prisma 初始化, 认证框架搭建)。
- **第二阶段**: RBAC 系统 (用户/角色/菜单管理的前后端开发)。
- **第三阶段**: 业务逻辑 (基金管理与交易记录功能)。
- **第四阶段**: 数据可视化与完善 (看板、日志、Docker 化)。
