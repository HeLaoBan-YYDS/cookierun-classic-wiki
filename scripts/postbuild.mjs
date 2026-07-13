// postbuild.mjs
// ----------------------------------------------------------------------------
// `next-intl` 4.x 在 `output: "export"` + `localePrefix: "as-needed"` 模式下
// 不会自动剥离默认 locale 的目录前缀：build 后会输出 `out/en/*`，但我们需要
// 英文版直接出现在根路径（`out/index.html`、`out/guide/xxx/index.html` 等）。
//
// 这个脚本在 `next build` 之后执行：
//   1. 把 `out/en/` 下的所有文件递归复制（覆盖）到 `out/`。
//   2. 删除 `out/en/`。
//
// 设计要点：
//   - 使用 copy + remove 而不是 rename，避免跨设备/长路径下 rename 失败。
//   - 根级 `app/page.tsx` 与 `app/[locale]/page.tsx`（[locale]=en）会同时
//     生成英文首页（`out/index.html` vs `out/en/index.html`），二者内容相同，
//     复制阶段直接覆盖即可。
//   - `_next`、`_redirects`、`_headers` 等 Cloudflare Pages 资源不会被
//     `out/en/` 占用，安全。
// ----------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "out");
const EN_DIR = path.join(OUT_DIR, "en");

if (!fs.existsSync(EN_DIR)) {
  console.log("[postbuild] out/en/ not found, skipping (build may have already flattened)");
  process.exit(0);
}

console.log("[postbuild] Flattening out/en/* into out/* (as-needed locale handling)...");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(EN_DIR, OUT_DIR);
fs.rmSync(EN_DIR, { recursive: true, force: true });
console.log("[postbuild] Done. out/en/ removed.");
