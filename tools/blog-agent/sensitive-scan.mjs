#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const TEXT_EXTS = new Set([".md", ".markdown", ".html", ".yml", ".yaml", ".json", ".js", ".ts", ".css", ".styl"]);

function parseArgs(argv) {
  const args = { paths: [], strict: false };
  for (const item of argv) {
    if (item === "--strict") args.strict = true;
    else if (item === "--help" || item === "-h") args.help = true;
    else args.paths.push(item);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node tools/blog-agent/sensitive-scan.mjs [--strict] <path...>

Scans text files for secrets and publish-risk data.
Use <!-- blog-scan-ignore-line --> to suppress one intentional example line.
`);
}

const RULES = [
  { id: "private-key", severity: "high", regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/g },
  { id: "openai-style-key", severity: "high", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { id: "github-token", severity: "high", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/g },
  { id: "gitlab-token", severity: "high", regex: /\bglpat-[A-Za-z0-9_-]{20,}\b/g },
  { id: "slack-token", severity: "high", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g },
  { id: "aws-access-key", severity: "high", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "jwt", severity: "high", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { id: "bearer-token", severity: "high", regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/gi },
  { id: "secret-assignment", severity: "high", regex: /\b(?:password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|client[_-]?secret)\b\s*[:=]\s*["']?[^"'\s`]{8,}/gi },
  { id: "ipv4-address", severity: "review", regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  { id: "email", severity: "review", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { id: "cn-phone", severity: "review", regex: /\b1[3-9]\d{9}\b/g },
  { id: "ssh-command", severity: "review", regex: /\bssh\s+[^@\s]+@[A-Za-z0-9_.-]+/g },
];

const IGNORE_IPS = new Set(["0.0.0.0", "127.0.0.1", "255.255.255.255"]);
const DOC_IP_PREFIXES = ["192.0.2.", "198.51.100.", "203.0.113."];

function shouldIgnore(rule, match, line) {
  if (line.includes("blog-scan-ignore-line")) return true;
  if (rule.id === "ipv4-address") {
    if (IGNORE_IPS.has(match)) return true;
    if (DOC_IP_PREFIXES.some((prefix) => match.startsWith(prefix))) return true;
  }
  if (rule.id === "secret-assignment" && /<[^>]+>|YOUR_|example|placeholder/i.test(match)) {
    return true;
  }
  return false;
}

function mask(value) {
  if (value.length <= 12) return "<redacted>";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  if (!stat.isDirectory()) return [];
  const entries = fs.readdirSync(target, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === "public" || entry.name === ".git") return [];
    return walk(path.join(target, entry.name));
  });
}

function scanFile(file) {
  if (!TEXT_EXTS.has(path.extname(file).toLowerCase())) return [];
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      rule.regex.lastIndex = 0;
      let match;
      while ((match = rule.regex.exec(line)) !== null) {
        const value = match[0];
        if (shouldIgnore(rule, value, line)) continue;
        findings.push({
          file,
          line: index + 1,
          rule: rule.id,
          severity: rule.severity,
          match: mask(value),
        });
      }
    }
  });

  return findings;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args.paths.length === 0) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const files = args.paths.flatMap((item) => walk(path.resolve(item)));
const findings = files.flatMap(scanFile);

if (findings.length === 0) {
  console.log(`Sensitive scan passed. Files scanned: ${files.length}`);
  process.exit(0);
}

console.log(`Sensitive scan findings: ${findings.length}`);
for (const item of findings) {
  console.log(`${item.severity.toUpperCase()} ${item.rule} ${item.file}:${item.line} ${item.match}`);
}

const hasHigh = findings.some((item) => item.severity === "high");
if (hasHigh || args.strict) {
  console.error(hasHigh ? "High severity sensitive data detected." : "Strict mode blocks review findings.");
  process.exit(2);
}

console.log("Review findings detected, but no high severity secret matched.");
