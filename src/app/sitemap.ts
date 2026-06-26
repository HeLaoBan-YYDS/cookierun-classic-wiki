import type { MetadataRoute } from "next";
import { getAllContentPaths } from "@/lib/content";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing } from "@/i18n/routing";

function localizedPathname(pathname: string, locale: string) {
  return locale === routing.defaultLocale ? pathname : `/${locale}${pathname === "/" ? "" : pathname}`;
}

function languageAlternates(siteUrl: string, pathname: string) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        `${siteUrl}${localizedPathname(pathname, locale) === "/" ? "" : localizedPathname(pathname, locale)}`,
      ]),
    ),
    "x-default": `${siteUrl}${pathname === "/" ? "" : pathname}`,
  };
}

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

  // Dynamic paths: scan actual MDX content files
  const contentPaths = await getAllContentPaths("en");
  const dynamicPaths = contentPaths.map((item) => `/${[item.contentType, ...item.slug].join("/")}`);

  const paths = [...staticPaths, ...dynamicPaths];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}${locale === "en" ? "" : `/${locale}`}${path === "/" ? "" : path}`,
      alternates: { languages: languageAlternates(siteUrl, path) },
      lastModified: new Date(),
      changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : CONTENT_TYPES.some((contentType) => path === `/${contentType}`) ? 0.8 : 0.6,
    })),
  );
}
