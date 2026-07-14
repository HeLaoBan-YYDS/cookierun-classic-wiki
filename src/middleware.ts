import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * next-intl as-needed locale 中间件 (Workers + OpenNext 适配版)。
 *
 * 已知坑:next-intl 4.x 对根级静态页 (`app/about/page.tsx` 等,不在 [locale]
 * 段下) 会在 `localePrefix: "as-needed"` 模式下做错误的 rewrite,把
 * `/about` 当成 `/en/about` 去 [locale] 路由里找,结果 404。
 *
 * 解法:matcher 排除掉根级静态页和明确不带 locale 的路径,让 middleware
 * 只对真正需要 locale 处理的路径运行(SSG 详情页 + 非默认 locale 入口)。
 *
 * 规则 (next-intl 4 `localePrefix: "as-needed"`):
 *   - 默认 locale (en) 的 `/en` / `/en/foo`  → 重定向到 `/` / `/foo`
 *   - 其它 locale (th/ko/ja) 保留前缀
 *   - 没有 locale 前缀的根级页(about / copyright / privacy-policy /
 *     terms-of-service)不在 [locale] 段下,直接绕过中间件
 */
export default createMiddleware(routing);

// 不在 middleware 管辖范围的路径:
//   - 根级静态页 (root-level ○ pages)
//   - API / 内部资源 / 任何带扩展名的文件
// 其余路径(<locale>/*, content type overview, MDX 详情页)走中间件。
export const config = {
  matcher: [
    "/((?!api|_next|_vercel|about|copyright|privacy-policy|terms-of-service|.*\\..*).*)",
  ],
};
