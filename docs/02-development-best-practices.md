# Backstage 开发进阶：心法与最佳实践

> **文档创建时间**：2026年5月21日
> **目标阶段**：从“基础设施”跨越到“业务逻辑”的认知升级

本手册记录了在开发过程中遇到的真实坑位、背后的原理（边做边学），以及全栈开发必须掌握的工程化知识。

---

## 一、 代码质量守卫：ESLint 与 Prettier
在 Monorepo 中，由于涉及 Vue、NestJS、Shared 多种环境，代码校验规则必须“因地制宜”。

### 1. 为什么我们要放宽规则？
- **`vue/multi-word-component-names: off`**：
  - **原理**：Vue 默认要求组件名如 `UserTable`（多单词），防止与 HTML 原生标签冲突。
  - **心法**：在初期阶段，允许 `App`、`Home` 等简单命名，能显著降低初学者的挫败感。
- **`@typescript-eslint/no-explicit-any: off`**：
  - **原理**：TS 的终极目标是类型安全，禁止使用 `any`。
  - **心法**：在接口还没完全定死、数据结构还在变动时，`any` 是最好的“占位符”。我们遵循“先跑通，再重构”的实用主义。

### 2. 换行符的噩梦：`endOfLine: auto`
- **坑位**：Windows 系统用 `CRLF`，Mac 用 `LF`。如果没配置好，你会发现文件每一行都报错。
- **心法**：在 `.prettierrc` 中设置 `auto`，让工具自动处理系统差异。

---

## 二、 数据库的“记忆力”：Prisma 全生命周期
操作数据库不仅仅是写 SQL，在现代工程中它有一套严谨的流水线：

### 1. 核心流水线
1. **图纸 (Schema)**：在 `.prisma` 文件中定义模型。
2. **同步 (Generate)**：运行 `prisma generate`。这是将“图纸”翻译成“TypeScript 代码提示”的过程。如果不跑这一步，你的编辑器会报错找不到表。
3. **搬砖 (Migrate)**：运行 `prisma migrate dev`。这会真正修改硬盘上的数据库文件结构。
4. **进货 (Seed)**：运行 `prisma db seed`。往数据库里塞入初始数据（如超级管理员）。

### 2. Seeding 的奥秘：`upsert`
- **知识点**：`upsert` = Update（更新）+ Insert（插入）。
- **心法**：种子脚本应该可以被无限次执行而不报错。如果数据存在就更新，不存在才创建。这保证了开发环境的幂等性。

---

## 三、 全栈桥梁：Shared 包的 CJS 与 ESM 冲突
这是初学者在 Monorepo 中最容易遇到的“深水坑”。

- **CommonJS (CJS)**：后端 NestJS 默认使用的老格式，用 `module.exports`。
- **ES Module (ESM)**：前端浏览器和 Vite 强制使用的现代格式，用 `export/import`。
- **心法**：共享包（Shared）必须配置好 `tsconfig.json` 生成兼容现代浏览器的 ESM 格式（`"module": "ESNext"`），否则前端引用时会报 `SyntaxError`。

---

## 四、 后端架构：NestJS 的“三位一体”
NestJS 强迫我们用结构化的思维写代码，每个功能通常由三部分组成：

1. **Module (模块)**：管家。负责告诉 NestJS 这个功能需要哪些厨师（Service）和哪些接待员（Controller）。
2. **Controller (控制器)**：接待员。只负责接听电话（HTTP 请求），并把需求传达给后厨。
3. **Service (服务)**：大厨。负责真正的“体力活”——去仓库（Prisma）拿菜，炒好逻辑，最后交给接待员端出去。

---

## 五、 工程化标准动作（常用口诀）
- **我想统一全家人的排版**：`npx prettier --write .`
- **我想让警察自动修小 Bug**：`npx eslint . --fix`
- **我想让前端认出最新的 Shared 包**：`pnpm --filter @backstage/shared build`
- **我想给仓库进点初始货**：`npx prisma db seed`
