import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { StickySidebarAd } from "@/components/ads/sticky-sidebar-ad";
import { StickyTopAd } from "@/components/ads/sticky-top-ad";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/site";
import { type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/i18n-paths";

const stickyTopAdKey = process.env.NEXT_PUBLIC_AD_MOBILE_320X50?.trim();
const stickySidebarAdKey = process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600?.trim();
const stickyRightSidebarAdKey = process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300?.trim();

const contentAdOffsetClassName =
  [
    stickySidebarAdKey ? "lg:pl-[152px] 2xl:pl-0" : "",
    stickyRightSidebarAdKey ? "lg:pr-[176px] 2xl:pr-0" : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

/**
 * 共享的页面骨架：
 *   <NextIntlClientProvider> + JsonLd(organization) + SiteHeader + StickyTopAd +
 *   StickySidebarAd × 2 + <children> + SiteFooter
 *
 * 根级英文页面（`app/page.tsx`、`app/[...slug]/page.tsx`、法律页）与
 * `[locale]` 段（处理 th/ko/ja）共用同一份外壳，避免重复实现
 * NextIntlClientProvider / SiteHeader / 广告 / SiteFooter 的拼装。
 *
 * 调用方必须先 `setRequestLocale(locale)`，否则 getMessages 会因
 * 拿不到 requestLocale 而退化到 defaultLocale。
 */
export async function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const messages = await getMessages({ locale });
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CookieRun Classic Wiki",
    url: siteUrl,
    logo: `${siteUrl}/android-chrome-512x512.png`,
    image: `${siteUrl}/images/hero.webp`,
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={organization} />
      <SiteHeader locale={locale} />
      <StickyTopAd type="banner-320x50" adKey={stickyTopAdKey} dismissible />
      <StickySidebarAd adKey={stickySidebarAdKey} />
      <StickySidebarAd placement="right-160x300" adKey={stickyRightSidebarAdKey} />
      <div className={contentAdOffsetClassName}>
        {children}
        <SiteFooter locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
