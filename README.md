# TestBoom Frontend

TestBoom 是一个 AI 驱动的自动化测试平台，本仓库包含其前端代码。

## 技术栈

- React 18
- TypeScript
- Vite
- TailwindCSS
- Radix UI
- Lucide Icons

## 功能特性

### 文件管理
- [x] 文件上传（支持 zip 和图片）
- [x] 文件列表展示
- [x] 文件状态追踪
- [x] 文件删除（单个/批量）

### 用例管理
- [x] 用例列表展示
- [x] 用例筛选（项目/模块）
- [x] 用例详情查看
- [x] 用例删除（单个/批量）
- [x] 用例导出（Excel）
- [x] 思维导图展示
- [x] 任务管理
  - [x] 任务列表
  - [x] 任务状态追踪
  - [x] 模块选择

### 仪表盘
- [x] 基础统计数据
- [x] 用例分布
- [x] 文件状态统计

## 开发进度

### 2024-01-03
- 完成用例管理模块
  - 实现用例删除功能（单个/批量）
  - 优化任务列表显示
  - 完善思维导图交互
  - 修复已知问题

### 2024-01-02
- 完成文件管理模块
  - 实现文件上传功能
  - 实现文件列表展示
  - 实现文件状态追踪
  - 实现文件删除功能

## 开发规范

1. 代码风格
   - 使用 TypeScript 严格模式
   - 遵循 ESLint 规则
   - 使用 Prettier 格式化代码

2. 组件开发
   - 遵循 React Hooks 最佳实践
   - 组件按功能模块划分
   - 复用通用组件和样式

3. 状态管理
   - 使用 React Hooks 管理局部状态
   - 遵循单向数据流原则

4. UI/UX
   - 遵循 TailwindCSS 设计规范
   - 保持界面风格统一
   - 注重用户交互体验

## 运行项目

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建生产环境
npm run build

# 预览生产环境
npm run preview
```

## 目录结构

```
src/
  ├── api/          # API 接口
  ├── components/   # 通用组件
  ├── pages/        # 页面组件
  ├── types/        # TypeScript 类型定义
  ├── utils/        # 工具函数
  ├── App.tsx       # 应用入口
  └── main.tsx      # 主入口
```
