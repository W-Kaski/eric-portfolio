# Eric Portfolio（个人作品集）

> 高品质个人作品集与知识中枢 —— 基于 React 19 + TypeScript 构建，涵盖交互式机器学习可视化、Markdown 知识库系统与双语 UI。

[![框架](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![构建](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![样式](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![网站](https://img.shields.io/badge/线上-ek--flowity.site-blueviolet?style=flat-square)](https://ek-flowity.site)

[English](./README.md) · [页面](#页面) · [ML 实验室](#ml-实验室) · [项目结构](#项目结构) · [快速开始](#快速开始)

---

## 概览

`eric-portfolio` 是 Eric Wang 的个人主页网站，通过高性能架构集成以下核心模块：

- **Portfolio（作品集）** — 项目展示与深度案例分析。
- **Articles（文章）** — 结构化知识库，提供列表、树状目录及知识图谱三种可视化视图，基于 Markdown + YAML 实现高效解析。
- **ML Lab（机器学习实验室）** — 交互式科学计算实验，结合 React Three Fiber 与 D3.js 呈现复杂算法逻辑。

站点原生支持暗色/亮色主题切换与中英文国际化，所有配置项均通过 JSON 文件动态加载。

---

## 页面

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | Home（首页） | Hero 区域（3D 粒子核心）、精选项目、技能展示 |
| `/portfolio` | Portfolio（作品集） | 项目卡片，支持筛选、排序与案例详情 |
| `/portfolio/:id` | 项目详情 | 完整项目介绍、技术栈、截图及链接（GitHub / Demo / PDF） |
| `/articles` | Articles（文章） | 知识库 —— 列表 / 树形 / 知识图谱视图，支持 Markdown 完整渲染 |
| `/articles/:id` | 文章详情 | 单篇文章，支持 KaTeX 数学公式、代码高亮与目录导航 |
| `/ml-lab` | ML Lab（实验室） | 交互式实验浏览器 —— Bento 网格布局，支持 `?id=` 深度链接 |
| `/about` | About（关于） | 个人简介、教育经历时间轴、技能、头像与简历下载 |

---

## ML 实验室

九个完整交互式实验，每个均配有 Markdown 说明文档：

| ID | 实验名称 | 核心技术 |
|----|---------|---------|
| `decision-boundary` | 决策边界可视化 | Canvas, kNN / SVM |
| `nn-visualizer` | 神经网络可视化 | React Three Fiber |
| `dim-reduction` | 降维（PCA / t-SNE） | D3, Recharts |
| `reinforcement-learning` | 强化学习（格子世界） | 自定义 RL 循环 |
| `gradient-descent` | 梯度下降探索器 | Canvas 动画 |
| `kmeans-clustering` | K-Means 聚类 | D3 Force |
| `self-attention` | 自注意力机制 | SVG / Recharts |
| `rag-explorer` | RAG 探索器 | 模拟 |
| `react-agent` | ReAct Agent | 模拟 |

支持深度链接：访问 `/ml-lab?id=rag-explorer` 可直接跳转到对应实验。

---

## 项目结构

```
eric-portfolio/
├── public/
│   ├── config/           # 运行时 JSON 配置（site、about、translations）
│   ├── papers/           # 静态 PDF 论文文件
│   └── resume/           # 简历文件
├── src/
│   ├── components/
│   │   ├── mllab/        # 9 个交互式 ML 实验组件
│   │   ├── ArticleGraphView.tsx   # D3 力导向知识图谱
│   │   ├── ArticleTreeView.tsx    # 可折叠目录树
│   │   ├── InteractiveParticleCore.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── content/
│   │   ├── articles/     # Markdown 笔记（A-G 主题目录 + papers/）
│   │   └── mllab/        # ML Lab 各实验的 Markdown 说明文档
│   ├── context/
│   │   ├── AppContext.tsx     # 主题 + 语言 + i18n
│   │   └── ConfigContext.tsx  # 运行时 JSON 配置加载器
│   ├── lib/
│   │   ├── articles.ts   # 并行元数据加载器 + 文章内容缓存
│   │   ├── mllab.ts      # Lab Markdown 加载器
│   │   └── projects.ts   # 项目与论文 Markdown 加载器
│   └── pages/            # 路由级别页面组件
├── scripts/
│   ├── add-frontmatter.cjs  # 批量添加 YAML frontmatter 脚本
│   └── parse_pdf.cjs        # PDF → Markdown 转换工具
├── server.ts             # Express 开发/生产服务器（Vite 中间件）
├── vite.config.ts
└── package.json
```

### 内容管道

所有内容（项目、文章、ML Lab 说明）均以**纯 `.md` 文件 + YAML frontmatter** 形式存储。Vite 在构建时通过 `import.meta.glob` 收集所有文件；元数据在浏览器中并行解析，结果缓存在模块级单例中 —— 在大型文章库上比串行 `for…of await` 快约 **30 倍**。

### 国际化（i18n）

翻译内容存放于 `public/config/translations.json`。`useApp()` hook 暴露 `t(key)` 查找函数，根据当前语言（`en` | `zh`）返回对应字符串。站点元数据（作者、社交链接、导航项）来自 `public/config/site.json`。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.8 |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 4 |
| 动画 | Motion（Framer Motion v12） |
| 3D / Canvas | Three.js + React Three Fiber + Drei |
| 图表 | Recharts、D3 Force |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex |
| 代码高亮 | react-syntax-highlighter（Prism / atomDark） |
| 服务器 | Express 4（生产 SSR 兼容服务器） |
| 部署 | Docker + Nginx |

---

## 快速开始

**前置要求：** Node.js ≥ 18、npm

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev          # http://localhost:3000
```

其他脚本：

```bash
npm run build        # 生产构建 → dist/
npm run preview      # 本地预览生产构建
npm run lint         # TypeScript 类型检查（不输出文件）
npm run clean        # 清除 dist/
```

---

## 添加内容

### 新项目

在 `src/content/projects/<slug>.md` 创建文件，填写 frontmatter：

```yaml
---
title: 我的项目
date: 2025-06
category: Web App
image: /images/my-project.png
color: "#6366f1"
tech: [React, TypeScript, PostgreSQL]
github: https://github.com/...
demo: https://...
featured: true
---
项目描述……
```

### 新文章

将 `.md` 文件放入 `src/content/articles/` 下对应主题目录。支持 Obsidian 风格的双向链接（`[[文章标题]]`），链接关系会自动解析并显示在知识图谱中。

### 新 ML Lab 说明

将 `.md` 文件添加到 `src/content/mllab/<Category>/`。如需关联交互组件，在 `MLLab.tsx` 的 `switch` 块中添加对应 `id` 映射即可。

---

## 部署

```bash
# 构建
npm run build

# 启动生产服务器（Express 提供 dist/ 服务）
NODE_ENV=production node server.ts
```

线上站点 [ek-flowity.site](https://ek-flowity.site) 使用 Dockerfile + Nginx 部署。

---

## 作者

**Eric Wang** — [ek-flowity.site](https://ek-flowity.site) · [LinkedIn](https://linkedin.com/in/-ericwang-) · [邮箱](mailto:ericwang7717@gmail.com)
