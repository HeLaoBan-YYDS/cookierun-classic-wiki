import { getMessages } from "next-intl/server";
import { JsonLd, WikiSidebar } from "@/components/site";
import { getAllContent, getDynamicNavigation, type ContentItem, CONTENT_TYPES } from "@/lib/content";
import en from "@/locales/en.json";
import HomePageClient from "../[locale]/HomePageClient";
import { siteUrl } from "@/lib/i18n-paths";
import { type Locale } from "@/i18n/routing";

type Messages = typeof en;

/**
 * 共享首页渲染：根 `app/page.tsx`（默认 locale en）与
 * `app/[locale]/page.tsx`（其它 locale）共用同一份逻辑，
 * 唯一区别只是 locale 字符串。
 *
 * 注意：setRequestLocale 由调用方（page.tsx）在 await 之前执行。
 */
export async function HomeView({ locale }: { locale: Locale }) {
  const messages = (await getMessages({ locale })) as Messages;
  const navGroups = getDynamicNavigation(locale);
  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: messages.site.name,
    url: siteUrl,
    description: messages.home.meta.description,
  };

  // 动态加载所有 content 目录下的文章
  const allArticles: ContentItem[] = [];
  for (const contentType of CONTENT_TYPES) {
    const items = await getAllContent(contentType, locale);
    allArticles.push(...items);
  }

  // 取最近更新的 8 篇文章（按 date 倒序）
  const recentArticles = [...allArticles]
    .sort((a, b) => {
      const dateA = a.metadata.lastModified || a.metadata.date;
      const dateB = b.metadata.lastModified || b.metadata.date;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={webSite} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <HomePageClient home={messages.home} locale={locale} articles={allArticles} recentArticles={recentArticles} />
        <WikiSidebar locale={locale} navGroups={navGroups} />
      </div>
    </main>
  );
}

