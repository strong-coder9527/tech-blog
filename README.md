# Rich 的技术博客

这是一个 Hexo + GitHub Pages 的个人技术博客起点。第一阶段目标是先跑通本地写作、静态构建和 GitHub Pages 免费托管；第二阶段再接入 Obsidian 知识库；第三阶段再让 Hermes Agent 参与日常维护。

## 本地使用

```bash
npm install
npm run server
```

常用命令：

```bash
npm run new "文章标题"
npm run draft "草稿标题"
npm run build
npm run preview
```

## GitHub Pages 部署

当前配置按项目页准备，默认仓库名为 `tech-blog`，上线地址形如：

```text
https://YOUR_GITHUB_USERNAME.github.io/tech-blog/
```

需要上线时：

1. 把 `_config.yml` 里的 `YOUR_GITHUB_USERNAME` 改成你的 GitHub 用户名。
2. 在 GitHub 新建仓库 `tech-blog`，推送本目录内容。
3. 进入仓库 `Settings -> Pages`，把 `Source` 改成 `GitHub Actions`。
4. 推送到 `main` 分支后，`.github/workflows/pages.yml` 会自动构建并发布 `public/`。

完整上线与维护流程见：

```text
docs/deploy-maintenance.md
```

如果你想使用个人主页仓库 `YOUR_GITHUB_USERNAME.github.io`，把 `_config.yml` 改成：

```yaml
url: https://YOUR_GITHUB_USERNAME.github.io
root: /
```

## 后续方向

- Obsidian 联动：把某个 vault 的发布目录同步到 `source/_posts/`，再处理 front matter、图片路径和双链。
- Hermes Agent：定期检查草稿、构建状态、断链、待发布文章和内容索引。
- 主题与体验：当前已经基于 Landscape 派生出本地主题 `rich-tech`，后续继续在 `themes/rich-tech/` 内维护。
