"use client";

import { StickyTopAd } from "@/components/ads/sticky-top-ad";

export function TopNavAdsterraBanner() {
  const adKey = process.env.NEXT_PUBLIC_AD_MOBILE_320X50?.trim();
  return <StickyTopAd type="banner-320x50" adKey={adKey} eager />;
}
