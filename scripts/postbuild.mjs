/**
 * postbuild: 把 `out/<defaultLocale>/*` 平铺到 `out/*`，
 * 让英文（默认 locale）走无前缀 URL（/guide 而非 /en/guide）。
 *
 * next-intl 4.x 在 `output: "export"` + `localePrefix: "as-needed"` 模式下，
 * 仍会把每个 locale 都生成到独立的 [locale] 子目录里，as-needed 的
 * "无前缀"语义只能通过本脚本在产物层补齐。
 *
 * 之后 `_redirects` 中的 `/en -> /` 和 `/en/* -> /:splat` 仍保留，
 * 用于把历史 / 外链的 /en 流量 301 到新地址。
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { readFileSync } from "node:fs";

// 从 src/i18n/routing.ts 读取默认 locale，避免硬编码
function readDefaultLocale() {
  const src = readFileSync(
    path.resolve(process.cwd(), "src/i18n/routing.ts"),
    "utf-8",
  );
  const m = src.match(/defaultLocale:\s*["']([^"']+)["']/);
  if (!m) throw new Error("defaultLocale not found in src/i18n/routing.ts");
  return m[1];
}

const OUT_DIR = path.resolve(process.cwd(), "out");
const DEFAULT_LOCALE = readDefaultLocale();
const SRC = path.join(OUT_DIR, DEFAULT_LOCALE);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function moveContents(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    if (await exists(to)) {
      // 默认 locale 与其它构建产物同名时（如未来根目录也有同名文件），
      // 跳过避免覆盖。生产场景下默认 locale 子目录之外不会有同名文件。
      continue;
    }
    await fs.rename(from, to);
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.log(`[postbuild] no ${DEFAULT_LOCALE}/ directory under out/, skip.`);
    return;
  }

  await moveContents(SRC, OUT_DIR);
  // 删除空目录（可能还剩少数子文件已合并）
  try {
    const remaining = await fs.readdir(SRC);
    if (remaining.length === 0) {
      await fs.rmdir(SRC);
    }
  } catch {
    // 忽略
  }

  console.log(`[postbuild] moved out/${DEFAULT_LOCALE}/* -> out/*`);
}

main().catch((err) => {
  console.error("[postbuild] failed:", err);
  process.exit(1);
});
