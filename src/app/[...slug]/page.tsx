import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/app/_views/SiteShell";
import { generateSlugMetadata, SlugView } from "@/app/_views/SlugView";
import { getAllContentPaths, getDynamicNavigation } from "@/lib/content";
import { routing } from "@/i18n/routing";

/**
 * 根级 catch-all 段，专门渲染英文版（默认 locale）的内容路径。
 *
 * 只承担英文文章详情（多段，如 `/guide/xxx`），因为：
 *   - `/`（英文首页）由根级 `app/page.tsx` 处理（static 优先）
 *   - `/guide`、`/codes` 等单段分类列表在 Next.js 路由优先级里被
 *     `[locale]` 段（dynamic 优先）抢占，由 `[locale]/page.tsx` 用
 *     effectiveLocale=en 渲染。
 *   - `/about` 等英文法律页由根级 `app/about/page.tsx` 等处理（static 优先）。
 */
export async function generateStaticParams() {
  const articleParams = (await getAllContentPaths(routing.defaultLocale)).map((item) => ({
    slug: [item.contentType, ...item.slug],
  }));
  return articleParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  setRequestLocale(routing.defaultLocale);
  return generateSlugMetadata({ locale: routing.defaultLocale, slug });
}

export default async function RootSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  setRequestLocale(routing.defaultLocale);
  const navGroups = getDynamicNavigation(routing.defaultLocale);
  return (
    <SiteShell locale={routing.defaultLocale}>
      <SlugView locale={routing.defaultLocale} slug={slug} navGroups={navGroups} />
    </SiteShell>
  );
}
