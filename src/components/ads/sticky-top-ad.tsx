"use client";

import { useState, type SyntheticEvent } from "react";
import { X } from "lucide-react";

import { AdBanner, type AdBannerType } from "@/components/ads/adsterra-banner";

type StickyTopAdProps = {
  type: AdBannerType;
  adKey?: string;
  eager?: boolean;
};

function getCloseHandlers(closeAd: (event: SyntheticEvent<HTMLButtonElement>) => void) {
  return {
    onClick: closeAd,
    onClickCapture: closeAd,
    onMouseDown: closeAd,
    onMouseDownCapture: closeAd,
    onMouseUp: closeAd,
    onPointerDown: closeAd,
    onPointerDownCapture: closeAd,
    onPointerUp: closeAd,
    onTouchEnd: closeAd,
    onTouchStart: closeAd,
    onTouchStartCapture: closeAd,
  };
}

export function StickyTopAd({ type, adKey, eager = true }: StickyTopAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const key = adKey?.trim();
  const closeAd = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDismissed(true);
  };

  if (!key || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-20 z-20 py-2">
      <div className="mx-auto max-w-4xl">
        <div className="relative mx-auto w-fit max-w-full overflow-hidden">
          <AdBanner type={type} adKey={key} eager={eager} className="w-auto" />
          <button
            type="button"
            aria-label="Close advertisement"
            className="absolute right-1 top-1 z-50 grid size-5 cursor-pointer place-items-center rounded-sm bg-transparent text-foreground drop-shadow transition-colors hover:bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...getCloseHandlers(closeAd)}
          >
            <X className="pointer-events-none size-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
