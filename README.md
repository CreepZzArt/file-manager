
# 📁 项目资料管理器

这是一个基于 **Electron + Vue3 + Vite** 的桌面应用，用于管理本地项目资料。支持项目分类、文件浏览、路径导航、文件上传等功能，适用于文档归档和项目资料整理。

---

## 🖥 技术栈

- ⚙️ Electron：构建跨平台桌面应用
- 🧩 Vue 3 + Composition API：前端框架
- 💨 Tailwind CSS：快速布局样式
- 🔋 Pinia：状态管理
- ⚡️ Vite：极速打包与开发体验

---

## 📸 应用预览


![项目预览](https://img.scdn.io/i/687e0398a0631_1753088920.webp)

---

## 📦 安装依赖

```bash
npm install
```

## 🚀 启动开发环境

```bash
npm run dev:vite
```

> 启动后将同时运行 Vite + Electron，打开桌面端开发环境窗口。

## 🛠 打包构建

```bash
npm run dist
```

> 打包后的应用将生成在 `dist/` 目录，适用于发布部署。

---

## 📁 项目结构

```
electron-file-manager/
├── data/                 # 自动生成用于存放项目文件
├── electron/             # Electron 主进程与 preload 脚本
│   ├── ipcHandlers/      # IPC 处理函数
│   └── main.js           # Electron 主进程
│   └── preload.js        # Electron 预加载脚本
├── src/
│   ├── components/       # 公共组件
│   ├── views/            # 页面视图
│   ├── router/           # 路由
│   ├── stores/           # 状态管理（Pinia）
│   ├── utills/           # 工具
│   ├── App.vue           # 根组件
│   └── main.js           # Vue 应用入口
├── public/               # 静态资源
├── vite.config.js        # Vite 配置
├── package.json          # 项目信息及脚本
└── README.md             # 项目说明文件
```

-----

## ✨ 核心功能

  - ✅ **项目管理**：支持分类状态（进行中 / 已完成 / 归档）
  - 📂 **文件浏览器**：展示文件列表，支持点击进入子目录、路径导航
  - 🖱 **右键菜单**：支持文件右键操作（重命名、删除等）
  - 📤 **文件上传**：拖拽或选择上传，记录路径、大小、类型
  - 🔍 **路径导航**：基于当前路径自动构建面包屑跳转
  - 📄 **文件预览**：支持多种常用文件格式的即时预览和编辑
      - **文本文件**：可直接查看和编辑 `.txt`, `.json`, `.js`, `.css`, `.vue` 等纯文本内容。
      - **Markdown**：支持 `.md` 文件的实时分屏预览和编辑。
      - **PDF 文档**：可直接在应用内流畅查看 `.pdf` 文件。
      - **图片格式**：支持 `.png`, `.jpg`, `.gif`, `.svg`, `.webp` 等常见图片格式预览。
      - **多媒体**：支持 `.mp4` 视频和 `.mp3` 音频的直接播放。
      - **网页文件**：支持 `.html` 文件的沙箱安全预览。

-----

## ⚠️ 注意事项

- `electron/preload.js` 必须可被正确加载，确保路径无误
- `projectStore.setCurrentProject()` 用于进入项目时设置当前路径状态
- 使用 `path-browserify` 替代 Node.js 原生 path 模块
- `vite.config.js` 中配置了两个配置，一个为打包配置一个为生产环境的启动配置

---
