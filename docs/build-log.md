# 博客搭建记录

## 2026-05-30

### 起因

今天决定把个人技术博客真正搭起来。第一版选择 Hexo 框架，使用 GitHub Pages 免费托管，先追求能写、能构建、能上线。

### 当前决策

- 项目目录：`tech-blog/`
- 技术栈：Hexo + npm + GitHub Actions + GitHub Pages
- 部署方式：GitHub Pages 的 Actions workflow，而不是把 `public/` 手动提交到发布分支
- URL 模式：先按项目页准备，形如 `https://YOUR_GITHUB_USERNAME.github.io/tech-blog/`
- 内容方向：安全研究、工程实践、个人知识系统、折腾记录

### 已完成

- 初始化 Hexo 博客骨架。
- 将站点语言、标题、作者、时区调整为个人博客语境。
- 添加 GitHub Pages Actions workflow。
- 建立 README、搭建记录和第一篇文章草稿。
- 将 `tech-blog/` 初始化为独立 Git 仓库，避免外层目录的研究资料被误提交。
- 本地执行 `npm run build` 通过，预览地址为 `http://localhost:4000/tech-blog/`。
- 浏览器验证首页、文章页、关于页和导航路径可访问。
- 新增 `docs/hexo-guide.md`，作为 Hexo 入门、写作、配置、部署和后续自动化的完整教程。
- 修正分类配置：`default_category` 只保留一个，分类归属改为在文章 front matter 中声明。
- 为 `category_map` / `tag_map` 增加 URL slug 映射，并补充分类、标签、草稿、发布等日常操作说明。
- 更新 `scaffolds/post.md` 和 `scaffolds/draft.md`，新文章默认带 `categories` 和 `tags` 字段。

### 待办

- 填入真实 GitHub 用户名并决定仓库名。
- 选择是否继续使用默认 Landscape 主题。
- 设计 Obsidian 到 Hexo 的同步规则。
- 设计 Hermes Agent 的管理职责：草稿巡检、构建巡检、链接巡检、选题提醒。

### 文章素材

这次过程可以整理成一篇文章：从情绪顶点开始，不先追求完美主题，而是把写作闭环跑通。文章可以分成动机、技术选型、目录初始化、GitHub Pages 自动部署、Obsidian/Hermes 的下一阶段想象。

## 2026-06-05

### 导入知识库文章

- 从 Obsidian 知识库导入 `运维相关/docs/openwrt扩容.md`。
- 新增文章 `source/_posts/2026-06-05-openwrt-extroot-expansion.md`。
- 将 OpenWrt 扩容文章归类到 `运维 / 软路由 / OpenWrt`，对应 front matter 为 `categories: [运维, 软路由, OpenWrt]` 的层级写法。
- 将知识库图片从 `运维相关/assets/` 复制到 `source/images/openwrt-extroot-expansion/`。
- 将图片链接从 `../assets/...` 改成 Hexo 可访问的 `/tech-blog/images/openwrt-extroot-expansion/...`。
- 补充 `软路由`、`OpenWrt`、`Extroot` 的 URL slug 映射。
- 整理 PassWall 相关知识库文档，合并为 3 篇公开安全版文章：零泄露配置、节点巡检、线路测试。
- PassWall 文章统一归类到 `运维 / 软路由 / PassWall`，并脱敏真实公网 IP、节点账号密码、上报地址和业务线路细节。
- 从默认浮动双栏改为 `rich-tech` 本地主题里的 grid 双栏，修复归档页和文章页右侧大面积空白、侧栏下沉的问题。
- 新增 `技术栈地图` 页面，并将其加入顶部导航，作为多技术栈博客的人工总入口。

## 2026-06-16

### 上线准备

- 本地执行 `npm run clean && npm run build` 通过。
- 调整 GitHub Pages workflow：曾加入 `actions/configure-pages@v5`，后因首次部署会触发 Pages 未启用错误而移除；保留 `actions/upload-pages-artifact@v4` 和 `actions/deploy-pages@v4`。
- 新增 `docs/deploy-maintenance.md`，记录首次上线、日常发布、分类标签、技术栈地图、主题和依赖维护流程。
- GitHub 远端仓库为 `git@github-strong:strong-coder9527/tech-blog.git`。
- 将 `_config.yml` 的站点地址修正为 `https://strong-coder9527.github.io/tech-blog`，避免误用 GitHub 仓库地址。
- 移除 workflow 中首次部署容易失败的 `actions/configure-pages` 步骤，保留 Hexo 构建、Pages artifact 上传和 `deploy-pages` 部署。
- 接入 Utterances 评论系统，文章页底部显示评论区，评论数据存储到 GitHub Issues。
