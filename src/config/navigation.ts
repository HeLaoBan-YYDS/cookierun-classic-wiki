import {
  BookOpen,
  Boxes,
  CircleHelp,
  Code2,
  Compass,
  Flame,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

const CONTENT_TYPE_KEYS = [
  "guide",
  "codes",
  "cookies",
  "combi",
  "treasures",
  "farming",
  "release",
  "community",
] as const;

export const CONTENT_TYPES: readonly string[] = CONTENT_TYPE_KEYS;

type ContentType = (typeof CONTENT_TYPE_KEYS)[number];

type NavigationItem = {
  key: ContentType;
  path: `/${ContentType}`;
  icon: LucideIcon;
  isContentType: true;
};

export const NAVIGATION_CONFIG = [
  { key: "guide", path: "/guide", icon: BookOpen, isContentType: true },
  { key: "codes", path: "/codes", icon: Code2, isContentType: true },
  { key: "cookies", path: "/cookies", icon: CircleHelp, isContentType: true },
  { key: "combi", path: "/combi", icon: Boxes, isContentType: true },
  { key: "treasures", path: "/treasures", icon: Trophy, isContentType: true },
  { key: "farming", path: "/farming", icon: Flame, isContentType: true },
  { key: "release", path: "/release", icon: Compass, isContentType: true },
  { key: "community", path: "/community", icon: Users, isContentType: true },
] as const satisfies ReadonlyArray<NavigationItem>;
