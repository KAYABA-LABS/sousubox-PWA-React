import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "info" | "neutral" | "danger";

const BADGE_TONES: Record<BadgeTone, { box: string; dot: string }> = {
  success: { box: "bg-sb-tint text-sb-brand-600", dot: "bg-sb-brand-500" },
  warning: { box: "bg-sb-amber-tint text-sb-amber", dot: "bg-sb-amber" },
  info: { box: "bg-sb-blue-tint text-sb-blue", dot: "bg-sb-blue" },
  neutral: { box: "bg-sb-surface-2 text-sb-ink-2", dot: "bg-sb-ink-3" },
  danger: { box: "bg-sb-danger-tint text-sb-danger", dot: "bg-sb-danger" },
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Small rounded status label ("Active", "Due soon", "Default"). */
export function Badge({ tone = "success", dot = false, children, className }: BadgeProps) {
  const styles = BADGE_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap",
        styles.box,
        className
      )}
    >
      {dot && <span aria-hidden="true" className={cn("size-1.5 rounded-full", styles.dot)} />}
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  onHero?: boolean;
  className?: string;
}

/** Thin rounded progress track used on plan cards and the savings challenge. */
export function ProgressBar({ value, max, label, onHero = false, className }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("h-1.5 w-full overflow-hidden rounded-full", onHero ? "bg-white/15" : "bg-sb-line", className)}
    >
      <div
        className={cn("h-full rounded-full", onHero ? "bg-sb-brand-400" : "bg-sb-brand-600")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Row of equal segments, filled up to `filled`, as on the "Your next payout" card. */
export function SegmentedProgress({ filled, total, label }: { filled: number; total: number; label: string }) {
  const count = Math.max(1, Math.min(total, 24));
  return (
    <div role="img" aria-label={label} className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn("h-1.5 flex-1 rounded-full", i < filled ? "bg-sb-brand-400" : "bg-white/15")}
        />
      ))}
    </div>
  );
}

interface ListRowProps {
  label: ReactNode;
  value?: ReactNode;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  className?: string;
}

/** Label/value row with a chevron, used throughout Profile and Settings cards. */
export function ListRow({ label, value, href, onClick, trailing, className }: ListRowProps) {
  const body = (
    <>
      <span className="min-w-0 truncate text-[14px] text-sb-ink-2">{label}</span>
      <span className="flex min-w-0 items-center gap-3">
        {value !== undefined && <span className="truncate text-[14px] font-semibold text-sb-ink">{value}</span>}
        {trailing}
        {(href || onClick) && <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-sb-ink-3" />}
      </span>
    </>
  );
  const rowClass = cn(
    "flex min-h-[43px] w-full items-center justify-between gap-4 border-t border-sb-line py-3 text-left",
    (href || onClick) && "rounded-sm transition-colors hover:bg-sb-surface-2/60 focus-visible:outline-2 focus-visible:outline-sb-brand-500",
    className
  );
  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClass}>
        {body}
      </button>
    );
  }
  return <div className={rowClass}>{body}</div>;
}

/** Circle with a person's initials (avatar fallback in the top bar, profile and pools). */
export function InitialsAvatar({ initials, size = "md", className }: { initials: string; size?: "xs" | "md" | "xl"; className?: string }) {
  const box = { xs: "size-6 text-[10px]", md: "size-10 text-[14px]", xl: "size-[72px] text-[24px]" }[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-sb-brand-600 font-semibold text-white",
        box,
        className
      )}
    >
      {initials}
    </span>
  );
}

/** Overlapping initials for a pool's members. */
export function AvatarStack({ initials }: { initials: string[] }) {
  const palette = ["bg-sb-tint text-sb-brand-700", "bg-sb-amber-tint text-sb-amber", "bg-sb-blue-tint text-sb-blue", "bg-sb-danger-tint text-sb-danger"];
  return (
    <span aria-hidden="true" className="flex -space-x-1.5">
      {initials.slice(0, 4).map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-sb-surface",
            palette[i % palette.length]
          )}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

/** Skeleton block used while live data is loading. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block rounded-lg bg-sb-surface-2 skeleton-shimmer", className)} />;
}

/** Quiet empty-state message inside a card. */
export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-[14px] text-sb-ink-3">{children}</p>;
}
