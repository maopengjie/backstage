# Backstage Management System Design Document

## 1. Project Overview
A personal fund and asset management system built with a modern full-stack TypeScript architecture.

## 2. Technical Stack
- **Monorepo Management**: `pnpm` workspaces
- **Frontend**: Vue 3, Vite, TypeScript, Element Plus, Pinia, Axios, ECharts
- **Backend**: NestJS, TypeScript
- **Database**: MySQL 8.0
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Token)
- **Authorization**: RBAC (Role-Based Access Control) with button-level granularity
- **API Documentation**: Swagger
- **Deployment**: Docker, Nginx

## 3. Architecture Design
### 3.1 Monorepo Structure
```text
backstage/
├── packages/
│   ├── web/                # Vue 3 Frontend
│   ├── server/             # NestJS Backend
│   └── shared/             # Shared TS Types & Enums
├── pnpm-workspace.yaml
└── docker-compose.yml
```

### 3.2 Database Schema (Prisma)
- **User**: Authentication and profile.
- **Role**: Groups of permissions.
- **Menu/Permission**: Navigation links and action-level permissions (e.g., `user:create`).
- **UserRole / RoleMenu**: Association tables for RBAC.
- **Fund**: Fund metadata.
- **TradeRecord**: Buying/Selling history.
- **AssetSnapshot**: Daily balance for trend charts.

### 3.3 Security & Permissions
- **Authentication**: JWT stored in HTTP-only cookies or LocalStorage.
- **Backend Authorization**: Custom `RolesGuard` in NestJS checking against user permissions stored in the database.
- **Frontend Authorization**: 
  - Dynamic routing based on menu data from backend.
  - Custom directive `v-permission` for button-level access control.

## 4. Feature Modules
1. **Core Admin**: Login, User/Role/Menu management.
2. **Fund Management**: CRUD for funds, tracking net values.
3. **Transaction Tracking**: Recording trades, calculating profit/loss.
4. **Dashboard**: Visualizing asset distribution and performance trends using ECharts.

## 5. Implementation Phases
- **Phase 1**: Infrastructure (Monorepo setup, Prisma initialization, Auth scaffolding).
- **Phase 2**: RBAC System (User/Role/Menu management UI and API).
- **Phase 3**: Business Logic (Fund management and trade recording).
- **Phase 4**: Data Visualization & Polish (Dashboard, Logging, Dockerization).
