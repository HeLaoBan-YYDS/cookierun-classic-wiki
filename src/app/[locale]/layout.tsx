import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { StickySidebarAd } from "@/components/ads/sticky-sidebar-ad";
import { StickyTopAd } from "@/components/ads/sticky-top-ad";
import { JsonLd, SiteFooter, SiteHeader } from "@/components/site";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cookierun-classic-wiki.wiki";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const image = `${siteUrl}/images/hero.webp`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: "cookierun classic Wiki", template: "%s" },
    description: "CookieRun Classic Wiki covers beginner tips, coin farming, Cookie and Pet combos, Treasure upgrades, episode guides, League scoring, events, and verified codes.",
    openGraph: { type: "website", locale, url: siteUrl, siteName: "CookieRun Classic Wiki", images: [{ url: image }] },
    twitter: { card: "summary_large_image", images: [image] },
    other: {
      "google-adsense-account": "ca-pub-9990396895505565",
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // 静态导出必须显式设置当前 locale，否则 getMessages/getTranslations
  // 会因拿不到 requestLocale 而退化到 defaultLocale。
  setRequestLocale(locale);
  const messages = await getMessages();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CookieRun Classic Wiki",
    url: siteUrl,
    logo: `${siteUrl}/android-chrome-512x512.png`,
    image: `${siteUrl}/images/hero.webp`,
  };

  return (
    <html lang={locale} className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9990396895505565"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3EBWSL5NWC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3EBWSL5NWC');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xd0m92tg5j");
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
