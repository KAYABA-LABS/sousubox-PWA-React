"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Bell, ChevronDown, LogOut, Search, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InitialsAvatar } from "@/components/ds";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BrandMark } from "./Sidebar";

/** Search box that hands the query to the Pools discover tab. */
function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  /** Navigate to the pool search results for the current query. */
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/pools?tab=discover&q=${encodeURIComponent(q)}` : "/pools?tab=discover");
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-[460px]">
      <label htmlFor="global-search" className="sr-only">
        Search pools and plans
      </label>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-sb-ink-2" strokeWidth={1.75} />
      <input
        id="global-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search pools, plans..."
        className="h-12 w-full rounded-full border border-sb-line bg-sb-surface pr-5 pl-13 text-[15px] text-sb-ink placeholder:text-sb-ink-3 focus:border-sb-brand-500 focus:outline-none"
      />
    </form>
  );
}

/** Avatar with a menu for profile, settings and signing out. */
function AccountMenu() {
  const { initials } = useCurrentUser();
  const { signOut } = useClerk();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-sb-brand-500">
        <InitialsAvatar initials={initials} />
        <ChevronDown aria-hidden="true" className="hidden size-5 text-sb-ink sm:block" strokeWidth={1.75} />
        <span className="sr-only">Open account menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => router.push("/profile")}>
          <UserRound className="size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/settings")}>
          <Settings className="size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ redirectUrl: "/signin" })}>
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Top bar: search on desktop, brand on mobile, notifications and account on both. */
export function TopBar() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="lg:hidden">
        <BrandMark compact />
      </div>
      <div className="hidden flex-1 lg:block">
        <SearchBox />
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/inbox"
          aria-label="Notifications"
          className="flex size-11 items-center justify-center rounded-full text-sb-ink hover:bg-sb-surface-2 focus-visible:outline-2 focus-visible:outline-sb-brand-500"
        >
          <Bell aria-hidden="true" className="size-6" strokeWidth={1.6} />
        </Link>
        <AccountMenu />
      </div>
    </div>
  );
}
