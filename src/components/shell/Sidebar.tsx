"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { LinkButton } from "@/components/ds";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, activeNavId } from "./nav";

/** Sousubox wordmark: green "S" tile, name and tagline. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3.5 rounded-xl focus-visible:outline-2 focus-visible:outline-sb-brand-500">
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-sb-brand-600 to-sb-brand-800 text-[22px] font-bold text-white shadow-sb-card lg:size-[52px] lg:text-[26px]"
      >
        S
      </span>
      <span className="flex flex-col">
        <span className="text-[19px] leading-tight font-bold tracking-[-0.02em] text-sb-ink lg:text-[21px]">sousubox</span>
        {!compact && <span className="text-[13px] text-sb-ink-2">Save together</span>}
      </span>
    </Link>
  );
}

/** Light/Dark segmented switch at the bottom of the sidebar. */
function ThemeSwitch() {
  const { mode, setMode } = useTheme();
  const options = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ];
  return (
    <div role="group" aria-label="Colour theme" className="flex rounded-full bg-sb-surface-2 p-1.5">
      {options.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setMode(value)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-sb-brand-500",
              active ? "bg-sb-surface text-sb-ink shadow-sb-card" : "text-sb-ink-2 hover:text-sb-ink"
            )}
          >
            <Icon aria-hidden="true" className={cn("size-[18px]", active && value === "light" && "text-sb-gold")} strokeWidth={1.75} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** "Protected & trusted" reassurance card pinned above the theme switch. */
function TrustCard() {
  return (
    <div className="relative overflow-hidden rounded-sb-card bg-sb-hero p-5 text-white">
      <div className="flex items-start justify-between">
        <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-sb-brand-300">
          <ShieldCheck className="size-5" strokeWidth={1.75} />
        </span>
        <Sparkles aria-hidden="true" className="size-5 text-sb-gold" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-[17px] font-semibold">Protected &amp; trusted</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
        Every contribution is held safely and every pool rule is visible to members.
      </p>
      <LinkButton href="/learn-more" variant="ghostOnHero" size="sm" trailingArrow className="mt-4">
        Learn more
      </LinkButton>
    </div>
  );
}

/** Fixed left navigation shown on large screens. */
export function Sidebar() {
  const active = activeNavId(usePathname());
  return (
    <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 flex-col overflow-y-auto border-r border-sb-line px-7 pt-8 pb-7 lg:flex">
      <BrandMark />
      <nav aria-label="Main" className="mt-9">
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-14 items-center gap-4 rounded-2xl px-5 text-[16px] font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-sb-brand-500",
                    isActive ? "bg-sb-tint text-sb-ink" : "text-sb-ink hover:bg-sb-surface-2"
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("size-[22px]", isActive ? "text-sb-brand-600" : "text-sb-ink")}
                    strokeWidth={1.6}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto flex flex-col gap-5 pt-6">
        <TrustCard />
        <ThemeSwitch />
      </div>
    </aside>
  );
}
