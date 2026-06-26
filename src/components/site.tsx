import Link from "next/link";
import { ChevronRight, ExternalLink, Menu, Play, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import type { NavGroup } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CollapsibleNavGroup } from "@/components/collapsible-nav-group";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ClientThemeToggle } from "@/components/theme-toggle";

export function localizeHref(href: string, locale: string) {
  if (locale === "en") return href;
  return `/${locale}${href === "/" ? "" : href}`;
}

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const header = (
    <div className="flex items-center justify-between gap-4">
      <Link href={localizeHref("/", locale)} className="flex items-center gap-3">
        <img src="/android-chrome-192x192.png" alt="" className="h-9 w-9 rounded-xl border border-border bg-muted object-cover" aria-hidden="true" />
        <span className="text-sm font-bold tracking-wide text-foreground">CookieRun Classic</span>
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
        {NAVIGATION_CONFIG.map((item) => (
          <Link key={item.key} href={localizeHref(item.path, locale)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher locale={locale} />
        <ThemeToggle label={t("toggleTheme")} />
        <Sheet>
          <SheetTrigger asChild className="md:hidden"><Button variant="outline" size="icon" aria-label={t("menu")}><Menu className="h-4 w-4" /></Button></SheetTrigger>
          <SheetContent className="border-border bg-background text-foreground">
            <div className="mt-8 grid gap-2">
              {NAVIGATION_CONFIG.map((item) => <Link key={item.key} href={localizeHref(item.path, locale)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-muted">{t(item.key)}</Link>)}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
  return <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl"><div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">{header}</div></header>;
}

function ThemeToggle({ label }: { label: string }) {
  return <ClientThemeToggle label={label} />;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{items.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <ChevronRight className="h-4 w-4" />}{item.href ? <Link className="hover:text-foreground" href={item.href}>{item.label}</Link> : <span className="text-foreground">{item.label}</span>}</span>)}</nav>;
}

export async function WikiSidebar({ locale, navGroups, currentPath }: { locale: string; navGroups: NavGroup[]; currentPath?: string }) {
  const t = await getTranslations({ locale, namespace: "shared" });
  const isActive = (href: string) => currentPath === href;
  return <aside className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1"><section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm"><h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{t("wikiNavigation")}</h3><div className="space-y-4">{navGroups.map((group) => <CollapsibleNavGroup key={group.slug} title={group.title} icon={<span className="grid h-4 w-4 place-items-center rounded text-[10px] font-bold text-[hsl(var(--nav-theme))]">{group.title[0]}</span>} count={group.count} currentPath={currentPath}><ul className="space-y-1">{group.links.map((link) => <li key={link.href}><Link href={localizeHref(link.href, locale)} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${isActive(link.href) ? "bg-[hsl(var(--nav-theme)/0.15)] font-semibold text-[hsl(var(--nav-theme))]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span className="truncate">{link.label}</span>{link.badge && <Badge variant="secondary" className="ml-auto h-5 border-border px-1.5 text-[10px]">{link.badge}</Badge>}</Link></li>)}</ul></CollapsibleNavGroup>)}</div></section><section className="rounded-2xl border border-border bg-card/60 p-5"><h3 className="mb-3 text-sm font-bold text-foreground">{t("activeCodes")}</h3><div className="space-y-3 text-sm"><div className="rounded-xl bg-muted p-3"><code className="font-bold text-foreground">暂无兑换码</code><p className="mt-1 text-muted-foreground">No verified active public CookieRun Classic code yet.</p></div><div className="rounded-xl bg-muted p-3"><code className="font-bold text-foreground">暂无兑换码</code><p className="mt-1 text-muted-foreground">No second verified active public code yet.</p></div><Link href={localizeHref("/codes", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--nav-theme))]">{t("viewAllCodes")} <ChevronRight className="h-4 w-4" /></Link></div></section></aside>;
}

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const site = await getTranslations({ locale, namespace: "site" });
  return <footer className="mt-16 border-t border-border bg-card/30"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-10 rounded-2xl border border-border bg-muted/40 p-5"><div className="font-bold text-foreground">CookieRun Classic</div><p className="mt-1 text-sm text-muted-foreground">{t("description")}</p><Link href="https://play.google.com/store/apps/details?id=com.devsisters.crg" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--nav-theme))]">{t("playGame")} <ExternalLink className="h-4 w-4" /></Link></div><p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{site("legalNotice")}</p><div className="grid gap-8 md:grid-cols-4"><div className="md:col-span-2"><h3 className="font-bold text-foreground">{t("aboutTitle")}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{t("about")}</p></div><FooterList title={t("quickLinks")} links={[[t("playGame"), "https://play.google.com/store/apps/details?id=com.devsisters.crg"], [t("appStore"), "https://apps.apple.com/us/app/cookierun-classic/id6759596824"], [t("officialX"), "https://x.com/CRClassicEN"], [t("officialInstagram"), "https://www.instagram.com/crclassic_en"], [t("officialDiscord"), "https://discord.com/invite/cookierun"], [t("officialYoutube"), "https://www.youtube.com/watch?v=QECwBKhHj3k&t=2814s"], [t("vvBuilder"), "https://coupon.devplay.com/coupon/crg/en"]]} /><FooterList title={t("guides")} links={[[t("beginnerGuide"), "/guide/cookierun-classic-beginner-guide"], [t("raceGuides"), "/cookies"], [t("bossGuides"), "/league"], [t("buildGuide"), "/guide/cookierun-classic-cookie-pet-combos"], [t("privacyPolicy"), "/privacy-policy"], [t("termsOfService"), "/terms-of-service"]]} /></div><p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">{t("copyright")}</p></div></footer>;
}

function FooterList({ title, links }: { title: string; links: string[][] }) { return <div><h4 className="font-semibold text-foreground">{title}</h4><ul className="mt-3 space-y-2 text-sm text-muted-foreground">{links.map(([label, href]) => <li key={href}><Link className="hover:text-foreground" href={href}>{label}</Link></li>)}</ul></div>; }

function closeTrailerDialog() {
  const dialog = document.getElementById("trailer-dialog") as HTMLDialogElement | null;
  const iframe = document.getElementById("trailer-iframe") as HTMLIFrameElement | null;
  window.removeEventListener("keydown", handleTrailerKeydown);
  if (iframe) iframe.src = "";
  if (dialog?.open) dialog.close();
  dialog?.classList.add("opacity-0", "pointer-events-none");
  dialog?.classList.remove("opacity-100", "pointer-events-auto");
}

function handleTrailerKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeTrailerDialog();
}

function openTrailerDialog(videoId: string, startSeconds: number) {
  const dialog = document.getElementById("trailer-dialog") as HTMLDialogElement | null;
  const iframe = document.getElementById("trailer-iframe") as HTMLIFrameElement | null;
  if (!dialog || !iframe) return;

  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (startSeconds > 0) params.set("start", String(startSeconds));
  if (window.location.origin) params.set("origin", window.location.origin);
  iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  if (!dialog.open) dialog.showModal();
  dialog.focus();
  window.removeEventListener("keydown", handleTrailerKeydown);
  window.addEventListener("keydown", handleTrailerKeydown);
  dialog.classList.remove("opacity-0", "pointer-events-none");
  dialog.classList.add("opacity-100", "pointer-events-auto");
}

export function TrailerCard() {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border shadow-lg transition-all duration-200">
      <div className="relative aspect-video w-full">
        <img src="/images/hero-trailer-thumbnail.jpg" alt="CookieRun Classic Official DevNow Showcase" className="size-full object-cover transition-all duration-200 group-hover:brightness-80" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 backdrop-blur-md transition-transform duration-200 group-hover:scale-105 sm:size-24">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-primary/30 to-primary shadow-md transition-transform duration-200 group-hover:scale-110 sm:size-16">
            <Play className="size-6 fill-white text-white sm:size-7" style={{ filter: "drop-shadow(rgba(0,0,0,0.07) 0 4px 3px) drop-shadow(rgba(0,0,0,0.06) 0 2px 2px)" }} />
          </div>
        </div>
      </div>
      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] text-white">YouTube</span>
    </div>
  );
}

export function TrailerDialog() {
  return (
    <dialog
      id="trailer-dialog"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-200 pointer-events-none"
      onCancel={(event) => {
        event.preventDefault();
        closeTrailerDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeTrailerDialog();
      }}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <iframe
          id="trailer-iframe"
          title="CookieRun Classic Official DevNow Showcase"
          className="aspect-video w-full rounded-xl bg-black"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        <button
          type="button"
          className="absolute right-3 top-3 z-20 inline-flex size-10 items-center justify-center rounded-full bg-black/75 text-white shadow-lg transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={closeTrailerDialog}
        >
          <X className="size-5" />
          <span className="sr-only">Close trailer</span>
        </button>
      </div>
    </dialog>
  );
}

export function TrailerButton({ videoId, startSeconds = 0 }: { videoId: string; startSeconds?: number }) {
  return (
    <>
      <button type="button" className="w-full" aria-haspopup="dialog" onClick={() => openTrailerDialog(videoId, startSeconds)}>
        <TrailerCard />
      </button>
      <TrailerDialog />
    </>
  );
}

export function JsonLd({ data }: { data: unknown }) { return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />; }
