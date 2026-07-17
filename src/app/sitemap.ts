import type { MetadataRoute } from "next";
import { getAllContentPaths } from "@/lib/content";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/i18n-paths";

// 静态导出要求所有路由显式声明 force-static
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const contentLastModified = (metadata: { date?: string; lastModified?: string }) =>
    new Date(metadata.lastModified || metadata.date || new Date());

  // 静态路径：根级无前缀（英文） + 各 locale 带前缀
  const rootStaticPaths = [
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

  // 英文内容动态路径（默认 locale 直接走根，无前缀）
  const enContentPaths = await getAllContentPaths(routing.defaultLocale);
  const enDynamicEntries = enContentPaths.map((item) => {
    const path = `/${[item.contentType, ...item.slug].join("/")}`;
    return {
      url: `${siteUrl}${path}`,
      lastModified: contentLastModified(item.metadata),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    };
  });

  // 其它 locale 的动态内容路径
  const otherLocales = routing.locales.filter((locale) => locale !== routing.defaultLocale);
  const perLocaleDynamicEntries: Record<string, MetadataRoute.Sitemap> = Object.fromEntries(
    await Promise.all(
      otherLocales.map(async (locale) => {
        const contentPaths = await getAllContentPaths(locale);
        return [
          locale,
          contentPaths.map((item) => {
            const path = `/${[item.contentType, ...item.slug].join("/")}`;
            return {
              url: `${siteUrl}/${locale}${path}`,
              lastModified: contentLastModified(item.metadata),
              changeFrequency: "weekly" as const,
              priority: 0.5,
            };
          }),
        ];
      }),
    ),
  );

  const entries: MetadataRoute.Sitemap = rootStaticPaths.map((path) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
    priority: path === "/" ? 1 : CONTENT_TYPES.some((ct) => path === `/${ct}`) ? 0.8 : 0.6,
  }));
  entries.push(...enDynamicEntries);

  for (const locale of otherLocales) {
    for (const path of rootStaticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${path === "/" ? "" : path}`,
        lastModified: new Date(),
        changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
        priority: path === "/" ? 0.9 : CONTENT_TYPES.some((ct) => path === `/${ct}`) ? 0.7 : 0.5,
      });
    }
    entries.push(...(perLocaleDynamicEntries[locale] ?? []));
  }

  return entries;
}
