"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/route-guard";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, activeNavId } from "./nav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/** Bottom tab bar replacing the sidebar on small screens. */
function MobileNav() {
  const active = activeNavId(usePathname());
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sb-line bg-sb-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  isActive ? "text-sb-brand-600" : "text-sb-ink-2"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-sb-tint"
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={isActive ? 2 : 1.6} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface AppShellProps {
  children: ReactNode;
  /** Right-hand rail (hero card, activity, tips). Stacks under the main column below xl. */
  rail?: ReactNode;
}

/** Signed-in app frame: sidebar, top bar, main column and optional right rail. */
export function AppShell({ children, rail }: AppShellProps) {
  return (
    <RouteGuard>
      <div className="relative min-h-dvh overflow-x-clip bg-sb-canvas text-sb-ink">
        {/* Soft green glow in the top-right corner, as in the design */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-[420px] w-[620px] bg-[radial-gradient(closest-side,var(--sb-tint),transparent)] opacity-70"
        />
        <div className="relative flex">
          <Sidebar />
          <div className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-9 lg:pt-7 lg:pb-12">
            <TopBar />
            <div
              className={cn(
                "mt-6 grid gap-6 lg:mt-5",
                rail && "xl:grid-cols-[minmax(0,1fr)_346px] xl:gap-7"
              )}
            >
              <main id="main-content" className="flex min-w-0 flex-col gap-6">
                {children}
              </main>
              {rail && <aside aria-label="Highlights" className="flex min-w-0 flex-col gap-6">{rail}</aside>}
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    </RouteGuard>
  );
}
