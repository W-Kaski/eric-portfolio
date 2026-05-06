# Eric Portfolio

> A high-end personal portfolio and knowledge hub — built with React 19 + TypeScript, featuring interactive ML visualizations, a Markdown-based knowledge system, and a two-language UI.

[![Framework](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Build](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Styling](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Site](https://img.shields.io/badge/Live-ek--flowity.site-blueviolet?style=flat-square)](https://ek-flowity.site)

[中文](./README.zh.md) · [Pages](#pages) · [ML Lab](#ml-lab-experiments) · [Architecture](#architecture) · [Quickstart](#quickstart)

---

## Overview

`eric-portfolio` is Eric Wang's personal portfolio website — a multi-page React 19 application with three core pillars:

- **Portfolio** — Project showcases with full case-study views and PDF paper links.
- **Articles** — A structured knowledge base of AI/ML notes, browsable as a flat list, an interactive tree, or a knowledge-graph view. Articles are stored as plain Markdown files with YAML frontmatter, parsed entirely on the client.
- **ML Lab** — Nine interactive machine-learning experiments built with React Three Fiber, Recharts, and D3.

The site supports **dark / light themes** and **English / Chinese** content toggling, driven by a JSON translation layer loaded at runtime.

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section with 3-D particle core, featured projects & skills |
| `/portfolio` | Portfolio | Project cards with filter, sorting, and detailed case-study views |
| `/portfolio/:id` | Project Detail | Full write-up, tech stack, screenshots, and links (GitHub / Demo / PDF) |
| `/articles` | Articles | Knowledge base — list / tree / graph view with full-text Markdown render |
| `/articles/:id` | Article Detail | Single article with KaTeX math, syntax highlighting, and outline nav |
| `/ml-lab` | ML Lab | Interactive experiment browser — bento grid + deep-link via `?id=` |
| `/about` | About | Bio, education timeline, skills, avatar, and resume download |

---

## ML Lab Experiments

Nine fully interactive widgets, each paired with a Markdown explainer:

| ID | Experiment | Tech |
|----|------------|------|
| `decision-boundary` | Decision Boundary Visualizer | Canvas, kNN / SVM |
| `nn-visualizer` | Neural Network Visualizer | React Three Fiber |
| `dim-reduction` | Dimensionality Reduction (PCA / t-SNE) | D3, Recharts |
| `reinforcement-learning` | Reinforcement Learning (Grid World) | Custom RL loop |
| `gradient-descent` | Gradient Descent Explorer | Canvas animation |
| `kmeans-clustering` | K-Means Clustering | D3 Force |
| `self-attention` | Self-Attention Mechanism | SVG / Recharts |
| `rag-explorer` | RAG Explorer | Simulation |
| `react-agent` | ReAct Agent | Simulation |

Deep-linking is supported: `/ml-lab?id=rag-explorer` jumps directly to that module.

---

## Architecture

```
eric-portfolio/
├── public/
│   ├── config/           # Runtime JSON configs (site, about, translations)
│   ├── papers/           # Static PDF papers
│   └── resume/           # Resume files
├── src/
│   ├── components/
│   │   ├── mllab/        # 9 interactive ML experiment components
│   │   ├── ArticleGraphView.tsx   # D3 force-graph knowledge map
│   │   ├── ArticleTreeView.tsx    # Collapsible folder tree
│   │   ├── InteractiveParticleCore.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── content/
│   │   ├── articles/     # Markdown notes (A-G topic folders + papers/)
│   │   └── mllab/        # Markdown explainers for each ML Lab module
│   ├── context/
│   │   ├── AppContext.tsx     # Theme + language + i18n
│   │   └── ConfigContext.tsx  # Runtime JSON config loader
│   ├── lib/
│   │   ├── articles.ts   # Parallel metadata loader + per-article cache
│   │   ├── mllab.ts      # Lab markdown loader
│   │   └── projects.ts   # Project + paper markdown loader
│   └── pages/            # Route-level page components
├── scripts/
│   ├── add-frontmatter.cjs  # Batch-add YAML frontmatter to articles
│   └── parse_pdf.cjs        # PDF → Markdown helper
├── server.ts             # Express dev/prod server (Vite middleware)
├── vite.config.ts
└── package.json
```

### Content Pipeline

All content (projects, articles, ML lab notes) lives as **plain `.md` files** with YAML frontmatter. At build time Vite's `import.meta.glob` collects every file; metadata is parsed in parallel in the browser and cached in module-level singletons — making the initial article list load ~30× faster than sequential `for…of await` on large vaults.

### i18n

Translations live in `public/config/translations.json`. The `useApp()` hook exposes `t(key)` — a lookup helper that resolves strings for the current language (`en` | `zh`). Site metadata (author, social links, nav items) comes from `public/config/site.json`.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion v12) |
| 3-D / Canvas | Three.js + React Three Fiber + Drei |
| Charts | Recharts, D3 Force |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex |
| Syntax Highlight | react-syntax-highlighter (Prism / atomDark) |
| Server | Express 4 (dev + prod SSR-friendly server) |
| Deployment | Docker + Nginx |

---

## Quickstart

**Prerequisites:** Node.js ≥ 18, npm

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # Production bundle → dist/
npm run preview      # Serve the production build locally
npm run lint         # TypeScript type-check (no-emit)
npm run clean        # Remove dist/
```

---

## Adding Content

### New Project

Create `src/content/projects/<slug>.md` with frontmatter:

```yaml
---
title: My Project
date: 2025-06
category: Web App
image: /images/my-project.png
color: "#6366f1"
tech: [React, TypeScript, PostgreSQL]
github: https://github.com/...
demo: https://...
featured: true
---
Project description goes here…
```

### New Article

Drop a `.md` file into the appropriate topic folder under `src/content/articles/`. Outbound wiki-style links (`[[Article Title]]`) are parsed automatically and appear in the knowledge graph.

### New ML Lab Note

Add a `.md` file to `src/content/mllab/<Category>/`. To attach an interactive component, map its `id` in the `switch` block inside `MLLab.tsx`.

---

## Deployment

```bash
# Build
npm run build

# Run production server (Express serves dist/)
NODE_ENV=production node server.ts
```

A `Dockerfile` and Nginx config (not shown in repo root) are used for the live site at [ek-flowity.site](https://ek-flowity.site).

---

## Author

**Eric Wang** — [ek-flowity.site](https://ek-flowity.site) · [LinkedIn](https://linkedin.com/in/-ericwang-) · [Email](mailto:ericwang7717@gmail.com)
