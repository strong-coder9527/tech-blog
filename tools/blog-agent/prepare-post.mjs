#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BLOG_ROOT = process.cwd();
const POSTS_DIR = path.join(BLOG_ROOT, "source", "_posts");
const IMAGES_DIR = path.join(BLOG_ROOT, "source", "images");
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.log(`Usage:
  npm run blog:prepare -- --input "/path/to/note.md" [options]

Options:
  --title "标题"
  --slug "post-slug"
  --categories "运维与网络/OpenWrt"
  --tags "OpenWrt,DNS"
  --date "2026-07-13 20:00:00"
  --vault-root "/Users/rich/Documents/rich的知识库/rich知识库"
  --force
`);
}

function formatDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(":");
}

function splitList(value, fallback = []) {
  if (!value) return fallback;
  return String(value)
    .split(/[，,/>]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function stripFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontMatter: "", body: markdown };
  return { frontMatter: match[1], body: markdown.slice(match[0].length) };
}

function readFrontMatterValue(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function titleFromMarkdown(body, fallback) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function makeSlug(value) {
  return String(value)
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[\\/:*?"<>|#%&{}$!'@+`=]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "post";
}

function isRemoteUrl(value) {
  return /^(https?:)?\/\//i.test(value) || /^(mailto|tel):/i.test(value);
}

function isImagePath(value) {
  return IMAGE_EXTS.has(path.extname(value.split(/[?#]/)[0]).toLowerCase());
}

function resolveAsset(assetRef, inputDir, vaultRoot) {
  const cleanRef = decodeURIComponent(assetRef).replace(/^<|>$/g, "").trim();
  const candidates = [
    path.resolve(inputDir, cleanRef),
    vaultRoot ? path.resolve(vaultRoot, cleanRef) : "",
    vaultRoot ? path.resolve(vaultRoot, "attachments", cleanRef) : "",
    vaultRoot ? path.resolve(vaultRoot, "附件", cleanRef) : "",
    vaultRoot ? path.resolve(vaultRoot, "images", cleanRef) : "",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || "";
}

function uniqueName(destDir, filename) {
  const parsed = path.parse(filename);
  let candidate = filename;
  let index = 2;
  while (fs.existsSync(path.join(destDir, candidate))) {
    candidate = `${parsed.name}-${index}${parsed.ext}`;
    index += 1;
  }
  return candidate;
}

function copyAsset(assetPath, slug) {
  const destDir = path.join(IMAGES_DIR, slug);
  fs.mkdirSync(destDir, { recursive: true });
  const filename = uniqueName(destDir, path.basename(assetPath));
  fs.copyFileSync(assetPath, path.join(destDir, filename));
  return `/images/${slug}/${encodeURI(filename)}`;
}

function convertImages(body, inputDir, vaultRoot, slug, copied) {
  let next = body;

  next = next.replace(/!\[\[([^\]]+)\]\]/g, (full, raw) => {
    const [assetRaw, captionRaw] = raw.split("|");
    const assetPath = resolveAsset(assetRaw.trim(), inputDir, vaultRoot);
    if (!assetPath) return full;
    const publicPath = copyAsset(assetPath, slug);
    copied.push({ from: assetPath, to: publicPath });
    const alt = captionRaw?.trim() || path.parse(assetPath).name;
    return `![${alt}](${publicPath})`;
  });

  next = next.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, rawPath) => {
    const assetRef = rawPath.trim().replace(/^<|>$/g, "");
    if (isRemoteUrl(assetRef) || assetRef.startsWith("/images/") || !isImagePath(assetRef)) {
      return full;
    }
    const assetPath = resolveAsset(assetRef, inputDir, vaultRoot);
    if (!assetPath) return full;
    const publicPath = copyAsset(assetPath, slug);
    copied.push({ from: assetPath, to: publicPath });
    return `![${alt}](${publicPath})`;
  });

  return next;
}

function convertWikiLinks(body) {
  return body.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    const [target, alias] = raw.split("|").map((item) => item.trim());
    return alias || target;
  });
}

function removeDuplicateTitle(body, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.replace(new RegExp(`^#\\s+${escaped}\\s*\\r?\\n+`), "");
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) {
  usage();
  process.exit(1);
}

const inputPath = path.resolve(args.input);
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const inputDir = path.dirname(inputPath);
const vaultRoot = args["vault-root"] ? path.resolve(args["vault-root"]) : "";
const original = fs.readFileSync(inputPath, "utf8");
const { frontMatter, body } = stripFrontMatter(original);

const fallbackTitle = path.basename(inputPath, path.extname(inputPath));
const title = args.title || readFrontMatterValue(frontMatter, "title") || titleFromMarkdown(body, fallbackTitle);
const slug = makeSlug(args.slug || readFrontMatterValue(frontMatter, "slug") || fallbackTitle);
const date = args.date || readFrontMatterValue(frontMatter, "date") || formatDate();
const categories = splitList(args.categories || readFrontMatterValue(frontMatter, "categories"), ["技术随笔"]);
const tags = splitList(args.tags || readFrontMatterValue(frontMatter, "tags"), []);

const copied = [];
let content = body.trimStart();
content = removeDuplicateTitle(content, title);
content = convertImages(content, inputDir, vaultRoot, slug, copied);
content = convertWikiLinks(content);
content = content.replace(/\n{3,}/g, "\n\n").trim() + "\n";

const front = [
  "---",
  `title: ${yamlString(title)}`,
  `date: ${yamlString(date)}`,
  "categories:",
  ...categories.map((item) => `  - ${yamlString(item)}`),
  "tags:",
  ...(tags.length ? tags.map((item) => `  - ${yamlString(item)}`) : []),
  "---",
  "",
].join("\n");

fs.mkdirSync(POSTS_DIR, { recursive: true });
const datePrefix = String(date).slice(0, 10);
const outputPath = path.join(POSTS_DIR, `${datePrefix}-${slug}.md`);

if (fs.existsSync(outputPath) && !args.force) {
  console.error(`Output already exists: ${outputPath}`);
  console.error("Use --force to overwrite.");
  process.exit(1);
}

fs.writeFileSync(outputPath, front + content, "utf8");

console.log(`Post written: ${outputPath}`);
console.log(`Title: ${title}`);
console.log(`Categories: ${categories.join(" > ")}`);
console.log(`Tags: ${tags.join(", ") || "(none)"}`);
console.log(`Images copied: ${copied.length}`);
for (const item of copied) {
  console.log(`- ${item.from} -> ${item.to}`);
}
