import type { MetadataRoute } from "next";
import { getAllContentPaths } from "@/lib/content";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing } from "@/i18n/routing";

// 静态导出要求所有路由显式声明 force-static
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cookierun-classic-wiki.wiki";

  // Static paths that always exist
  const staticPaths = [
    "/",
    "/guide",
    "/codes",
    "/cookies",
    "/combi",
    "/treasures",
    "/farming",
    "/release",
    "/community",
    "/privacy-policy",
    "/terms-of-service",
    "/copyright",
    "/about",
  ];

  // 扫描所有 locale 的内容（默认 en 与其它 locale 可能存在差异，
  // 静态导出模式下每种语言各自产出了自己的页面，sitemap 也应同步覆盖）
  const perLocaleDynamicPaths: Record<string, string[]> = { en: [], th: [], ko: [], ja: [] };
  for (const locale of routing.locales) {
    const contentPaths = await getAllContentPaths(locale);
    perLocaleDynamicPaths[locale] = contentPaths.map((item) => `/${[item.contentType, ...item.slug].join("/")}`);
  }

  return routing.locales.flatMap((locale) => {
    const isDefault = locale === routing.defaultLocale;
    const dynamicPaths = perLocaleDynamicPaths[locale] ?? [];
    const paths = [...staticPaths, ...dynamicPaths];
    return paths.map((path) => ({
      url: `${siteUrl}${isDefault ? "" : `/${locale}`}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : CONTENT_TYPES.some((contentType) => path === `/${contentType}`) ? 0.8 : 0.6,
    }));
  });
}
