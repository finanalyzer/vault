# 上下文菜单交互优化计划

## 1. 需求分析

### 1.1 问题背景
当前上下文菜单使用浏览器原生的右键（`onContextMenu`）触发方式，在不同操作系统和浏览器环境下可能与系统原生菜单产生冲突，导致用户体验不一致。

### 1.2 优化目标

#### ItemsPage 页面修改
- 在每行数据项最右侧添加专用的上下文菜单触发图标按钮（三个点 `⋮`）
- 点击按钮时触发自定义上下文菜单
- 移除右键触发方式，避免与系统菜单冲突

#### ItemDetailPage 页面修改
- 将当前每行数据项最右侧的"Copy"图标按钮改造为上下文菜单触发按钮
- 将"Copy"操作移到上下文菜单中
- 保持按钮位置不变，仅修改功能行为

## 2. 现有代码分析

### 2.1 ItemsPage.tsx
- 当前使用 `onContextMenu={(e) => handleContextMenu(e, item)}` 触发菜单
- 上下文菜单状态：`contextMenu: { x: number; y: number; item: ItemDto } | null`
- 菜单包含：编辑、更换图标、删除操作

### 2.2 ItemDetailPage.tsx
- 当前每行数据项最右侧有一个"Copy"按钮（第274-289行）
- 需要将其改造为上下文菜单触发按钮
- 需支持复制操作，并可扩展其他操作

## 3. 实施步骤

### 3.1 ItemsPage.tsx 修改

**3.1.1 状态修改**
- 移除 `isRightClick` 状态（不再需要）
- 保持 `contextMenu` 状态，但修改触发方式

**3.1.2 事件处理修改**
- 移除 `handleContextMenu` 函数中的右键逻辑
- 创建新的 `handleMenuButtonClick` 函数，通过按钮点击触发菜单

**3.1.3 界面修改**
- 在每行数据项最右侧添加菜单触发按钮（使用三个点图标）
- 移除 `onContextMenu` 事件绑定
- 移除 `handleItemClick` 中的 `isRightClick` 判断

### 3.2 ItemDetailPage.tsx 修改

**3.2.1 新增状态**
- 添加 `fieldContextMenu` 状态，用于存储当前打开的字段菜单信息

**3.2.2 新增事件处理**
- 创建 `handleFieldMenuButtonClick` 函数
- 创建 `handleFieldCopy` 函数（复用原有的复制逻辑）
- 创建点击外部关闭菜单的 `useEffect`

**3.2.3 界面修改**
- 将原"Copy"按钮替换为菜单触发按钮（三个点图标）
- 添加字段级上下文菜单组件

## 4. 文件修改清单

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/pages/ItemsPage.tsx` | 修改 | 添加菜单触发按钮，移除右键触发 |
| `src/pages/ItemDetailPage.tsx` | 修改 | 将Copy按钮改造为菜单触发按钮 |

## 5. 技术实现细节

### 5.1 菜单触发按钮设计
- 使用 SVG 三个点图标（`⋮`）
- 按钮样式：`p-2 text-light-400 dark:text-dark-500 hover:text-brand-main hover:bg-light-100 dark:hover:bg-dark-700 rounded-lg transition-colors`
- 位置：每行数据项最右侧

### 5.2 上下文菜单定位
- 使用固定定位（`fixed`）+ 计算位置
- 确保菜单不会超出视口边界

### 5.3 点击外部关闭
- 使用 `useEffect` 监听 `document.click` 事件
- 点击菜单外部时关闭菜单

## 6. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 菜单位置计算错误 | 菜单可能显示在视口外 | 添加边界检测逻辑 |
| 点击事件冲突 | 按钮点击可能触发行点击 | 使用 `e.stopPropagation()` |
| 样式不一致 | 按钮样式与现有设计不匹配 | 使用项目统一的样式规范 |

## 7. 验证标准

- ItemsPage：点击每行最右侧的三个点按钮，正确弹出上下文菜单
- ItemsPage：右键点击不再触发自定义菜单（显示系统默认菜单）
- ItemDetailPage：点击字段最右侧按钮，正确弹出包含"Copy"选项的菜单
- ItemDetailPage：点击菜单中的"Copy"选项，正确复制内容并显示成功状态
- 所有菜单在不同主题（light/dark）下显示正常
- 点击菜单外部正确关闭菜单