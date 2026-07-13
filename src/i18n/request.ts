import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// --- Static imports of every locale's UI messages -------------------------
// When adding a language: add an import here AND an entry in `messagesMap`.
import en from "@/locales/en.json";
import th from "@/locales/th.json";
import ko from "@/locales/ko.json";
import ja from "@/locales/ja.json";

type Messages = typeof en;

const messagesMap: Record<string, Partial<Messages>> = {
  en,
  th: th as unknown as Partial<Messages>,
  ko: ko as unknown as Partial<Messages>,
  ja: ja as unknown as Partial<Messages>,
};

/**
 * Recursively merge `override` onto `base`. Missing keys in a non-English
 * locale automatically fall back to the English value, so a partial
 * translation never throws a missing-message error.
 */
function deepMerge<T>(base: T, override: Partial<T>): T {
  if (
    typeof base !== "object" ||
    base === null ||
    typeof override !== "object" ||
    override === null
  ) {
    return (override as T) ?? base;
  }

  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const key of Object.keys(override as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key];
    const overrideValue = (override as Record<string, unknown>)[key];
    if (overrideValue === undefined) continue;
    result[key] = deepMerge(baseValue as never, overrideValue as never);
  }

  return result as T;
}

/**
 * Static-export friendly request config.
 *
 * In the previous Edge-Runtime build the active locale was injected by
 * `next-intl/middleware` and read via `requestLocale`. After migrating to
 * Cloudflare Pages static export there is no middleware, so each page/layout
 * must call `setRequestLocale(locale)` itself. The `requestLocale`
 * field is then populated by next-intl's internal store; if a page forgets to
 * call it (e.g. 404 fallback) we gracefully fall back to the default locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Non-English locales are merged on top of English so untranslated keys
  // gracefully fall back instead of erroring.
  const messages = deepMerge(en, messagesMap[locale] ?? {});

  return { locale, messages };
});
