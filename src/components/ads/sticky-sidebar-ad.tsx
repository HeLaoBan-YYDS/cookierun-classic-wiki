import { AdBanner, type AdBannerType } from "@/components/ads/adsterra-banner";

type StickySidebarAdProps = {
  adKey?: string;
  placement?: StickySidebarAdPlacement;
};

type StickySidebarAdPlacement = "left-160x600" | "right-160x300";

const stickySidebarPlacements = {
  "left-160x600": {
    type: "banner-160x600",
    asideClassName:
      "pointer-events-none fixed left-0 top-0 hidden h-full w-[136px] lg:block",
    frameClassName: "relative h-[510px] w-[136px]",
    innerClassName: "origin-top-left scale-[0.85]",
  },
  "right-160x300": {
    type: "banner-160x300",
    asideClassName:
      "pointer-events-none fixed right-0 top-0 hidden h-full w-[160px] lg:block",
    frameClassName: "relative h-[300px] w-[160px]",
    innerClassName: "",
  },
} satisfies Record<
  StickySidebarAdPlacement,
  {
    type: AdBannerType;
    asideClassName: string;
    frameClassName: string;
    innerClassName: string;
  }
>;

export function StickySidebarAd({ adKey, placement = "left-160x600" }: StickySidebarAdProps) {
  const key = adKey?.trim();
  const sidebarAd = stickySidebarPlacements[placement];

  if (!key) {
    return null;
  }

  return (
    <aside className={sidebarAd.asideClassName}>
      <div className="sticky top-44 z-20 py-2">
        <div className={sidebarAd.frameClassName}>
          <div className={sidebarAd.innerClassName}>
            <AdBanner type={sidebarAd.type} adKey={key} dismissible eager className="pointer-events-auto w-auto" />
          </div>
        </div>
      </div>
    </aside>
  );
}
