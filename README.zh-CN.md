# PassXYZ Vault 3

本项目是 PassXYZ Vault 3 的前端应用，是一款兼容 KeePass 的密码管理器。

## 概述

`passxyz-web` 是 PassXYZ 生态系统的 Web 应用组件，在浏览器中提供安全、功能丰富的密码管理体验。它连接到 [PassXYZ.Server](https://github.com/finanalyzer/server) 获取后端服务支持，通过强加密实现兼容 KeePass 的保险箱操作。

**主要功能：**

- KeePass 兼容的密码保险箱管理
- 双因素认证（Cloudflare Access + 主密码）
- 设备锁支持
- 实时 OTP 令牌生成
- 自动会话锁定
- 国际化支持（英语/中文）
- 深色/浅色主题的响应式设计

## 技术栈

| 技术            | 版本      | 描述             |
| --------------- | --------- | ---------------- |
| React           | ^18.2.0  | UI 框架          |
| TypeScript      | ~5.9.3   | 类型安全开发     |
| TanStack Router | ^1.168.7 | 路由管理         |
| @openbb/ui      | ^0.14.17 | 设计系统         |
| TailwindCSS     | ^3.4.1   | CSS 框架         |
| Vite            | ^8.0.1   | 构建工具         |
| i18next         | ^23.7.0  | 国际化           |
| React Query     | ^5.8.0   | 数据管理         |
| zod             | ^3.22.0  | 表单验证         |
| axios           | ^1.6.0   | HTTP 客户端      |

## 快速开始

### 前置条件

- Node.js 18+
- pnpm 包管理器
- PassXYZ.Server 运行在 `http://localhost:5182`

### 安装

```bash
# 克隆仓库
git clone https://github.com/finanalyzer/vault.git passxyz-web

# 导航到项目目录
cd passxyz-web

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm run dev
```

应用将在 `http://localhost:5173/vault/` 运行。

### 构建

```bash
# 构建用于 VPS 部署
pnpm run build

# 构建用于 GitHub Pages（静态）
pnpm run build:static
```

## 功能特性

### 1. 用户认证

- 用户名和密码登录
- WebAuthn 生物识别认证
- 设备锁支持
- 自动超时会话锁定
- 并发会话检测（409 Conflict 处理）

### 2. 保险箱管理

- **条目类型：** Group、Entry、PxEntry（扩展）、Notes
- 条目和分组的 CRUD 操作
- 自定义字段管理
- Markdown 笔记渲染
- 图标自定义

### 3. OTP 管理

- 客户端 TOTP 计算
- 实时令牌更新（30 秒周期）
- OTP 倒计时显示

### 4. 安全特性

- 所有通信采用 HTTPS 加密
- 基于 JWT 的认证
- 会话超时（可配置：30s、2min、5min、10min、30min、1h）
- 单点登录强制
- Markdown 渲染中的 XSS 防护

## 架构

### 核心原则

1. **关注点分离：** 前端通过 REST API 与后端通信
2. **无状态 API 设计：** 上下文通过 URL 参数显式传递
3. **服务端加密：** KeePass 数据库解密由 VaultSessionManager 处理
4. **多层认证：** Cloudflare Access（身份）+ 主密码（数据）

### 认证流程

```
1. 用户 → Cloudflare Access → JWT（包含邮箱）
2. 前端 → POST /api/user/login（Cloudflare JWT + 凭证）
3. 后端 → 验证 JWT → 查询用户 → 打开 KeePass 数据库
4. 返回本地 JWT → 存储到 localStorage
```

### 会话管理

- 令牌存储在 `localStorage` 中，键名为 `passxyz-token`
- 使用页面可见性 API + 活动检测实现自动锁定
- 会话超时触发 `POST /api/user/logout`
- 并发登录尝试返回 409 Conflict

### 路由

| 路由                              | 页面             | 描述               |
| --------------------------------- | ---------------- | ------------------ |
| `/`                               | LoginPage        | 重定向到登录       |
| `/login`                          | LoginPage        | 用户登录           |
| `/signup`                         | SignUpPage       | 用户注册           |
| `/vault`                          | ItemsPage        | 根分组项目         |
| `/vault/groups/{groupId}`         | ItemsPage        | 指定分组中的项目   |
| `/vault/groups/{groupId}/fields`  | GroupEditPage    | 编辑分组信息       |
| `/vault/entries/{entryId}`        | ItemDetailPage   | 条目详情           |
| `/vault/new/{groupId}`            | NewItemPage      | 在分组中创建新项目 |
| `/vault/search`                   | SearchPage       | 全局搜索           |
| `/vault/otp`                      | OtpListPage      | OTP 令牌列表       |
| `/vault/notes/{entryId}`          | NotesPage        | Markdown 笔记视图  |
| `/vault/settings`                 | SettingsPage     | 应用设置           |
| `/vault/about`                    | AboutPage        | 关于 PassXYZ       |

**路由结构：** 使用 TanStack Router 的布局路由模式。`/vault/groups/$groupId` 和 `/vault/entries/$entryId` 作为布局路由渲染 `<Outlet />`，子路由对应具体页面。

### 状态管理

| 状态类型    | 存储方式         | 描述                      |
| ----------- | ---------------- | ------------------------- |
| Auth Token  | localStorage     | API 请求的 JWT 令牌       |
| User Info   | React Query      | 缓存的用户配置文件        |
| Current Group| React Context    | 面包屑导航栈              |
| Item List   | React Query      | 缓存的查询结果            |
| Form State  | react-hook-form  | 表单输入和验证            |

## API 参考

### 用户管理 (`/api/user`)

| 方法 | 端点                  | 描述         | 认证方式       |
| ---- | --------------------- | ------------ | -------------- |
| POST | `/api/user/signup`    | 用户注册     | Cloudflare JWT |
| POST | `/api/user/login`     | 用户登录     | Cloudflare JWT |
| POST | `/api/user/logout`    | 用户登出     | Local JWT      |
| GET  | `/api/user/profile`   | 获取用户资料 | Local JWT      |
| PUT  | `/api/user/profile`   | 更新用户资料 | Local JWT      |
| DELETE | `/api/user/{username}`| 删除用户     | Local JWT      |
| GET  | `/api/user/list`      | 获取用户列表 | Local JWT      |

### 保险箱管理 (`/api/vault`)

| 方法 | 端点                                      | 描述            | 认证方式   |
| ---- | ----------------------------------------- | --------------- | ---------- |
| GET  | `/api/vault/groups/{groupId}/items`       | 获取分组中的项目 | Local JWT  |
| GET  | `/api/vault/items/{itemId}`               | 获取单个项目    | Local JWT  |
| GET  | `/api/vault/entries/{entryId}`            | 获取条目详情    | Local JWT  |
| GET  | `/api/vault/groups/{groupId}`             | 获取分组详情    | Local JWT  |
| GET  | `/api/vault/search?keyword={keyword}`     | 搜索条目        | Local JWT  |
| GET  | `/api/vault/icons`                        | 获取图标列表    | Local JWT  |
| POST | `/api/vault/groups/{groupId}/entries`     | 创建条目        | Local JWT  |
| POST | `/api/vault/groups/{parentGroupId}/groups`| 创建分组        | Local JWT  |
| PUT  | `/api/vault/entries/{entryId}`            | 更新条目        | Local JWT  |
| PUT  | `/api/vault/groups/{groupId}`             | 更新分组        | Local JWT  |
| DELETE | `/api/vault/entries/{entryId}`            | 删除条目        | Local JWT  |
| DELETE | `/api/vault/groups/{groupId}`             | 删除分组        | Local JWT  |
| POST | `/api/vault/change-password`              | 修改主密码      | Local JWT  |

### 附件管理

| 方法 | 端点                                                   | 描述           |
| ---- | ------------------------------------------------------ | -------------- |
| GET  | `/api/vault/entries/{entryId}/attachments`             | 获取附件列表   |
| GET  | `/api/vault/entries/{entryId}/attachments/{attachmentId}` | 下载附件   |
| POST | `/api/vault/entries/{entryId}/attachments`             | 上传附件       |
| DELETE | `/api/vault/entries/{entryId}/attachments/{attachmentId}` | 删除附件 |

## 项目结构

```
passxyz-web/
├── public/                    # 静态资源
├── src/
│   ├── components/           # 可复用组件
│   │   ├── forms/            # 表单组件
│   │   ├── layout/           # 布局组件（侧边栏、面包屑）
│   │   ├── items/            # 项目相关组件
│   │   ├── otp/              # OTP 组件
│   │   └── ui/               # 通用 UI 组件
│   ├── pages/                # 页面组件
│   │   ├── LoginPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── ItemsPage.tsx
│   │   ├── ItemDetailPage.tsx
│   │   ├── NewItemPage.tsx
│   │   ├── FieldEditPage.tsx
│   │   ├── IconsPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── NotesPage.tsx
│   │   ├── OtpListPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AboutPage.tsx
│   ├── routes/               # TanStack Router 配置
│   ├── services/             # API 服务层
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   └── vaultService.ts
│   ├── contexts/             # React Context 提供者
│   ├── hooks/                # 自定义 React hooks
│   │   ├── useAuth.ts
│   │   ├── useAutoLock.ts
│   │   └── useOtp.ts
│   ├── i18n/                 # 国际化资源
│   ├── utils/                # 工具函数
│   ├── types/                # TypeScript 类型定义
│   ├── main.tsx              # 应用入口
│   ├── App.tsx               # 根组件
│   └── index.css             # 全局样式
├── index.html
├── package.json
├── vite.config.ts            # VPS 部署配置
├── vite.static.config.ts     # GitHub Pages 配置
├── tailwind.config.ts
└── tsconfig.json
```

## 部署

### VPS 部署

```bash
pnpm run build
# 输出目录: dist/
```

**配置：**

- 基础路径：`/`（默认，可通过 `VITE_APP_BASE` 配置）
- 包含开发服务器代理
- 源映射已启用

### GitHub Pages

```bash
pnpm run build:static
# 输出目录: dist-static/
```

**配置：**

- 基础路径：`/vault/`（默认）
- Hash 历史路由
- 无开发服务器
- 源映射已禁用

### CORS 配置

PassXYZ.Server 通过 `appsettings.json` 支持 CORS 配置：

```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowedHeaders": ["Authorization", "Content-Type", "Accept"],
    "AllowCredentials": true
  }
}
```

## 开发测试设置

### 本地服务

| 应用程序         | 端口   | 描述                 |
| ---------------- | ------ | -------------------- |
| passxyz-web      | 5173   | 前端认证应用         |
| finanalyzer-app  | 5174   | 仪表盘应用           |
| PassXYZ.Server   | 5182   | 后端 API 服务        |

### 代理配置

**passxyz-web** (`vite.config.ts`)：

```typescript
proxy: {
  "/api": {
    target: "http://localhost:5182",
    changeOrigin: true,
    secure: false,
  },
  "/app": {
    target: "http://localhost:5174",
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/app/, ""),
  },
},
```

### 测试模式

#### 模式 1：代理集成（推荐）

通过代理共享 localStorage：

```
http://localhost:5173/vault/          → passxyz-web
http://localhost:5173/app/            → passxyz-web proxy → finanalyzer-app
http://localhost:5173/api/            → passxyz-web proxy → PassXYZ.Server
```

**步骤：**

1. 启动 PassXYZ.Server：`cd PassXYZ.Server && dotnet run`
2. 启动 finanalyzer-app：`cd finanalyzer-app && pnpm run dev`
3. 启动 passxyz-web：`cd passxyz-web && pnpm run dev`
4. 访问 `http://localhost:5173/vault/#/login` 登录
5. 访问 `http://localhost:5173/app/` 打开仪表盘

#### 模式 2：独立开发

分别运行各应用并手动同步令牌：

1. 按照模式 1 的步骤 1-4 操作
2. 从 localStorage 复制 `passxyz-token`
3. 通过浏览器控制台在 finanalyzer-app 的 localStorage 中设置令牌

## 安全性

- **密码保护：** 传输过程采用 HTTPS 加密，静态存储采用 KeePass 原生加密
- **JWT 安全：** 强密钥签名，合理的过期时间
- **会话超时：** 可配置的空闲超时（默认 1 小时）
- **单点登录：** 防止多设备并发登录
- **输入验证：** 所有 API 输入采用 Zod 模式验证
- **设备锁：** WebAuthn 标准生物识别验证
- **XSS 防护：** Markdown 渲染中的 HTML 标签过滤
- **OTP 安全：** TOTP 密钥仅在客户端处理

## 国际化

支持英语和中文两种语言。语言资源存储在 `src/i18n/resources/` 目录中。

## 参考资料

- [PassXYZ.Server](https://github.com/finanalyzer/server)
- [PassXYZ.Vault2 Mobile Application](https://github.com/passxyz/PassXYZ.Vault2)