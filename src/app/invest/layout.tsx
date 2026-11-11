import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { ComingSoon } from "@/components/plans/ComingSoon";
import { INVEST_ENABLED } from "@/lib/features";

/**
 * Gates the /invest section. While NEXT_PUBLIC_ENABLE_INVEST is not "true",
 * none of the invest pages mount and a "coming soon" card is shown instead.
 */
export default function InvestLayout({ children }: { children: ReactNode }) {
  if (!INVEST_ENABLED) {
    return (
      <AppShell>
        <ComingSoon eyebrow="Invest" />
      </AppShell>
    );
  }
  // Some invest pages read search params, which needs a Suspense boundary to prerender.
  return <Suspense fallback={<div className="min-h-dvh bg-sb-canvas" />}>{children}</Suspense>;
}
