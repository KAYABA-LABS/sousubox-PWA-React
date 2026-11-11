"use client";

import { Suspense } from "react";
import { PoolsScreen } from "@/components/pools/PoolsScreen";

/** /pools — the user's pools and pools open to join. */
export default function PoolsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-sb-canvas" />}>
      <PoolsScreen />
    </Suspense>
  );
}
