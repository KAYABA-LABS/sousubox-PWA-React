import { BarChart3, CircleUserRound, House, TrendingUp, UsersRound, type LucideIcon } from "lucide-react";

export interface NavItem {
  id: "home" | "plans" | "pools" | "invest" | "profile";
  label: string;
  href: string;
  icon: LucideIcon;
  /** Other path prefixes that should highlight this item. */
  matches: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: House, matches: ["/dashboard"] },
  { id: "plans", label: "Plans", href: "/plans", icon: BarChart3, matches: ["/plans"] },
  { id: "pools", label: "Pools", href: "/pools", icon: UsersRound, matches: ["/pools"] },
  { id: "invest", label: "Invest", href: "/invest", icon: TrendingUp, matches: ["/invest"] },
  { id: "profile", label: "Profile", href: "/profile", icon: CircleUserRound, matches: ["/profile", "/settings"] },
];

/** Which nav item a pathname belongs to (Settings lives under Profile, as in the design). */
export function activeNavId(pathname: string | null): NavItem["id"] | null {
  if (!pathname) return null;
  const item = NAV_ITEMS.find((nav) => nav.matches.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)));
  return item?.id ?? null;
}
