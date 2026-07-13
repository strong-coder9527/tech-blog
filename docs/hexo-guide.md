# Hexo 入门与使用教程

这份文档面向“刚知道 Hexo，但已经想把个人技术博客搭起来”的状态。它以当前项目 `tech-blog/` 为例，先建立整体理解，再讲日常写作、配置、预览、构建、发布，以及后续和 Obsidian / Hermes Agent 联动的方向。

## 1. Hexo 是什么

Hexo 是一个静态博客框架。你用 Markdown 写文章，Hexo 把文章、配置、主题模板和静态资源组合起来，生成一整个可以直接发布的网站。

它的核心特点：

- 文章主要是 Markdown 文件，适合技术博客和知识沉淀。
- 生成结果是静态文件，也就是 HTML、CSS、JS、图片等。
- 静态文件可以免费托管到 GitHub Pages。
- 本地预览很快，适合边写边看。
- 主题和插件生态比较成熟。

可以把 Hexo 理解成：

```text
Markdown 文章 + 站点配置 + 主题模板
                 |
                 v
           Hexo 静态生成
                 |
                 v
         public/ 可发布网站
```

## 2. 当前项目结构

当前博客项目位于：

```bash
/Users/rich/Documents/New project 2/tech-blog
```

重要文件和目录：

```text
tech-blog/
├── _config.yml                    # Hexo 主配置
├── _config.rich-tech.yml          # 当前 rich-tech 本地主题配置
├── package.json                   # npm 命令和依赖
├── package-lock.json              # 锁定依赖版本
├── source/                        # 文章、页面和静态源文件
│   ├── _posts/                    # 已发布文章
│   └── about/index.md             # 关于页
├── scaffolds/                     # 新文章模板
├── public/                        # 构建产物，自动生成，不提交
├── node_modules/                  # 本地依赖，不提交
├── themes/rich-tech/              # 从 Landscape 派生出的本地主题
├── docs/                          # 搭建记录、教程、设计文档
└── .github/workflows/pages.yml    # GitHub Pages 自动部署 workflow
```

最常接触的是这几个：

- `_config.yml`：改站点名、作者、语言、网址、文章链接规则。
- `source/_posts/`：放博客文章。
- `source/about/index.md`：关于页。
- `docs/`：放搭建过程记录和教程。
- `package.json`：看有哪些常用命令。

## 3. 最常用命令

进入项目目录：

```bash
cd "/Users/rich/Documents/New project 2/tech-blog"
```

安装依赖：

```bash
npm install
```

启动本地预览：

```bash
npm run server
```

当前项目按 GitHub Pages 项目页配置，预览地址是：

```text
http://localhost:4000/tech-blog/
```

生成静态网站：

```bash
npm run build
```

清理缓存和构建产物：

```bash
npm run clean
```

新建文章：

```bash
npm run new "文章标题"
```

新建草稿：

```bash
npm run draft "草稿标题"
```

清理、构建、预览一条龙：

```bash
npm run preview
```

这些命令来自 `package.json`，本质上包装的是 Hexo 命令：

```bash
hexo server
hexo generate
hexo clean
hexo new post "文章标题"
hexo new draft "草稿标题"
```

## 4. 文章怎么写

Hexo 默认把文章放在：

```text
source/_posts/
```

一篇文章大概长这样：

```markdown
---
title: 从零搭一个 Hexo + GitHub Pages 技术博客
date: 2026-05-30 00:00:00
categories:
  - 技术随笔
tags:
  - Hexo
  - GitHub Pages
  - Obsidian
---

正文从这里开始。

## 小标题

这里写内容。
```

最上面 `---` 包起来的区域叫 front matter，用来告诉 Hexo 这篇文章的元数据。

常用字段：

```yaml
title: 文章标题
date: 2026-05-30 00:00:00
updated: 2026-05-30 12:00:00
categories:
  - 分类名
tags:
  - 标签1
  - 标签2
```

推荐习惯：

- 一篇文章只放一个主分类。
- 标签可以多个，用来描述技术点。
- 文件名尽量用英文、数字和短横线，URL 更稳。
- 标题可以中文，文件名不一定要中文。

## 5. 分类和标签怎么用

这是 Hexo 日常写作里最容易搞混的地方。先记住一句话：

```text
分类和标签不是在 _config.yml 里逐个创建的，而是在每篇文章的 front matter 里声明的。
```

`_config.yml` 里的 `default_category` 不是分类列表，它只是默认分类。也就是说，如果某篇文章没有写 `categories`，Hexo 就会把它放进这个默认分类。

当前项目里应该只保留一组分类配置：

```yaml
default_category: 技术随笔
category_map:
  技术随笔: tech-notes
  逆向: reverse-engineering
  运维: operations
  软路由: soft-router
  PassWall: passwall
  OpenWrt: openwrt
tag_map:
  GitHub Pages: github-pages
  Hermes Agent: hermes-agent
```

这里每一项的意思：

- `default_category`：文章没写分类时，自动归到哪个分类。
- `category_map`：把分类名映射成更适合 URL 的英文 slug。
- `tag_map`：把标签名映射成更适合 URL 的英文 slug。

也就是说，`category_map` 不是“创建分类”，而是“给分类 URL 起别名”。分类真正出现，是因为文章里用了它。

### 为什么现在只看到一个分类

当前首页右侧已经有分类模块，里面的 `技术随笔` 就是分类。

现在只显示一个分类，是因为目前只有一篇文章，并且这篇文章的 front matter 是：

```yaml
categories:
  - 技术随笔
```

`_config.yml` 里虽然写了：

```yaml
category_map:
  技术随笔: tech-notes
  逆向: reverse-engineering
  运维: operations
```

但这只是 URL 映射，不会自动生成 `逆向` 和 `运维` 两个分类。只有当某篇文章写了：

```yaml
categories:
  - 逆向
```

`逆向` 才会出现在分类列表里。

顶部导航里现在也加了 `Categories` 和 `Tags` 两个入口：

```text
http://localhost:4000/tech-blog/categories/
http://localhost:4000/tech-blog/tags/
```

### 正确归类一篇文章

比如你新写一篇逆向文章，文章顶部这样写：

```yaml
---
title: Frida 安卓 Hook 入门记录
date: 2026-05-30 10:00:00
categories:
  - 逆向
tags:
  - Frida
  - Android
  - Hook
---
```

这篇文章就会归到 `逆向` 分类。因为 `_config.yml` 里有：

```yaml
category_map:
  逆向: reverse-engineering
```

所以分类页 URL 会更接近：

```text
/tech-blog/categories/reverse-engineering/
```

### 新增一个分类

不需要去 `_config.yml` 里复制一组 `default_category`。

你只要在某篇文章里第一次使用这个分类：

```yaml
categories:
  - 工程实践
```

然后运行：

```bash
npm run build
```

Hexo 就会自动生成这个分类对应的页面。

如果你希望这个分类的 URL 不要是中文，可以再去 `_config.yml` 加一个映射：

```yaml
category_map:
  技术随笔: tech-notes
  逆向: reverse-engineering
  运维: operations
  工程实践: engineering-practice
```

### 修改文章分类

打开文章文件，比如：

```text
source/_posts/2026-05-30-hexo-github-pages-start.md
```

把：

```yaml
categories:
  - 技术随笔
```

改成：

```yaml
categories:
  - 工程实践
```

再构建：

```bash
npm run clean
npm run build
```

如果本地服务已经开着，主题或配置变化后建议重启：

```bash
npm run server
```

### 删除一个分类

分类不是单独存在哪里的。要删除分类，就把所有文章 front matter 里这个分类名删掉或改掉。

然后运行：

```bash
npm run clean
npm run build
```

旧分类页就不会再生成。

### 分类和标签的区别

推荐这样理解：

| 类型 | 用法 | 适合放什么 |
| --- | --- | --- |
| 分类 `categories` | 少而稳定，像书架 | 逆向、运维、安全研究、工程实践 |
| 标签 `tags` | 多而灵活，像贴纸 | Frida、Android、GitHub Pages、Obsidian |

一篇文章通常只放一个主分类：

```yaml
categories:
  - 逆向
```

但可以有多个标签：

```yaml
tags:
  - Frida
  - Android
  - 抓包
  - Hook
```

### 分类有层级，标签没有层级

这是一个很重要的细节。

如果你这样写：

```yaml
categories:
  - 逆向
  - Android
```

Hexo 会把它理解成：

```text
逆向 / Android
```

也就是 `Android` 是 `逆向` 的子分类。这不是两个平级分类。

当前软路由文章用的就是这个规则。比如想把一篇 PassWall 文章放到 `运维 / 软路由 / PassWall` 下面，就写：

```yaml
categories:
  - 运维
  - 软路由
  - PassWall
```

Hexo 会自动生成类似这样的分类页：

```text
/tech-blog/categories/operations/soft-router/passwall/
```

如果以后想在 `软路由` 下面继续加子分类，例如 `旁路由`，文章里这样写就行：

```yaml
categories:
  - 运维
  - 软路由
  - 旁路由
```

然后按需在 `_config.yml` 里给新分类补 URL 映射：

```yaml
category_map:
  旁路由: bypass-router
```

如果你只是想表达一篇文章属于 `逆向`，同时技术点是 `Android`，更推荐这样写：

```yaml
categories:
  - 逆向
tags:
  - Android
```

### 多个独立分类怎么写

一般不建议一篇文章放多个主分类，后期管理会乱。但如果确实需要，Hexo 支持多个独立分类路径：

```yaml
categories:
  - [逆向, Android]
  - [安全研究, 移动端]
  - 技术随笔
```

含义是：

```text
逆向 / Android
安全研究 / 移动端
技术随笔
```

日常写作先别用这么复杂的形式。我们的建议是：一篇文章一个主分类，多个标签。

### 当前建议的分类体系

第一阶段先用少量分类，避免还没写几篇文章就把分类树搞复杂。

推荐从这几个开始：

```text
技术随笔
逆向
运维
  软路由
    OpenWrt
    PassWall
工程实践
安全研究
知识系统
工具折腾
```

更细的东西放到标签里：

```text
Frida
Android
iOS
GitHub Pages
Hexo
Obsidian
Hermes Agent
抓包
自动化
```

### 新建一篇带分类的文章

运行：

```bash
npm run new "Frida 安卓 Hook 入门记录"
```

Hexo 会在 `source/_posts/` 下生成文章文件。打开它，把 front matter 改成：

```yaml
---
title: Frida 安卓 Hook 入门记录
date: 2026-05-30 10:00:00
categories:
  - 逆向
tags:
  - Frida
  - Android
  - Hook
---
```

正文写在第二个 `---` 下面。

写完后检查：

```bash
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

分类页大概是：

```text
http://localhost:4000/tech-blog/categories/reverse-engineering/
```

标签页大概是：

```text
http://localhost:4000/tech-blog/tags/Frida/
```

如果标签配置了 `tag_map`，URL 会使用映射后的 slug。

### 查看当前有哪些分类和标签

查看分类：

```bash
npx hexo list category
```

当前输出类似：

```text
Name      Posts
技术随笔      1
```

查看标签：

```bash
npx hexo list tag
```

当前输出类似：

```text
Name          Posts  Path
GitHub Pages      1  tags/github-pages/
Hexo              1  tags/Hexo/
Obsidian          1  tags/Obsidian/
自动化            1  tags/自动化/
```

这两个命令很适合发布前检查：分类有没有写错字、标签有没有重复变体。

### 当前文章归类示例

当前第一篇文章是：

```text
source/_posts/2026-05-30-hexo-github-pages-start.md
```

它现在这样归类：

```yaml
categories:
  - 技术随笔
tags:
  - Hexo
  - GitHub Pages
  - Obsidian
  - 自动化
```

含义是：这篇文章的大类是 `技术随笔`，细节标签是 `Hexo / GitHub Pages / Obsidian / 自动化`。

### 常见错误

错误写法 1：在 `_config.yml` 重复写多个 `default_category`。

```yaml
default_category: 技术随笔
category_map:
tag_map:

default_category: 逆向
category_map:
tag_map:
```

不要这样写。`default_category` 只保留一个。

错误写法 2：把标签当分类。

```yaml
categories:
  - Frida
  - Android
  - Hook
```

这会变成层级分类 `Frida / Android / Hook`。更推荐：

```yaml
categories:
  - 逆向
tags:
  - Frida
  - Android
  - Hook
```

错误写法 3：front matter 不在文件最顶部。

```markdown
# 我先写个标题

---
title: xxx
---
```

不要这样。front matter 必须从文件第一行开始。

正确：

```markdown
---
title: xxx
categories:
  - 技术随笔
tags:
  - Hexo
---

# 正文标题
```

## 6. 文章、页面、草稿的区别

Hexo 默认有三种 layout：

| 类型 | 命令 | 保存位置 | 用途 |
| --- | --- | --- | --- |
| 文章 post | `hexo new post "标题"` | `source/_posts/` | 正常博客文章 |
| 页面 page | `hexo new page "about"` | `source/about/index.md` | 关于页、项目页、导航页 |
| 草稿 draft | `hexo new draft "标题"` | `source/_drafts/` | 暂时不发布的文章 |

发布草稿：

```bash
npx hexo publish draft "草稿文件名"
```

草稿默认不会构建到公开网站里。想本地预览草稿，可以临时运行：

```bash
npx hexo server --draft
```

## 7. 图片和附件怎么处理

第一阶段建议用简单规则：

```text
source/images/
```

比如放一张图：

```text
source/images/hexo-flow.png
```

文章里引用：

```markdown
![Hexo 流程](/images/hexo-flow.png)
```

这里不要手动写 `/tech-blog/images/...`。当前项目的 `_config.yml` 已经有 `root: /tech-blog/`，Hexo 构建时会自动把 `/images/...` 变成 `/tech-blog/images/...`。如果你在 Markdown 里手动写 `/tech-blog/images/...`，最终页面里可能变成 `/tech-blog/tech-blog/images/...`。

后续如果开启 Hexo 的 `post_asset_folder: true`，也可以让每篇文章有自己的资源目录。但这会影响 Obsidian 同步规则，所以先不急着开。

## 8. 外部视频怎么嵌入

当前博客支持直接在 Markdown 文章里写 HTML。推荐统一用 `.video-wrap` 包一层，这样桌面端和手机端都会保持 16:9 比例，不会出现 iframe 被压扁或横向溢出。

### B 站视频

在 B 站视频页复制 `BV` 号，然后写：

```html
<div class="video-wrap">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=BVxxxxxx&page=1&autoplay=0"
    allowfullscreen>
  </iframe>
</div>
```

说明：

- `bvid=BVxxxxxx`：替换成真实 BV 号。
- `page=1`：分 P 视频的第几 P。
- `autoplay=0`：不自动播放，避免打扰读者。

### YouTube 视频

把 YouTube 链接里的视频 ID 填到 `/embed/` 后面：

```html
<div class="video-wrap">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube video player"
    allowfullscreen>
  </iframe>
</div>
```

### 通用 iframe

其他平台如果提供 iframe 嵌入代码，也可以只保留 `iframe`，外面套 `.video-wrap`：

```html
<div class="video-wrap">
  <iframe src="外部平台提供的嵌入地址" allowfullscreen></iframe>
</div>
```

如果要写说明文字：

```html
<p class="video-caption">视频：OpenWrt 扩容操作录屏。</p>
```

建议：

- 大视频优先放外部平台，不要直接提交到 GitHub 仓库。
- 本地只适合放很短的 `.mp4` 演示片段。
- 外部视频嵌入依赖第三方平台，读者网络环境会影响加载速度。

## 9. `_config.yml` 怎么理解

当前主配置在：

```text
_config.yml
```

最关键的几块：

```yaml
title: Rich 的技术博客
subtitle: '记录安全研究、工程实践和个人知识系统'
description: '一个用 Hexo 与 GitHub Pages 搭起来的个人技术博客。'
author: Rich
language: zh-CN
timezone: Asia/Shanghai
```

这是站点基础信息。

```yaml
url: https://YOUR_GITHUB_USERNAME.github.io/tech-blog
root: /tech-blog/
```

这是发布地址和根路径。这里非常重要。

如果你使用项目仓库：

```text
https://用户名.github.io/tech-blog/
```

那么配置应为：

```yaml
url: https://用户名.github.io/tech-blog
root: /tech-blog/
```

如果你使用个人主页仓库：

```text
https://用户名.github.io/
```

那么配置应为：

```yaml
url: https://用户名.github.io
root: /
```

文章链接规则：

```yaml
permalink: :year/:month/:day/:title/
```

生成出来类似：

```text
/2026/05/30/文章文件名/
```

主题：

```yaml
theme: landscape
```

当前先使用 Hexo 默认的 `landscape` 主题。等内容路线稳定以后，再换更适合技术博客的主题。

## 10. 主题怎么配置

当前主题配置在：

```text
_config.landscape.yml
```

现在配置了导航：

```yaml
menu:
  Home: /
  Archives: /archives
  About: /about
```

注意：Hexo 的主题配置会和主题默认配置合并。如果新增不同名字的菜单项，可能出现重复导航。所以这里使用和默认配置同名的 `Home`、`Archives`，再新增 `About`。

主题可以控制：

- 导航菜单。
- RSS。
- 侧边栏。
- 评论系统。
- 统计。
- 社交链接。
- 首页文章摘要样式。

不同主题的配置项不一样。换主题时，一般要看主题自己的 README。

## 11. GitHub Pages 发布流程

当前项目使用 GitHub Actions 发布，不需要手动提交 `public/`。

流程是：

```text
本地写文章
  |
git push 到 GitHub main 分支
  |
GitHub Actions 执行 npm ci + npm run build
  |
上传 public/ 作为 Pages artifact
  |
GitHub Pages 发布网站
```

当前 workflow：

```text
.github/workflows/pages.yml
```

上线前需要做：

1. 在 GitHub 新建仓库，例如 `tech-blog`。
2. 把 `_config.yml` 里的 `YOUR_GITHUB_USERNAME` 改成你的真实 GitHub 用户名。
3. 推送本项目到 GitHub。
4. 到仓库 `Settings -> Pages`。
5. 把发布源设置为 `GitHub Actions`。
6. 等 Actions 跑完，访问 Pages 地址。

如果仓库名不是 `tech-blog`，需要同步改：

```yaml
url: https://用户名.github.io/真实仓库名
root: /真实仓库名/
```

## 12. 一套推荐的日常写作流程

新建草稿：

```bash
npm run draft "一次逆向分析的复盘"
```

写作时本地预览草稿：

```bash
npx hexo server --draft --port 4000
```

文章准备发布时：

```bash
npx hexo publish draft "一次逆向分析的复盘"
```

本地检查：

```bash
npm run clean
npm run build
npm run server
```

提交：

```bash
git add .
git commit -m "Add reverse engineering review post"
git push origin main
```

GitHub Actions 自动发布。

## 13. 推荐的写作规范

文件名：

```text
2026-05-30-hexo-github-pages-start.md
android-frida-hooking-notes.md
ios-reverse-engineering-checklist.md
```

标题可以中文：

```yaml
title: Frida 安卓逆向使用教程：从入门到高阶
```

分类建议少而稳定：

- 技术随笔
- 安全研究
- 逆向分析
- 工程实践
- 工具折腾
- 知识系统

标签可以细：

- Frida
- Android
- iOS
- Hexo
- GitHub Pages
- Obsidian
- Hermes Agent

每篇技术文建议结构：

```markdown
## 背景

为什么要做这件事。

## 环境

系统、工具版本、前置条件。

## 步骤

一步一步做了什么。

## 问题

踩到了什么坑。

## 结论

最后得到什么，后续怎么复用。
```

## 14. 和 Obsidian 联动的方向

Hexo 和 Obsidian 都以 Markdown 为核心，所以天然适合联动。但需要处理几个差异：

Obsidian 常见写法：

```markdown
[[双链]]
![[图片.png]]
#标签
```

Hexo 更偏标准 Markdown：

```markdown
[双链标题](/path/)
![图片说明](/tech-blog/images/image.png)
```

后续可以设计一个同步流程：

```text
Obsidian Vault
  |
选择可发布笔记
  |
转换 front matter、图片路径、双链
  |
复制到 source/_posts/
  |
Hexo 构建发布
```

可以先约定 Obsidian 里要发布的文章必须包含：

```yaml
---
publish: true
title: 文章标题
categories:
  - 技术随笔
tags:
  - Obsidian
---
```

然后后续用脚本或 Hermes Agent 读取 `publish: true` 的笔记，把它们同步到 Hexo。

## 15. Hermes Agent 可以做什么

后面可以让 Hermes Agent 做这些日常管理：

- 每天或每周检查草稿目录。
- 找出超过一周没动的草稿。
- 检查文章 front matter 是否完整。
- 检查图片链接是否存在。
- 检查内部链接和外链是否失效。
- 运行 `npm run build`，记录构建是否成功。
- 根据项目日志整理文章初稿。
- 根据 Obsidian 标签推荐可发布笔记。

第一阶段不要急着自动化太多。先形成稳定的写作目录和文章格式，自动化才会比较顺。

## 16. 常见问题

### 页面样式丢失

通常是 `url` 或 `root` 配错。

项目页：

```yaml
url: https://用户名.github.io/tech-blog
root: /tech-blog/
```

个人主页：

```yaml
url: https://用户名.github.io
root: /
```

### 本地看起来没更新

先清理再启动：

```bash
npm run clean
npm run build
npm run server
```

主题配置变更后，有时需要重启 `hexo server`。

### GitHub Pages 404

检查：

- 仓库是否推到了 GitHub。
- `Settings -> Pages` 是否设置为 GitHub Actions。
- Actions 是否跑成功。
- `_config.yml` 的 `url` 和 `root` 是否与仓库名一致。

### 不要提交哪些文件

这些文件已经由 `.gitignore` 忽略：

```text
node_modules/
public/
db.json
*.log
.DS_Store
```

`node_modules/` 是依赖目录，别人可以用 `npm install` 重建。

`public/` 是构建产物，GitHub Actions 会自动生成。

`db.json` 是 Hexo 缓存文件。

### 中文分类和标签可以用吗

可以。当前项目已经生成了中文分类 `技术随笔`。如果你追求 URL 更简洁，可以后续在 `_config.yml` 里配置 `category_map` 和 `tag_map`。

## 17. 第一阶段路线图

现在已经完成：

- Hexo 初始化。
- 本地预览。
- 第一篇文章。
- 关于页。
- GitHub Pages Actions workflow。
- 搭建记录和教程文档。

下一步建议：

1. 填入真实 GitHub 用户名。
2. 建 GitHub 仓库并推送。
3. 跑通线上访问。
4. 再写 2 到 3 篇真实文章。
5. 根据内容体验决定是否换主题。
6. 设计 Obsidian 同步规则。
7. 再接 Hermes Agent 做维护。

## 18. 参考资料

- Hexo 官方文档：https://hexo.io/docs/
- Hexo 命令说明：https://hexo.io/docs/commands
- Hexo 写作说明：https://hexo.io/docs/writing
- Hexo 配置说明：https://hexo.io/docs/configuration
- Hexo 静态生成说明：https://hexo.io/docs/generating
- Hexo 主题说明：https://hexo.io/docs/themes.html
- GitHub Pages 发布源配置：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
