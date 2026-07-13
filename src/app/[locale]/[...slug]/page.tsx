import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAllContentPaths, getDynamicNavigation } from "@/lib/content";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { generateSlugMetadata, SlugView } from "../../_views/SlugView";

/**
 * `[locale]/[...slug]/page.tsx` 承担（多段路径）：
 *   - 英文文章详情（/guide/xxx 等，通过 [locale]=<contentType> + slug=["xxx"]，
 *     产物 `out/en/guide/xxx/index.html` 由 postbuild 移根）
 *   - th/ko/ja 的单段分类列表（/th/guide、/ko/codes 等）
 *   - th/ko/ja 的文章详情（/th/guide/xxx 等）
 *
 * 注：单段路径（/guide、/about、/en、/th）的处理：
 *   - `/guide` 等英文分类 → 由 `[locale]/page.tsx` 用 [locale]=guide 处理
 *   - `/about` 等英文法律页 → 由根级 static 路由（`app/about/page.tsx`）处理
 *   - `/en`、`/th` 等 → 由 `[locale]/page.tsx` 处理
 */
export async function generateStaticParams() {
  const allParams: Array<{ locale: string; slug: string[] }> = [];
  const otherLocales = routing.locales.filter((l) => l !== routing.defaultLocale);

  // 英文文章详情：[locale]=<contentType> + slug=[<articleSlugParts>]
  const enArticlePaths = await getAllContentPaths(routing.defaultLocale);
  for (const item of enArticlePaths) {
    allParams.push({ locale: item.contentType, slug: [...item.slug] });
  }

  // th/ko/ja 的单段分类列表：[locale]=<lang> + slug=[<contentType>]
  for (const locale of otherLocales) {
    for (const ct of CONTENT_TYPES) {
      allParams.push({ locale, slug: [ct] });
    }
  }

  // th/ko/ja 的文章详情：[locale]=<lang> + slug=[<contentType>, ...articleSlug]
  for (const locale of otherLocales) {
    const paths = await getAllContentPaths(locale);
    for (const item of paths) {
      allParams.push({ locale, slug: [item.contentType, ...item.slug] });
    }
  }

  return allParams;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const effectiveLocale = CONTENT_TYPES.includes(locale) ? routing.defaultLocale : locale;
  if (!hasLocale(routing.locales, effectiveLocale)) return {};
  setRequestLocale(effectiveLocale);
  const finalSlug = CONTENT_TYPES.includes(locale) ? [locale, ...slug] : slug;
  return generateSlugMetadata({ locale: effectiveLocale as Locale, slug: finalSlug });
}

export default async function LocaleSlugPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = await params;
  const effectiveLocale = CONTENT_TYPES.includes(locale) ? routing.defaultLocale : locale;
  if (!hasLocale(routing.locales, effectiveLocale)) notFound();
  setRequestLocale(effectiveLocale);
  const finalSlug = CONTENT_TYPES.includes(locale) ? [locale, ...slug] : slug;
  const navGroups = getDynamicNavigation(effectiveLocale as Locale);
  return SlugView({ locale: effectiveLocale as Locale, slug: finalSlug, navGroups });
}
