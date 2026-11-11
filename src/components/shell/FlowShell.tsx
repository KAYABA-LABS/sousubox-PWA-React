"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface FlowShellProps {
  children: ReactNode;
  /** Paths that render their own AppShell (e.g. "/settings") and must not be wrapped twice. */
  skip?: string[];
}

/**
 * Frame for task flows (deposit, withdraw, settings sub-pages …): the desktop
 * sidebar plus the page's own header and content. Phones see the page as-is.
 */
export function FlowShell({ children, skip = [] }: FlowShellProps) {
  const pathname = usePathname();
  if (pathname && skip.includes(pathname)) return <>{children}</>;
  return (
    <div className="min-h-dvh bg-sb-canvas lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
