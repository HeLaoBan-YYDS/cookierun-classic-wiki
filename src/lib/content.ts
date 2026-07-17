// src/lib/content.ts
// ----------------------------------------------------------------------------
// Workers 适配:原文件 `fs.readFileSync` 读 MDX 源,改造成 read-time 读
// `src/generated/content-index.json` (由 scripts/extract-content.mjs 在
// prebuild 阶段产出)。MDX 组件本身仍走动态 import — esbuild 在 build time
// 把所有 MDX 文件切成独立 chunk,prerender 阶段被 import 时直接被消费。
//
// 数据流:
//   MDX 源 (build time) ── extract-content.mjs ──> content-index.json
//   MDX 组件 (build time) ── esbuild split chunk ──> import() in worker/prerender
// ----------------------------------------------------------------------------

import contentIndex from "@/generated/content-index.json";
import enMessages from "@/locales/en.json";
import jaMessages from "@/locales/ja.json";
import koMessages from "@/locales/ko.json";
import thMessages from "@/locales/th.json";
import { CONTENT_TYPES as CONFIG_CONTENT_TYPES } from "@/config/navigation";
import { routing, type Locale } from "@/i18n/routing";

// ---- 类型 -----------------------------------------------------------------

type Index = typeof contentIndex;
export type FileEntry = Index["files"][string];

// 复用同一份 shape,确保运行时拿到的 metadata/headings 跟 MDX 源一致
export interface ContentMetadata {
  title: string;
  description: string;
  category: string;
  date: string;
  lastModified?: string;
  image?: string;
  badge?: string;
  summary?: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface ContentItem {
  slug: string;
  segments: string[];
  contentType: string;
  locale: Locale;
  metadata: ContentMetadata;
}

export type ContentData = {
  slug: string;
  segments: string[];
  contentType: string;
  locale: Locale;
  metadata: ContentMetadata;
  MDXContent: React.ComponentType;
  headings: Heading[];
};

export interface NavGroup {
  title: string;
  count: number;
  slug: string;
  links: Array<{ label: string; href: string; badge?: string }>;
}

// 从统一配置导入内容类型
export const CONTENT_TYPES = CONFIG_CONTENT_TYPES;

// ---- 导航 / 分组元数据 -----------------------------------------------------

const GROUP_TITLES: Record<string, string> = {
  guide: "Guides",
  codes: "Codes",
  cookies: "Cookies",
  combi: "Combi",
  treasures: "Treasures",
  farming: "Farming",
  release: "Release",
  community: "Community",
};

const NAV_LABELS_BY_LOCALE: Record<Locale, Record<string, string>> = {
  en: enMessages.nav,
  ja: jaMessages.nav,
  ko: koMessages.nav,
  th: thMessages.nav,
};

const OVERVIEW_LABEL_BY_LOCALE: Record<Locale, string> = {
  en: enMessages.shared.overview,
  ja: jaMessages.shared.overview,
  ko: koMessages.shared.overview,
  th: thMessages.shared.overview,
};

const GROUP_ORDER: string[] = [
  "guide",
  "codes",
  "cookies",
  "combi",
  "treasures",
  "farming",
  "release",
  "community",
];

// ---- 工具函数 -------------------------------------------------------------

/**
 * 在 JSON 索引里按 (locale, contentType, slug) 查文件条目。
 * 当前仓库所有文件都是平铺 slug(没有嵌套子目录),
 * 旧版的 `findFileBySlug` 递归遍历 fs 的逻辑不再需要。
 */
function findEntry(
  locale: Locale,
  contentType: string,
  slug: string,
): FileEntry | undefined {
  const group = (contentIndex.byLocale[locale] ?? {})[contentType] ?? [];
  return group.find((entry) => entry.slug === slug);
}

// ---- 对外 API -------------------------------------------------------------

/**
 * 获取某 (contentType, locale) 下所有内容项的元数据列表。
 * 运行时不再读文件,直接从 JSON 索引取。
 */
export async function getAllContent(
  contentType: string,
  language: Locale,
): Promise<ContentItem[]> {
  const group = contentIndex.byLocale[language]?.[contentType] ?? [];
  return group
    .map(
      (entry): ContentItem => ({
        slug: entry.slug,
        segments: entry.slugSegments,
        contentType,
        locale: language,
        metadata: entry.metadata as ContentMetadata,
      }),
    )
    .sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
}

/**
 * 获取单篇文章 (含 MDX 组件 + headings)。
 * MDX 组件仍走动态 import,build time esbuild 会把每个 .mdx 切成 chunk;
 * 当前 metadata / headings 从 JSON 取,避免运行时读源文件。
 */
export async function getContent(
  contentType: string,
  slugSegments: string[],
  language: Locale,
): Promise<ContentData | null> {
  const slug = slugSegments.join("/");
  let entry = findEntry(language, contentType, slug);
  let resolvedLocale: Locale = language;

  // Fallback 到默认 locale
  if (!entry && language !== routing.defaultLocale) {
    entry = findEntry(routing.defaultLocale, contentType, slug);
    if (entry) resolvedLocale = routing.defaultLocale;
  }

  if (!entry) return null;

  // 动态 import MDX 组件,path 拼接的变量受 contentIndex 约束,所有
  // 可能值都是已知文件,esbuild 会把它们枚举成 chunk。
  // TypeScript 不能静态分析 import 的变量,用显式 module 类型断言。
  type MDXModule = {
    default: React.ComponentType;
    metadata?: ContentMetadata;
  };
  const mod = (await import(
    `../../content/${resolvedLocale}/${contentType}/${entry.fileName}.mdx`
  )) as unknown as MDXModule;

  return {
    slug: entry.slug,
    segments: entry.slugSegments,
    contentType,
    locale: resolvedLocale,
    metadata: entry.metadata as ContentMetadata,
    MDXContent: mod.default,
    headings: entry.headings,
  };
}

/**
 * 生成 Wiki 侧边导航分组,数据来源是 JSON 索引,完全无 IO。
 */
export function getDynamicNavigation(language: Locale = "en"): NavGroup[] {
  const localeData = contentIndex.byLocale[language];
  if (!localeData) return [];

  const groups: NavGroup[] = [];
  for (const groupSlug of GROUP_ORDER) {
    const entries = localeData[groupSlug];
    if (!entries || entries.length === 0) continue;

    const links: NavGroup["links"] = [];
    const overviewLabel =
      OVERVIEW_LABEL_BY_LOCALE[language] ?? OVERVIEW_LABEL_BY_LOCALE.en;
    links.push({ label: overviewLabel, href: `/${groupSlug}` });

    for (const entry of entries) {
      const title =
        entry.metadata.title ||
        entry.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      links.push({
        label: title,
        href: `/${groupSlug}/${entry.slug}`,
        badge: entry.metadata.badge,
      });
    }

    const localTitles = NAV_LABELS_BY_LOCALE[language] ?? NAV_LABELS_BY_LOCALE.en;
    const groupTitle =
      localTitles[groupSlug] ||
      GROUP_TITLES[groupSlug] ||
      groupSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    groups.push({
      title: groupTitle,
      count: links.length - 1,
      slug: groupSlug,
      links,
    });
  }

  return groups;
}

/**
 * 获取某 locale 下所有 (contentType, slug) 组合,供 generateStaticParams 用。
 */
export async function getAllContentPaths(language: Locale) {
  const localeData = contentIndex.byLocale[language];
  if (!localeData) return [];

  const paths: Array<{
    contentType: string;
    slug: string[];
    metadata: ContentMetadata;
  }> = [];
  for (const [contentType, entries] of Object.entries(localeData)) {
    for (const entry of entries) {
      paths.push({
        contentType,
        slug: entry.slugSegments,
        metadata: entry.metadata as ContentMetadata,
      });
    }
  }
  return paths;
}
