import {
  ADSTERRA_BANNER_SLOTS,
  type AdsterraBannerSlot,
} from "@/components/ads/adsterra-banner";

type AdBannerProps = {
  type: AdsterraBannerSlot;
  adKey?: string;
  eager?: boolean;
};

export function AdBanner({ type, adKey, eager = false }: AdBannerProps) {
  const normalizedAdKey = adKey?.trim();

  if (!normalizedAdKey) return null;

  const ad = ADSTERRA_BANNER_SLOTS[type];
  const src = `${ad.src}?key=${encodeURIComponent(normalizedAdKey)}`;

  return (
    <div className="flex justify-center">
      <iframe
        src={src}
        title={`Adsterra ${type}`}
        width={ad.width}
        height={ad.height}
        scrolling="no"
        loading={eager ? "eager" : "lazy"}
        style={{ border: "none" }}
      />
    </div>
  );
}
