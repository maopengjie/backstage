# Backstage 系统第一阶段：基础设施搭建实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建基于 pnpm workspaces 的 Monorepo 基础架构，初始化 NestJS 后端、Vue 3 前端及 Prisma 数据库连接。

**Architecture:** 采用 Monorepo 模式，通过 `packages/shared` 共享类型，`packages/server` 处理业务逻辑，`packages/web` 提供用户界面。

**Tech Stack:** pnpm, NestJS, Vue 3, Vite, Prisma, MySQL.

---

### Task 1: 根目录及 pnpm Workspace 配置

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (Root)
- Create: `.gitignore`

- [ ] **Step 1: 创建 pnpm-workspace.yaml**
```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 2: 创建根目录 package.json**
```json
{
  "name": "backstage-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build"
  }
}
```

- [ ] **Step 3: 创建 .gitignore**
```text
node_modules
dist
.env
packages/server/dist
packages/web/dist
```

- [ ] **Step 4: 提交**
```bash
git add pnpm-workspace.yaml package.json .gitignore
git commit -m "chore: initialize pnpm workspace and root config"
```

---

### Task 2: 初始化 Shared 共享包

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/constants/roles.enum.ts`

- [ ] **Step 1: 创建 shared/package.json**
```json
{
  "name": "@backstage/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

- [ ] **Step 2: 定义共享角色枚举**
```typescript
// packages/shared/src/constants/roles.enum.ts
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}
```

- [ ] **Step 3: 导出共享成员**
```typescript
// packages/shared/src/index.ts
export * from './constants/roles.enum';
```

- [ ] **Step 4: 创建 tsconfig.json 并构建**
```bash
# packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```
运行 `pnpm --filter @backstage/shared build`

- [ ] **Step 5: 提交**
```bash
git add packages/shared
git commit -m "feat: initialize shared package with Role enum"
```

---

### Task 3: 初始化 Server 后端 (NestJS)

**Files:**
- Create: `packages/server/package.json` (via Nest CLI)
- Modify: `packages/server/package.json` (add shared dependency)

- [ ] **Step 1: 使用 Nest CLI 初始化 (假设已安装 nest 或使用 npx)**
```bash
npx @nestjs/cli new packages/server --package-manager pnpm --skip-git
```

- [ ] **Step 2: 添加 shared 包依赖**
```bash
pnpm --filter @backstage/server add @backstage/shared@workspace:*
```

- [ ] **Step 3: 验证引用**
在 `packages/server/src/main.ts` 中尝试 import `{ Role } from '@backstage/shared'`。

- [ ] **Step 4: 提交**
```bash
git add packages/server
git commit -m "feat: initialize nestjs server and link shared package"
```

---

### Task 4: 初始化 Prisma 及数据库连接

**Files:**
- Create: `packages/server/prisma/schema.prisma`
- Create: `packages/server/.env`

- [ ] **Step 1: 安装 Prisma 依赖**
```bash
pnpm --filter @backstage/server add -D prisma
pnpm --filter @backstage/server add @prisma/client
```

- [ ] **Step 2: 初始化 Prisma**
```bash
cd packages/server && npx prisma init
```

- [ ] **Step 3: 定义基础 Schema (RBAC 核心)**
```prisma
// packages/server/prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  roles     UserRole[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Role {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  users     UserRole[]
  menus     RoleMenu[]
}

model UserRole {
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  role      Role     @relation(fields: [roleId], references: [id])
  roleId    Int
  @@id([userId, roleId])
}

model RoleMenu {
  role      Role     @relation(fields: [roleId], references: [id])
  roleId    Int
  menuId    Int
  @@id([roleId, menuId])
}
```

- [ ] **Step 4: 提交**
```bash
git add packages/server/prisma
git commit -m "feat: setup prisma schema for RBAC"
```

---

### Task 5: 初始化 Web 前端 (Vue 3 + Vite)

**Files:**
- Create: `packages/web/package.json` (via Vite)
- Modify: `packages/web/package.json` (add shared dependency)

- [ ] **Step 1: 使用 Vite 创建项目**
```bash
pnpm create vite packages/web --template vue-ts
```

- [ ] **Step 2: 安装基础依赖**
```bash
pnpm --filter @backstage/web install
pnpm --filter @backstage/web add element-plus axios pinia vue-router
pnpm --filter @backstage/web add @backstage/shared@workspace:*
```

- [ ] **Step 3: 配置 Vite 别名 (Optional)**
```typescript
// packages/web/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: 提交**
```bash
git add packages/web
git commit -m "feat: initialize vue 3 web app and link shared package"
```
