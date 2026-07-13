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

export default async function LocaleCopyrightPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (CONTENT_TYPES.includes(locale)) notFound();
  if (!hasLocale(routing.locales, locale) || locale === routing.defaultLocale) notFound();
  return (
    <LegalPage title="Copyright">
      <p>CookieRun Classic, CookieRun, Devsisters, official logos, characters, and related media belong to their respective owners.</p>
      <p>This site is a non-official fan wiki implementation for educational and guide presentation purposes.</p>
      <p>If you own rights to content displayed here and have a concern, please contact the site operator for review.</p>
    </LegalPage>
  );
}
