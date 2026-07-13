import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/app/_views/SiteShell";
import { HomeView } from "@/app/_views/HomeView";
import { generateHomeMetadata } from "@/app/_views/home-meta";
import { routing } from "@/i18n/routing";

/**
 * 英文首页 `/`（默认 locale 在 as-needed 模式下不带前缀）：
 *   - dev 模式直接渲染英文首页
 *   - 静态导出产物 `out/index.html`
 *
 * 根级 layout 已经提供 `<html>/<body>` 与 Script / ThemeProvider，
 * 本页只负责英文首页的内容并套上 SiteShell。
 */
export async function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata({ locale: routing.defaultLocale });
}

export default async function RootHomePage() {
  setRequestLocale(routing.defaultLocale);
  return (
    <SiteShell locale={routing.defaultLocale}>
      <HomeView locale={routing.defaultLocale} />
    </SiteShell>
  );
}
