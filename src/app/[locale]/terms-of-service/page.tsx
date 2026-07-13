import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { CONTENT_TYPES } from "@/config/navigation";
import { routing } from "@/i18n/routing";
import { LegalPage } from "@/components/legal-page";

export function generateStaticParams() {
  return routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => ({ locale }));
}

export default async function LocaleTermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (CONTENT_TYPES.includes(locale)) notFound();
  if (!hasLocale(routing.locales, locale) || locale === routing.defaultLocale) notFound();
  return (
    <LegalPage title="Terms of Service">
      <p>This site is an independent fan-made guide hub. Content is provided for informational and entertainment purposes only.</p>
      <p>Game systems, coupon codes, rewards, events, and update details may change without notice. Always verify important information in-game or through official Devsisters channels.</p>
      <p>By using this site, you agree not to misuse it, attempt unauthorized access, or present this fan wiki as an official Devsisters property.</p>
    </LegalPage>
  );
}
