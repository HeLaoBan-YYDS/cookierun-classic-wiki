import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { CONTENT_TYPES } from "@/config/navigation";
import { getDynamicNavigation } from "@/lib/content";
import { generateHomeMetadata } from "../_views/home-meta";
import { HomeView } from "../_views/HomeView";
import { generateSlugMetadata, SlugView } from "../_views/SlugView";

/**
 * `[locale]/page.tsx` 在 Next.js 路由优先级里高于 catch-all，因此承担：
 *   - `/{en,th,ko,ja}/`  各语言首页
 *   - `/guide`、`/codes` ...  英文单段分类列表（CONTENT_TYPES 走这里，
 *     effectiveLocale=en 渲染）
 *
 * 静态导出产物会输出 `out/en/index.html`（英文首页）与 `out/guide/index.html` 等；
 * 部署时由 `scripts/postbuild.mjs` 把 `out/en/*` 移根，符合 as-needed 语义。
 *
 * dev 模式下，根级 `app/page.tsx` 处理 `/` 渲染英文首页（避免跳到 /en/），
 * `/en/` 仍由本段处理（[locale]=en），便于调试与 QA。
 */
export async function generateStaticParams() {
  const localeParams = routing.locales.map((locale) => ({ locale }));
  const contentTypeParams = CONTENT_TYPES.map((ct) => ({ locale: ct }));
  return [...localeParams, ...contentTypeParams];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (CONTENT_TYPES.includes(locale)) {
    setRequestLocale(routing.defaultLocale);
    return generateSlugMetadata({ locale: routing.defaultLocale, slug: [locale] });
  }
  if (!hasLocale(routing.locales, locale)) return {};
  setRequestLocale(locale);
  return generateHomeMetadata({ locale: locale as Locale });
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (CONTENT_TYPES.includes(locale)) {
    setRequestLocale(routing.defaultLocale);
    const navGroups = getDynamicNavigation(routing.defaultLocale);
    return SlugView({ locale: routing.defaultLocale, slug: [locale], navGroups });
  }
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return HomeView({ locale: locale as Locale });
}
