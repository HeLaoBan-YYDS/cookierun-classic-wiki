import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteShell } from "@/app/_views/SiteShell";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * `[locale]` 段承担所有 locale 的页面（en、th、ko、ja），加单段 CONTENT_TYPES
 * 路径（`/guide`、`/codes` 等，effectiveLocale=en 渲染）。
 *
 * 静态导出产物会输出 `out/en/*`（英文版），由 `scripts/postbuild.mjs` 把
 * `out/en/*` 移根成 `out/*`，符合 as-needed 语义（默认 locale 不带前缀）。
 *
 * 该 layout 不包含 `<html>/<body>`，由根级 `app/layout.tsx` 统一提供。
 */
export function generateStaticParams() {
  const localeParams = routing.locales.map((locale) => ({ locale }));
  const contentTypeParams = CONTENT_TYPES.map((ct) => ({ locale: ct }));
  return [...localeParams, ...contentTypeParams];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 分类路径（/guide、/codes...）按英文版渲染（默认 locale 在 as-needed 模式下走根）
  const effectiveLocale = CONTENT_TYPES.includes(locale) ? routing.defaultLocale : locale;
  if (!hasLocale(routing.locales, effectiveLocale)) notFound();
  setRequestLocale(effectiveLocale);
  return <SiteShell locale={effectiveLocale as Locale}>{children}</SiteShell>;
}
