type AdsterraBannerSlotConfig = {
  key: string;
  width: number;
  height: number;
  src: string;
};

export const ADSTERRA_BANNER_SLOTS = {
  "banner-160x300": {
    key: "",
    width: 160,
    height: 300,
    src: "/ads/banner-160x300.html",
  },
  "banner-160x600": {
    key: "",
    width: 160,
    height: 600,
    src: "/ads/banner-160x600.html",
  },
  "banner-300x250": {
    key: "",
    width: 300,
    height: 250,
    src: "/ads/banner-300x250.html",
  },
  "banner-320x50": {
    key: "",
    width: 320,
    height: 50,
    src: "/ads/banner-320x50.html",
  },
  "banner-468x60": {
    key: "",
    width: 468,
    height: 60,
    src: "/ads/banner-468x60.html",
  },
  "banner-728x90": {
    key: "",
    width: 728,
    height: 90,
    src: "/ads/banner-728x90.html",
  },
} satisfies Record<string, AdsterraBannerSlotConfig>;

export type AdsterraBannerSlot = keyof typeof ADSTERRA_BANNER_SLOTS;

export function AdsterraBanner({ slot }: { slot: AdsterraBannerSlot }) {
  const ad = ADSTERRA_BANNER_SLOTS[slot];

  if (!ad.key.trim()) return null;

  return (
    <div className="flex w-full justify-center">
      <iframe
        src={ad.src}
        title={`Adsterra ${slot}`}
        width={ad.width}
        height={ad.height}
        scrolling="no"
        style={{ border: "none" }}
      />
    </div>
  );
}
