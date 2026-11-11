import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CardTone = "plain" | "wash" | "warm" | "hero" | "danger";

const CARD_TONES: Record<CardTone, string> = {
  plain: "bg-sb-surface border border-sb-line shadow-sb-card",
  wash: "bg-sb-wash border border-sb-line shadow-sb-card",
  warm: "bg-sb-wash-warm border border-sb-line shadow-sb-card",
  hero: "bg-sb-hero text-white shadow-sb-pop",
  danger: "bg-sb-danger-tint border border-sb-danger/15",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padded?: boolean;
}

/** Base surface for every panel in the app; `tone` picks the design's card treatments. */
export function Card({ tone = "plain", padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        tone === "hero" ? "rounded-sb-hero" : "rounded-sb-card",
        padded && "p-5 sm:p-6",
        CARD_TONES[tone],
        className
      )}
      {...props}
    />
  );
}

type IconTone = "brand" | "blue" | "amber" | "gold" | "danger" | "neutral" | "onHero";

const ICON_TONES: Record<IconTone, string> = {
  brand: "bg-sb-tint text-sb-brand-600",
  blue: "bg-sb-blue-tint text-sb-blue",
  amber: "bg-sb-amber-tint text-sb-amber",
  gold: "bg-sb-gold-tint text-sb-gold",
  danger: "bg-sb-danger-tint text-sb-danger",
  neutral: "bg-sb-surface-2 text-sb-ink-2",
  onHero: "bg-white/10 text-sb-brand-300",
};

interface IconTileProps {
  icon: LucideIcon;
  tone?: IconTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Round tinted icon badge used in list rows, tiles and card headers. */
export function IconTile({ icon: Icon, tone = "brand", size = "md", className }: IconTileProps) {
  const box = { sm: "size-8", md: "size-10", lg: "size-11" }[size];
  const glyph = { sm: "size-4", md: "size-[18px]", lg: "size-5" }[size];
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", box, ICON_TONES[tone], className)}
    >
      <Icon className={glyph} strokeWidth={1.75} />
    </span>
  );
}

interface CardHeaderProps {
  icon?: LucideIcon;
  title: ReactNode;
  action?: ReactNode;
  boxedIcon?: boolean;
  className?: string;
}

/** Title row at the top of a card, optionally with a leading icon and a trailing action. */
export function CardHeader({ icon, title, action, boxedIcon = false, className }: CardHeaderProps) {
  const Icon = icon;
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon &&
          (boxedIcon ? (
            <IconTile icon={Icon} size="sm" />
          ) : (
            <Icon aria-hidden="true" className="size-5 shrink-0 text-sb-ink" strokeWidth={1.75} />
          ))}
        <h2 className="truncate text-sb-section font-semibold text-sb-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Heading above a group of cards in the main column (e.g. "Popular Pools"). */
export function SectionHeader({ icon: Icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-3 text-sb-section font-semibold text-sb-ink">
        {Icon && <Icon aria-hidden="true" className="size-5 text-sb-brand-600" strokeWidth={1.75} />}
        {title}
      </h2>
      {action}
    </div>
  );
}

interface PageHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  size?: "display" | "title";
}

/** Page-level eyebrow, headline and optional subtitle/action, as at the top of each screen. */
export function PageHeading({ eyebrow, title, subtitle, action, size = "title" }: PageHeadingProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[15px] font-semibold text-sb-brand-600">{eyebrow}</p>}
        <h1
          className={cn(
            "font-bold text-sb-ink text-balance",
            size === "display"
              ? "text-[2.25rem] leading-[1.05] tracking-[-0.035em] sm:text-sb-display lg:text-[3.25rem]"
              : "text-[2rem] leading-[1.1] tracking-[-0.03em] sm:text-sb-title"
          )}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-[17px] text-sb-ink-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
