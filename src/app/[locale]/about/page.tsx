import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing } from "@/i18n/routing";
import { LegalPage } from "@/components/legal-page";

/**
 * 法律页 `[locale]/about` 仅渲染 th/ko/ja 版本（英文 about 在根级 `/about`，
 * 由 `app/about/page.tsx` static 路由处理）。
 *
 * 覆盖父段 `[locale]/generateStaticParams` 让 build 跳过
 * `/en/about` 与 `/guide/about` 等不存在路径，避免 `out/en/guide/about/`
 * 被 postbuild 移到 `out/guide/about/` 污染英文内容路径。
 */
export function generateStaticParams() {
  return routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => ({ locale }));
}

export default async function LocaleAboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (CONTENT_TYPES.includes(locale)) notFound();
  if (!hasLocale(routing.locales, locale) || locale === routing.defaultLocale) notFound();
  return (
    <LegalPage title="About">
      <p>CookieRun Classic Wiki is an independent fan-made guide hub for the global mobile runner by Devsisters, covering beginner progression, Cookies, Pets, Treasures, Episodes, coupon information, resource farming, combinations, and League strategy.</p>
      <p>The site is built for community reference and is not affiliated with or endorsed by Devsisters.</p>
    </LegalPage>
  );
}

