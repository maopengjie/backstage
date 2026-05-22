# Backstage 项目开发总结：从零到 Monorepo 基础设施搭建

> **文档创建时间**：2026年5月21日
> **目标阶段**：第一阶段（基础设施搭建）回顾与总结

本系统采用现代化的全栈 TypeScript 架构。为了让你清晰地理解整个架构的运作方式，这份文档总结了我们从零开始执行的所有关键步骤、背后的逻辑（为什么这么做），以及各个模块之间的关系。

---

## 核心架构理念：Monorepo（单体仓库）

**什么是 Monorepo？**
传统开发中，前端（Web）、后端（Server）往往放在两个不同的 Git 仓库里。这会导致类型定义（如 API 接口、角色定义）需要重复写两遍，修改起来极易出错。
**Monorepo** 则是把前端、后端和共享代码放在同一个 Git 仓库的大文件夹（Workspace）里统一管理。

**工具选择**：`pnpm`。它的 Workspace 功能极强，能在本地瞬间把子项目“链接”起来。

---

## 第一步：打造 Monorepo 的地基

**我们做了什么：**

1. 创建 `pnpm-workspace.yaml`。
2. 创建根目录的 `package.json`（设定为 `private: true` 并添加全局快捷脚本）。
3. 创建 `.gitignore` 并进行 Git 首次提交。

**为什么这么做：**

- `pnpm-workspace.yaml` 是工作区的“说明书”，它告诉 pnpm：“去 `packages/` 目录下寻找我所有的子项目”。
- 根目录的 `package.json` 不写具体业务代码，而是作为统筹全局的“老板”，管理所有项目的公共依赖。

---

## 第二步：建立共享语言包（Shared）

**我们做了什么：**

1. 创建了 `packages/shared` 目录。
2. 编写了 `package.json`（命名为 `@backstage/shared`）和 `tsconfig.json`。
3. 定义了 `Role`（角色）枚举。
4. 运行 `pnpm install` 和 `pnpm --filter @backstage/shared build` 进行编译。

**为什么这么做：**

- **统一标准**：前后端都必须遵循同一套数据结构。如果后端验证权限用的是 `Role.ADMIN`，前端菜单的显示条件也得是它。
- **为什么需要编译（build）**：因为 Node.js 和浏览器原生都不认识 TypeScript (`.ts`)，必须编译成 JavaScript (`.js`) 及其类型声明文件 (`.d.ts`) 才能被其他项目安全引用。

---

## 第三步：初始化 NestJS 后端（Server）

**我们做了什么：**

1. 使用 `@nestjs/cli` 创建了 `packages/server` 目录。
2. 将 `package.json` 中的 `name` 规范为 `@backstage/server`。
3. 运行 `pnpm install` 刷新工作区。
4. 运行 `pnpm --filter @backstage/server add "@backstage/shared@workspace:*"`。

**为什么这么做：**

- **选择 NestJS**：这是一个极具结构化的 Node.js 框架，非常适合编写高可维护性的企业级后台。
- **建立连接（重点）**：`@workspace:*` 是 pnpm 的魔法。它并没有去网上下载 shared 包，而是在 server 的 `node_modules` 里创建了一个“快捷方式（软链接）”指向本地的 shared 文件夹。
- **关系**：Shared 是“提供者（Provider）”，Server 是“消费者（Consumer）”。

---

## 第四步：引入数据库神器（Prisma）

**我们做了什么：**

1. 在 Server 项目安装 `prisma` 依赖。
2. 定义了基于 RBAC（基于角色的权限控制）的数据模型：`User`（用户）、`Role`（角色）及它们的中间表。
3. **关键转折：处理 Prisma 版本冲突**：
   - 在安装过程中，默认安装了最新的 **Prisma 7.0**。
   - **遇到问题**：Prisma 7 强制要求使用 `prisma.config.ts` 并禁用了 `schema.prisma` 中的 `url` 属性，导致 `P1012` 报错。
   - **解决决策**：为了教学的稳定性和兼容性，我们决定**降级到 Prisma 6.x**。
4. 将数据库类型设定为 `sqlite`，以文件形式本地存储，降低初期配置成本。

**为什么这么做：**

- **为什么选 Prisma**：它能在 TypeScript 世界里用极其优雅的代码操作数据库，不仅自动生成 SQL，还能提供完美的类型提示。
- **为什么要降级**：Prisma 7 是刚刚发布的激进版本，配置方式发生了巨大变化（移除了 `.env` 自动加载 `url` 的传统方式）。降级到 6.x 可以沿用社区最成熟、最简单的一键式配置方案，减少配置负担，专注于业务逻辑。

---

## 补充：Prisma 降级与修复实战步骤

如果你需要重新执行或理解修复过程，请参考以下动作：

1. **清理冲突文件**：
   删除 `packages/server/prisma.config.ts`。在 Prisma 6 中，我们不需要这个文件，配置全部回归到 `schema.prisma` 和 `.env`。
2. **强制安装稳定版依赖**：

   ```bash
   pnpm --filter @backstage/server add -D prisma@6
   pnpm --filter @backstage/server add @prisma/client@6
   ```

3. **修复图纸（schema.prisma）**：
   确保 `datasource db` 部分包含 `url = env("DATABASE_URL")`。这是 6.x 版本的标准写法。

4. **同步数据库（Migration）**：
   运行 `npx prisma migrate dev --name init`。这个动作会让 Prisma 读取图纸并在硬盘上生成真实的数据库文件（dev.db）。

---

## 总结：模块间的运转流程

把我们的系统比作一家餐厅：

1. **pnpm Workspace (Monorepo)**：是整栋餐厅大楼的管理物业。
2. **Shared**：是餐厅的“标准化手册”，规定了菜单格式、职位名称（Role）。
3. **Server (NestJS)**：是餐厅的“后厨团队”，负责处理订单、做菜。后厨必须严格遵守“标准化手册”。
4. **Prisma**：是后厨的“仓库管理员”，帮后厨去“仓库 (SQLite/MySQL)”拿食材。

---

---

## 核心心法：数据、后端、接口、前端、组件的“五位一体”

要从“会跑命令”变成“会写代码”，必须理解这五者在系统中的立体联系。我们用**“餐馆点餐”**来彻底串透：

### 1. 数据 (Data) —— “仓库里的食材”

- **在哪看**：`packages/server/prisma/schema.prisma`
- **意思**：系统的核心价值。定义了“用户”长什么样，“基金”有哪些字段。
- **怎么改**：修改 `.prisma` 文件并运行 `npx prisma migrate dev`。
- **关系**：所有人的源头。没有食材，后厨没法做菜，前台没菜可端。

### 2. 后端 (Backend/Server) —— “后厨团队”

- **在哪看**：`packages/server/src`（`service` 逻辑处理，`controller` 负责接单）。
- **意思**：不直接见客户，只负责处理业务逻辑。去仓库（Prisma）拿食材，加工成菜品（JSON 数据）。
- **怎么改**：修改 `.ts` 业务代码文件。
- **关系**：向上对接接口，向下对接数据。

### 3. 接口 (API/Interface) —— “菜单与传菜口”

- **在哪看**：
  - **协议**：后端 Controller 里的路由（如 `@Get('users')`）。
  - **契约**：`packages/shared` 里的 TypeScript 类型定义。
- **意思**：规定了菜叫什么名（URL）、装什么盘子（数据格式）。
- **怎么改**：修改 `shared` 里的类型定义或后端接口路径。
- **关系**：前后端的**契约**。只要契约不变，后厨换人或前台换人，餐厅都能照常转。

### 4. 前端 (Frontend/Web) —— “前台服务员与装修”

- **在哪看**：`packages/web` 目录。
- **意思**：负责把后端的数据取回来，展示在漂亮的页面上。
- **怎么改**：修改 `.vue` 页面文件或 `.ts` 脚本。
- **关系**：通过接口“求取”后端的数据。

### 5. 组件 (Component) —— “餐桌上的盘子与餐具”

- **在哪看**：前端项目的 `src/components` 目录。
- **意思**：前端页面的小零件（如：登录框、数据表格、导航栏）。
- **怎么改**：修改具体的 `.vue` 组件文件。
- **关系**：前端页面是由无数个组件“拼”出来的。

---

## 全链路运转流程：当你点击“查询余额”

1. **组件 (Component)**：捕捉到你的点击动作。
2. **前端 (Frontend)**：向 **接口 (API)** 发起请求：`GET /balance`。
3. **接口 (API)**：请求通过传菜口到达 **后端 (Backend)**。
4. **后端 (Backend)**：去问 **数据 (Prisma)** 要你的账户钱数。
5. **数据 (Data)**：从硬盘里的文件读出 `100.00` 并返回给后端。
6. **后端 (Backend)**：把 `100.00` 包装成 JSON 快递。
7. **接口 (API)**：快递通过传菜口回到前端。
8. **前端 (Frontend)**：拆开快递，把数据传给组件。
9. **组件 (Component)**：重新渲染，把数字 `100.00` 显示在屏幕上。

---

## 进阶心法：如何“读懂”代码的意图？

现阶段，你不需要看懂每一行代码，但你必须看懂代码的**“意图”**。建议把对代码的理解分成三个层次：

### 第一层：这是什么文件？（必须看懂）

关注文件的**角色**，不要深究内容。

- 看到 `.prisma` 文件，要知道：“这是在画数据库的设计图。”
- 看到 `package.json`，要知道：“这是项目的身份证，记录了它叫什么，用了哪些工具。”
- 看到 `main.ts`，要知道：“这是程序的大门，代码从这里开始运行。”

### 第二层：这段逻辑在干什么？（建议看懂）

不需要纠结语法，但要看懂**业务逻辑**。
例如，在 `schema.prisma` 中看到：

```prisma
model User {
  username  String   @unique
  password  String
}
```

你只需要在心里翻译成：**“用户得有个名字，不能重名，还得有个密码。”**

### 第三层：每一行语法的细节（现阶段不需要看懂）

例如：`@relation(fields: [userId], references: [id])`。
这种复杂的语法是给编译器看的。现阶段完全可以把它当成一个“黑盒”，以后需要微调数据库关系时，再去查文档。通过不断的实践和报错，自然会产生“肌肉记忆”。

---

## 实战验证：Monorepo 的铁三角联动

目前我们已经成功在前端（Web）页面上直接引用了共享包（Shared）中的 `Role` 枚举。

**实战步骤：**

1. 在 `packages/web/src/App.vue` 中 `import { Role } from '@backstage/shared'`。
2. 使用 Vue 的 `v-for` 指令将角色循环渲染在屏幕上。

**这证明了：**

- **零冗余**：同样的业务定义不需要在前后端各写一遍。
- **强一致性**：只要 Shared 修改，全系统自动同步，彻底解决了“前后端口径不一”的 Bug 隐患。

## 遇到的坑：浏览器不认识 CommonJS 模块

**报错现象**：`Uncaught SyntaxError: ... does not provide an export named 'Role'`。

**原因分析**：

- 后端 NestJS 默认喜欢 CommonJS 格式。
- 前端 Vite/浏览器 强制要求 ES Module 格式。
- 我们最初的 Shared 包只生成了 CommonJS，导致浏览器“看不懂”。

**解决动作（标准化动作）**：

1. 修改 `shared/tsconfig.json`，将 `"module"` 设置为 `"ESNext"`。
2. 运行 `pnpm --filter @backstage/shared build` 重新生成现代化的代码。
3. 运行 `pnpm --filter @backstage/web dev --force` 强制 Vite 刷新缓存。

**心法总结**：在 Monorepo 中，共享包必须兼容现代浏览器的模块标准，否则前端无法引用。

---

## 🏗️ 第一阶段：基础设施搭建（已完成 ✅）

恭喜！你已经亲手打造了一个基于 Monorepo 的全栈系统骨架。所有的管道已经铺设完毕，接下来的任务是开始往骨架里填充血肉（开发真实的业务功能）。
