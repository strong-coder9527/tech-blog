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

workflow 里显式设置了：

```yaml
env:
  TZ: Asia/Shanghai
```

这样 GitHub Actions 云端构建和本地构建会使用一致的日期路径，避免文章在本地是 `/2026/06/05/`，上线后变成 `/2026/06/04/`。

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

## 12. 评论系统维护

当前评论系统使用 Utterances：

```text
https://utteranc.es/
```

配置位置：

```text
_config.rich-tech.yml
themes/rich-tech/_config.yml
themes/rich-tech/layout/_partial/comments.ejs
```

当前配置：

```yaml
utterances:
  enable: true
  repo: strong-coder9527/tech-blog
  issue_term: pathname
  label: comment
  theme: github-light
```

工作方式：

- 每篇文章对应 GitHub 仓库里的一个 Issue。
- 读者需要登录 GitHub 才能评论。
- 评论数据保存在 `strong-coder9527/tech-blog` 的 Issues 里。
- 管理评论就是管理 GitHub Issues，可以关闭、删除、锁定或编辑。

首次启用还需要在 GitHub 上安装 Utterances App：

```text
https://github.com/apps/utterances
```

安装时选择：

```text
Only select repositories -> strong-coder9527/tech-blog
```

如果没有安装，文章页会加载评论脚本，但评论区无法正常创建 Issue。

单篇文章如果不想显示评论，在文章 front matter 里加：

```yaml
comments: false
```

## 13. 访客统计和浏览量维护

当前使用不蒜子做轻量统计：

```text
https://busuanzi.ibruce.info/
```

它不需要注册账号，也不需要后端数据库，适合静态博客先快速接上基础统计。

当前会显示三类数字：

- 站点总访问量：全站 PV。
- 站点访客数：全站 UV。
- 单篇文章阅读量：当前页面 PV。

配置位置：

```text
_config.rich-tech.yml
themes/rich-tech/_config.yml
themes/rich-tech/layout/_partial/busuanzi.ejs
themes/rich-tech/layout/_partial/footer.ejs
themes/rich-tech/layout/_partial/article.ejs
```

当前配置：

```yaml
busuanzi:
  enable: true
  script_url: https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js
  site_pv: true
  site_uv: true
  page_pv: true
```

字段含义：

- `enable`：总开关。
- `site_pv`：是否在页脚显示全站总访问量。
- `site_uv`：是否在页脚显示全站访客数。
- `page_pv`：是否在文章页显示当前页面阅读量。
- `script_url`：统计脚本地址。

如果只想关闭单篇文章阅读量：

```yaml
busuanzi:
  page_pv: false
```

如果想完全关闭统计：

```yaml
busuanzi:
  enable: false
```

注意：

- 不蒜子只适合展示基础数字，没有后台仪表盘。
- 统计数字由第三方脚本异步加载，本地预览或浏览器插件拦截时可能显示 `-`。
- 如果以后需要来源分析、国家地区、访问路径、趋势图，可以升级到 Umami、GoatCounter 或 Google Analytics。

## 14. 外部视频嵌入维护

当前博客已经在主题样式里支持响应式外部视频容器：

```text
themes/rich-tech/source/css/_partial/rich-polish.styl
```

日常写文章时，推荐使用 `.video-wrap`：

```html
<div class="video-wrap">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=BVxxxxxx&page=1&autoplay=0"
    allowfullscreen>
  </iframe>
</div>
```

YouTube：

```html
<div class="video-wrap">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube video player"
    allowfullscreen>
  </iframe>
</div>
```

可选说明文字：

```html
<p class="video-caption">视频：这是一段操作演示。</p>
```

维护原则：

- 外部平台视频只嵌入 iframe，不把大视频提交到仓库。
- B 站链接建议加 `autoplay=0`，不要默认自动播放。
- 如果视频在手机端比例异常，优先检查外面是否包了 `.video-wrap`。
- 如果视频无法加载，优先检查平台是否允许第三方嵌入、浏览器是否拦截 iframe。

## 15. 搜索、RSS、Sitemap 和目录维护

当前博客已经内置静态搜索和基础 SEO 文件，不依赖外部服务。

构建时自动生成：

```text
search.json
atom.xml
sitemap.xml
robots.txt
```

对应实现：

```text
scripts/search-index.js
scripts/seo-files.js
source/search/index.md
themes/rich-tech/source/js/search.js
themes/rich-tech/layout/_partial/toc.ejs
```

搜索页：

```text
/search/
```

RSS：

```text
/atom.xml
```

Sitemap：

```text
/sitemap.xml
```

文章目录 TOC 默认在文章页显示。当文章标题层级少于 3 个时不会显示目录。单篇文章如果不想显示目录，在 front matter 里加：

```yaml
toc: false
```

维护原则：

- 新文章正常写 Markdown 标题，Hexo 会自动生成锚点，TOC 会自动读取。
- 搜索索引来自文章标题、正文、分类和标签。
- 不要手动编辑 `public/search.json`、`public/atom.xml`、`public/sitemap.xml`，它们都是构建产物。

## 16. 发布后线上检查

推送并等待 GitHub Actions 成功后，运行：

```bash
npm run blog:check-online
```

默认检查：

- 首页
- 搜索页
- `search.json`
- `atom.xml`
- `sitemap.xml`
- `robots.txt`
- 技术栈页
- 分类页
- 标签页

也可以检查指定路径：

```bash
npm run blog:check-online -- search/ atom.xml 2026/06/05/2026-06-05-openwrt-extroot-expansion/
```

如果只是检查本地构建产物，可以先在 `public/` 起静态服务：

```bash
cd public
python3 -m http.server 4173
```

然后在项目根目录运行：

```bash
npm run blog:check-online -- --base-url http://127.0.0.1:4173/
```

## 17. 依赖维护

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

## 18. 常见故障

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

### 评论区不显示或提示仓库未安装

检查：

- 仓库是否是 public。
- 仓库 Issues 是否启用。
- 是否安装了 Utterances App。
- `utterances.repo` 是否是 `strong-coder9527/tech-blog`。
- 文章 front matter 是否写了 `comments: false`。

### 浏览量或访客数一直显示 `-`

检查：

- `_config.rich-tech.yml` 里 `busuanzi.enable` 是否是 `true`。
- 浏览器是否拦截了 `busuanzi.ibruce.info` 的脚本请求。
- 是否正在本地离线预览，第三方脚本没有加载成功。
- 页面 HTML 里是否有 `busuanzi_value_site_pv`、`busuanzi_value_site_uv` 或 `busuanzi_value_page_pv`。

### 外部视频显示比例不对

检查：

- iframe 外面是否包了 `<div class="video-wrap">...</div>`。
- iframe 是否写了固定 `width` 或 `height`，如果写了也可以保留，但比例主要由 `.video-wrap` 控制。
- 视频平台提供的是不是 `embed`/`player` 地址，而不是普通观看页地址。

### 搜索没有结果

检查：

- `npm run build` 是否生成了 `public/search.json`。
- 浏览器控制台是否能加载 `/tech-blog/search.json`。
- 文章是否在 `source/_posts/`，并且不是草稿。

### RSS、Sitemap 或 robots 地址不对

检查：

- `_config.yml` 的 `url` 是否是 `https://strong-coder9527.github.io/tech-blog`。
- 不要在 `scripts/seo-files.js` 里重复拼接 `root`。
- 构建后检查 `public/atom.xml` 和 `public/sitemap.xml` 是否出现重复 `/tech-blog/tech-blog/`。

## 19. 建议维护节奏

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
- 检查图片、外链、搜索、RSS 和 Sitemap 是否正常。
- 备份 Obsidian 到博客的来源链路。

## 20. 当前机器状态

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
