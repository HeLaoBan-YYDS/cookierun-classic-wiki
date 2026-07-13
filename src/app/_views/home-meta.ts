import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import en from "@/locales/en.json";
import { siteUrl, languageAlternates, localizedPathname } from "@/lib/i18n-paths";
import { type Locale } from "@/i18n/routing";

type Messages = typeof en;

/**
 * 共享的 home metadata 生成：根 `/` 与 `/{locale}/` 用同一份。
 */
export async function generateHomeMetadata({ locale }: { locale: Locale }): Promise<Metadata> {
  const messages = (await getMessages({ locale })) as Messages;
  const canonical = localizedPathname("/", locale);
  return {
    title: messages.home.meta.title,
    description: messages.home.meta.description,
    alternates: { canonical, languages: languageAlternates("/") },
    openGraph: {
      title: messages.home.meta.title,
      description: messages.home.meta.description,
      url: `${siteUrl}${canonical === "/" ? "" : canonical}`,
      images: [`${siteUrl}/images/hero.webp`],
    },
  };
}
