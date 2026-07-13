import { routing, type Locale } from "@/i18n/routing";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cookierun-classic-wiki.wiki";

/**
 * 给定一条无 locale 前缀的内部路径，返回带正确 locale 前缀的可访问 URL：
 *  - 默认 locale（en）走无前缀
 *  - 其它 locale 走 /{locale}/... 前缀
 */
export function localizedPathname(pathname: string, locale: Locale): string {
  return locale === routing.defaultLocale
    ? pathname
    : `/${locale}${pathname === "/" ? "" : pathname}`;
}

/**
 * 生成 hreflang 链接映射：
 *  - 每个 locale 一条 localizedPathname
 *  - x-default 指向默认 locale 的无前缀版本（即英文）
 */
export function languageAlternates(pathname: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedPathname(pathname, locale)]),
    ),
    "x-default": pathname,
  };
}

/**
 * 站点内允许的 URL 形态：根 path 永远不带前缀；其它语言带前缀。
 * sitemap / canonical / 链接拼接都走这一份。
 */
export const DEFAULT_LOCALE: Locale = routing.defaultLocale;
