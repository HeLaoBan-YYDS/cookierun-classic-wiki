import type { LucideIcon } from "lucide-react";

type NavigationItem = {
  key: string;
  path: string;
  icon: LucideIcon;
  isContentType: boolean;
};

export const NAVIGATION_CONFIG = [] as ReadonlyArray<NavigationItem>;

export const CONTENT_TYPES = [] as readonly string[];
