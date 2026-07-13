#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function readConfigUrl() {
  const text = fs.readFileSync(path.resolve("_config.yml"), "utf8");
  const url = text.match(/^url:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  if (!url) throw new Error("Cannot read url from _config.yml");
  return url.replace(/\/+$/, "") + "/";
}

function parseArgs(argv) {
  const args = { paths: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--base-url") args.baseUrl = argv[++i];
    else if (item === "--timeout") args.timeout = Number(argv[++i]);
    else args.paths.push(item);
  }
  return args;
}

function buildUrl(baseUrl, item) {
  if (/^https?:\/\//i.test(item)) return item;
  if (item === "/" || item === "") return baseUrl;
  return new URL(item.replace(/^\/+/, ""), baseUrl).toString();
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": "tech-blog-online-check/1.0" }
    });
    const contentType = response.headers.get("content-type") || "";
    const shouldRead = /text|json|xml|javascript|css/i.test(contentType);
    const text = shouldRead ? await response.text() : "";
    return { ok: response.ok, status: response.status, contentType, bytes: text.length };
  } finally {
    clearTimeout(timer);
  }
}

const args = parseArgs(process.argv.slice(2));
const baseUrl = (args.baseUrl || readConfigUrl()).replace(/\/+$/, "") + "/";
const timeoutMs = args.timeout || 15000;
const paths = args.paths.length ? args.paths : [
  "/",
  "search/",
  "search.json",
  "atom.xml",
  "sitemap.xml",
  "robots.txt",
  "tech-stack/",
  "categories/",
  "tags/"
];

let failed = 0;
console.log(`Online check base: ${baseUrl}`);

for (const item of paths) {
  const url = buildUrl(baseUrl, item);
  try {
    const result = await fetchWithTimeout(url, timeoutMs);
    const label = result.ok ? "OK" : "FAIL";
    console.log(`${label} ${result.status} ${url} ${result.contentType} ${result.bytes}B`);
    if (!result.ok) failed += 1;
  } catch (error) {
    failed += 1;
    console.log(`FAIL ERR ${url} ${error.message}`);
  }
}

if (failed) {
  console.error(`Online check failed: ${failed} URL(s).`);
  process.exit(2);
}

console.log("Online check passed.");
