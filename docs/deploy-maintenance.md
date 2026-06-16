# Hexo + GitHub Pages 上线与维护手册

这份手册记录当前博客从本地发布到 GitHub Pages 的完整流程，以及上线后的日常维护方式。

当前项目采用：

- Hexo 生成静态站点。
- GitHub Actions 构建。
- GitHub Pages 托管。
- 不提交 `public/`，每次由 GitHub Actions 重新生成并发布。

参考文档：

- GitHub Pages 发布源配置：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages 自定义 Actions workflow：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Hexo 官方 GitHub Pages 教程：https://hexo.io/docs/github-pages

## 1. 当前上线方案

当前按 GitHub Pages 的“项目站点”部署：

```text
仓库名：tech-blog
默认分支：main
上线地址：https://strong-coder9527.github.io/tech-blog/
本地预览：http://localhost:4000/tech-blog/
```

Hexo 相关配置在 `_config.yml`：

```yaml
url: https://strong-coder9527.github.io/tech-blog
root: /tech-blog/
```

`root` 很关键。因为这是项目站点，不是用户主页站点，所以必须是 `/tech-blog/`。如果以后改成 `https://<用户名>.github.io/` 这种用户主页仓库，才改成：

```yaml
url: https://<你的 GitHub 用户名>.github.io
root: /
```

## 2. 上线前本地检查

进入项目：

```bash
cd "/Users/rich/Documents/New project 2/tech-blog"
```

安装依赖：

```bash
npm install
```

清理并构建：

```bash
npm run clean
npm run build
```

本地预览：

```bash
npm run server
```

访问：

```text
http://localhost:4000/tech-blog/
```

如果 4000 端口被占用：

```bash
npx hexo server -p 4001
```

访问：

```text
http://localhost:4001/tech-blog/
```

上线前至少检查：

- 首页能打开。
- 技术栈页能打开：`/tech-blog/tech-stack/`
- 分类页能打开：`/tech-blog/categories/`
- 标签页能打开：`/tech-blog/tags/`
- 文章页图片能正常显示。
- 控制台没有明显 404。

## 3. 创建 GitHub 仓库

推荐仓库名：

```text
tech-blog
```

在 GitHub 新建仓库时：

- Repository name：`tech-blog`
- Visibility：建议先用 Public，因为 GitHub Free 的 Pages 对公开仓库最直接。
- 不要勾选自动创建 README、`.gitignore` 或 License，因为本地已经有。

当前仓库远端地址：

```text
git@github-strong:strong-coder9527/tech-blog.git
```

## 4. 填真实站点 URL

打开 `_config.yml`，确认：

```yaml
url: https://strong-coder9527.github.io/tech-blog
```

`root` 保持：

```yaml
root: /tech-blog/
```

改完后重新构建：

```bash
npm run clean
npm run build
```

## 5. 首次提交并推送

如果本地没有配置 Git 用户信息，先配置一次：

```bash
git config user.name "Rich"
git config user.email "<你的 GitHub 邮箱>"
```

查看当前状态：

```bash
git status
```

提交源码：

```bash
git add .
git commit -m "Initial Hexo blog"
```

添加远端：

```bash
git remote add origin https://github.com/<你的 GitHub 用户名>/tech-blog.git
```

推送：

```bash
git push -u origin main
```

如果使用 HTTPS，GitHub 可能要求登录或使用 Personal Access Token。也可以改用 SSH，但本机需要先配置 GitHub SSH key。

## 6. 配置 GitHub Pages

进入 GitHub 仓库页面：

```text
Settings -> Pages
```

在 `Build and deployment` 里：

```text
Source: GitHub Actions
```

当前 GitHub 页面里选择 `GitHub Actions` 后通常会自动生效，不一定会出现单独的 Save 按钮。你看到下拉框已经显示 `GitHub Actions`，就说明这个选项已经选上了。

这时不要点 GitHub 推荐的 `Configure` 模板，也不需要再创建新的 workflow。本仓库已经有自己的 `.github/workflows/pages.yml`。

如果第一次 Actions 报 `Get Pages site failed`，通常是 workflow 里用了 `actions/configure-pages`，但仓库 Pages 还没完成启用导致的。本项目不需要这个步骤，当前 workflow 已经去掉它，只保留 Hexo 构建、上传 artifact 和部署。

只要 `main` 分支有 push，`.github/workflows/pages.yml` 会自动：

1. checkout 源码。
2. 安装 Node.js。
3. 执行 `npm ci`。
4. 执行 `npm run build`。
5. 上传 `public/` 作为 Pages artifact。
6. 部署到 GitHub Pages。

## 7. 确认上线成功

推送后打开：

```text
Actions -> Pages
```

确认 workflow 是绿色。

成功后访问：

```text
https://strong-coder9527.github.io/tech-blog/
```

第一次部署可能需要等几十秒到几分钟。

重点检查：

- 首页样式是否正常。
- 图片是否能加载。
- 导航链接是否带 `/tech-blog/`。
- 分类、标签、文章页是否正常。
- 技术栈地图能否打开。

## 8. 日常发布文章流程

新建文章：

```bash
npm run new "文章标题"
```

编辑生成的文件：

```text
source/_posts/xxxx.md
```

推荐 front matter：

```yaml
---
title: 文章标题
date: 2026-06-16 20:00:00
categories:
  - 运维
  - 软路由
  - OpenWrt
tags:
  - OpenWrt
  - DNS
---
```

本地检查：

```bash
npm run clean
npm run build
npm run server
```

确认无误后发布：

```bash
git status
git add source/_posts/xxxx.md source/images/ docs/ _config.yml
git commit -m "Add post: 文章标题"
git push
```

推送后 GitHub Actions 会自动上线。

## 9. 分类和标签维护

分类用于稳定的知识结构，标签用于技术点。

多级分类写法：

```yaml
categories:
  - 运维
  - 软路由
  - PassWall
```

这会生成：

```text
/tech-blog/categories/operations/soft-router/passwall/
```

如果新增分类，希望 URL 更好看，就在 `_config.yml` 增加映射：

```yaml
category_map:
  旁路由: bypass-router
```

如果新增标签，也可以增加映射：

```yaml
tag_map:
  抓包: packet-capture
```

原则：

- 分类少而稳定。
- 标签可以多，但不要重复变体。
- 同一个技术名保持统一大小写，例如固定用 `OpenWrt`，不要混用 `openwrt`。

## 10. 技术栈地图维护

技术栈地图在：

```text
source/tech-stack/index.md
```

维护原则：

- 已有文章沉淀的主题，用链接。
- 计划写但还没有文章的主题，用灰色占位。
- 新增一个长期方向时，先加到技术栈地图，再决定是否需要新分类。

例子：

```html
<li class="stack-topic">
  <a href="/tech-blog/tags/packet-capture/">抓包</a>
  <span>流量观察、代理链路、证书和协议调试。</span>
</li>
```

占位主题：

```html
<li class="stack-topic is-planned">
  <strong>漏洞分析</strong>
  <span>漏洞复现、根因分析和修复记录。</span>
</li>
```

## 11. 主题维护

当前使用本地主题：

```yaml
theme: rich-tech
```

主题目录：

```text
themes/rich-tech/
```

常改文件：

```text
themes/rich-tech/_config.yml
themes/rich-tech/layout/
themes/rich-tech/source/css/_partial/rich-polish.styl
```

原则：

- 不直接改 `node_modules/`。
- 主题样式统一放到 `rich-polish.styl`，方便后面迁移。
- 改主题后必须 `npm run build` 验证。

## 12. 依赖维护

查看过期依赖：

```bash
npm outdated
```

安全检查：

```bash
npm audit
```

升级前先开本地分支或至少保证当前能构建：

```bash
npm run clean
npm run build
```

升级后：

```bash
npm install
npm run clean
npm run build
```

确认 `package-lock.json` 变化后提交。

## 13. 常见故障

### 页面 404

检查：

- GitHub Pages Source 是否为 `GitHub Actions`。
- Actions 是否成功。
- 仓库名是否真的是 `tech-blog`。
- `_config.yml` 的 `root` 是否为 `/tech-blog/`。

### CSS 或图片加载失败

通常是 `root` 配错。

项目页：

```yaml
root: /tech-blog/
```

用户主页：

```yaml
root: /
```

### Actions 构建失败

先在本地复现：

```bash
npm ci
npm run build
```

如果本地成功、线上失败，检查：

- Node.js 版本。
- 是否提交了 `package-lock.json`。
- 是否引用了本地绝对路径。
- 文件名大小写是否一致。

### 新文章没出现在网站

检查：

- 文件是否在 `source/_posts/`。
- front matter 是否从第一行开始。
- `date` 是否是未来时间。
- 是否执行并推送了 commit。

### 分类或标签没出现

分类和标签不是在 `_config.yml` 里创建的，而是在文章 front matter 里使用后才出现。

## 14. 建议维护节奏

每次写文章：

1. 新建文章。
2. 写 front matter。
3. 本地预览。
4. 构建验证。
5. 提交并推送。
6. 看 Actions 是否成功。

每周：

- 检查有没有草稿可以发布。
- 检查技术栈地图有没有需要补链接的主题。
- 检查分类和标签是否混乱。
- 运行一次 `npm outdated`。

每月：

- 整理一篇总结或索引文章。
- 检查旧文章是否需要更新 `updated`。
- 检查图片和外链是否失效。
- 备份 Obsidian 到博客的来源链路。

## 15. 当前机器状态

截至 2026-06-16，本机状态：

- 本地构建通过。
- Git 远端已经配置为 `git@github-strong:strong-coder9527/tech-blog.git`。
- 本机没有 `gh` CLI，但当前 SSH remote 已经可以推送到 `strong-coder9527/tech-blog`。
- `_config.yml` 的 `url` 应为 `https://strong-coder9527.github.io/tech-blog`。

因此下一步需要：

1. 提交并推送当前修正。
2. 在 GitHub 仓库的 `Actions` 标签页查看 `Pages` workflow 是否运行成功。
3. 如果没有自动运行，可以进入 `Actions -> Pages -> Run workflow` 手动触发一次。
4. 成功后访问 `https://strong-coder9527.github.io/tech-blog/`。
