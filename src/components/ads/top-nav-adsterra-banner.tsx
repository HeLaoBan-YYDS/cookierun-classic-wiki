"use client";

import { AdBanner } from "@/components/ads/ad-banner";
import { X } from "lucide-react";
import { useState } from "react";

export function TopNavAdsterraBanner() {
  const [dismissed, setDismissed] = useState(false);
  const adKey = process.env.NEXT_PUBLIC_AD_MOBILE_320X50?.trim();

  if (!adKey || dismissed) return null;

  return (
    <div className="sticky top-20 z-20 py-2">
      <div className="mx-auto max-w-4xl">
        <div className="relative mx-auto flex w-fit max-w-full items-start justify-center pr-10">
          <AdBanner type="banner-320x50" adKey={adKey} eager />
          <button
            type="button"
            aria-label="关闭广告"
            className="absolute right-0 top-0 inline-flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setDismissed(true)}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
