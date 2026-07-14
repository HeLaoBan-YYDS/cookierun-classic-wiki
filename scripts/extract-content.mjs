// scripts/extract-content.mjs
// ----------------------------------------------------------------------------
// Workers 运行时不能 fs.readFileSync,所以把 `content/**/*.mdx` 在 build time
// 解析成 `src/generated/content-index.json`,运行时直接 import JSON。
//
// 提取项：
//   - 每个 MDX 文件的 `export const metadata` (扁平字符串 / 日期字段)
//   - `##` / `###` 标题 (id 走 github-slugger,与运行时保持一致)
//
// JSON 结构：
//   {
//     "files":   { "<locale>/<contentType>/<fileName>": FileEntry, ... },
//     "byLocale":{ "<locale>": { "<contentType>": FileEntry[] } }
//   }
//
// 由 npm `prebuild` 钩子自动调用,无需手动运行。
// ----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const OUTPUT = path.join(ROOT, "src", "generated", "content-index.json");

const LOCALES = ["en", "th", "ko", "ja"];
const CONTENT_TYPES = [
  "guide",
  "codes",
  "cookies",
  "combi",
  "treasures",
  "farming",
  "release",
  "community",
];

/**
 * 把文件名 (含 .mdx 后缀) 转为 URL-safe slug,
 * 与 src/lib/content.ts 的 fileNameToSlug 行为完全一致。
 */
function fileNameToSlug(fileName) {
  return fileName
    .replace(/\.mdx$/, "")
    .replace(/[^a-zA-Z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 从 MDX 源里提取 `export const metadata = { ... }` 的字符串/日期字段。
 * 当前仓库所有 metadata 都是扁平的字符串 + ISO 日期,本解析器不支持嵌套对象/数组;
 * 若未来 metadata 出现复杂结构,需切到 acorn / babel-parser 之类。
 */
function extractMetadata(source) {
  const start = source.indexOf("export const metadata");
  if (start === -1) return null;
  const eqIdx = source.indexOf("=", start);
  if (eqIdx === -1) return null;
  const braceStart = source.indexOf("{", eqIdx);
  if (braceStart === -1) return null;

  // 找匹配的右花括号
  let depth = 1;
  let i = braceStart + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    i += 1;
  }
  if (depth !== 0) return null;

  const body = source.slice(braceStart + 1, i - 1);
  const result = {};
  // 匹配 key: "str" / 'str' / YYYY-MM-DD / bareWord
  const fieldRegex =
    /(\w+)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(\d{4}-\d{2}-\d{2})|(\w+))/g;
  let m;
  while ((m = fieldRegex.exec(body)) !== null) {
    const key = m[1];
    let value;
    if (m[2] !== undefined) value = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    else if (m[3] !== undefined) value = m[3].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
    else if (m[4] !== undefined) value = m[4];
    else if (m[5] !== undefined) value = m[5];
    if (value !== undefined) result[key] = value;
  }
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * 提取 ## / ### 标题,id 走 github-slugger (与运行时 useMDXComponents 一致)。
 * 与 src/lib/content.ts 的 extractHeadings 等价。
 */
function extractHeadings(mdxSource) {
  const headings = [];
  const slugger = new GithubSlugger();
  const lines = mdxSource.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]*>/g, "")
      .replace(/\{[^}]*\}/g, "")
      .replace(/[`*_~]/g, "")
      .trim();
    const id = slugger.slug(text) || "section";
    headings.push({ id, text, level });
  }
  return headings;
}

function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const files = {};
  const byLocale = {};
  let total = 0;

  for (const locale of LOCALES) {
    byLocale[locale] = {};
    for (const contentType of CONTENT_TYPES) {
      const dir = path.join(CONTENT_ROOT, locale, contentType);
      if (!fs.existsSync(dir)) continue;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const group = [];
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
        const fullPath = path.join(dir, entry.name);
        const source = fs.readFileSync(fullPath, "utf-8");
        const metadata = extractMetadata(source) || {};
        const headings = extractHeadings(source);
        const fileName = entry.name.replace(/\.mdx$/, "");
        const slug = fileNameToSlug(fileName);

        const fileEntry = {
          fileName,
          slug,
          // 当前仓库 content/<ct>/ 下面都是平铺 .mdx,没有嵌套子目录。
          // 若以后引入嵌套,递归遍历时把 basePath 拼进来即可。
          slugSegments: [slug],
          metadata,
          headings,
        };
        const key = `${locale}/${contentType}/${fileName}`;
        files[key] = fileEntry;
        group.push(fileEntry);
        total += 1;
      }
      if (group.length > 0) byLocale[locale][contentType] = group;
    }
  }

  const output = { files, byLocale };
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(
    `[extract-content] Wrote ${total} entries to ${path.relative(ROOT, OUTPUT)}`,
  );
}

main();
