# Hermes Blog Agent 使用手册

这个文档记录博客维护专用 Hermes profile 的用法。

## 1. Agent 是什么

已创建独立 profile：

```text
blog
```

配置目录：

```text
/Users/rich/.hermes/profiles/blog
```

默认工作目录：

```text
/Users/rich/Documents/New project 2/tech-blog
```

启动：

```bash
blog chat
```

一次性执行：

```bash
blog -z "把 /path/to/article.md 整理后发布到 运维与网络/OpenWrt，标签 OpenWrt,DNS，注意脱敏"
```

## 2. 标准发布指令

你以后可以这样对它说：

```text
把这篇文章发布到博客：
/Users/rich/Documents/rich的知识库/rich知识库/运维相关/docs/openwrt扩容.md

分类：运维与网络/OpenWrt
标签：OpenWrt, Extroot, 磁盘扩容
要求：处理图片、排版、脱敏、构建通过后推送。
```

Agent 应该完成：

1. 读取原文。
2. 判断标题、分类、标签和 slug。
3. 导入到 `source/_posts/`。
4. 复制图片到 `source/images/<slug>/`。
5. 修正图片链接。
6. 清理 Obsidian 双链。
7. 脱敏。
8. 构建验证。
9. 提交并推送。

## 3. 手动导入脚本

如果你想不用 Agent，自己也可以跑：

```bash
cd "/Users/rich/Documents/New project 2/tech-blog"

npm run blog:prepare -- \
  --input "/Users/rich/Documents/rich的知识库/rich知识库/运维相关/docs/openwrt扩容.md" \
  --categories "运维与网络/OpenWrt" \
  --tags "OpenWrt,Extroot,磁盘扩容" \
  --slug "openwrt-extroot-expansion"
```

生成文章后检查：

```bash
npm run blog:scan
npm run clean
npm run build
```

## 4. 敏感信息扫描

普通扫描：

```bash
npm run blog:scan
```

严格扫描某篇文章：

```bash
npm run blog:scan:strict -- source/_posts/xxx.md
```

会重点识别：

- API key / token / JWT / Bearer token
- 私钥
- 密码字段
- IP 地址
- 邮箱
- 手机号
- SSH 连接串

如果某行是故意写的示例，可以加：

```html
<!-- blog-scan-ignore-line -->
```

## 5. 模型建议

这类任务不需要一直用最强模型。

推荐策略：

- 默认：低成本云模型或本地 30B 级模型。
- 敏感审计：规则脚本必须跑；模型只做辅助判断。
- 大篇幅重写/多文档合并：再切强模型。
- 发布动作：主要靠脚本、Git、Hexo 构建结果，不靠模型能力。

当前本地 OpenAI-compatible 服务：

```text
http://127.0.0.1:8000/v1
```

已经可用。`blog` profile 默认使用：

```text
Qwen3-Coder-Next-MLX-6bit
```

如果后续要改模型，可以编辑：

```text
/Users/rich/.hermes/profiles/blog/config.yaml
```

里的：

```yaml
model:
  provider: local-omlx
  default: Qwen3-Coder-Next-MLX-6bit
```
