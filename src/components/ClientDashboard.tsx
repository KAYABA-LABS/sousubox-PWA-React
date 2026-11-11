"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/AppShell";
import { HomeMain } from "@/components/home/HomeMain";
import { HomeRail } from "@/components/home/HomeRail";
import { useHomeData } from "@/components/home/useHomeData";

/** Home screen: greeting, balance, quick actions, pools and savings, with the activity rail. */
export default function ClientDashboard() {
  const data = useHomeData();
  const searchParams = useSearchParams();

  // Welcome message after the KYC flow redirects back with ?verified=true.
  useEffect(() => {
    const fromQuery = searchParams?.get("verified") === "true";
    const fromSession = sessionStorage.getItem("verified") === "true";
    if (!fromQuery && !fromSession) return;
    sessionStorage.removeItem("verified");
    toast.success("You're verified", { description: "Pools, deposits and transfers are now unlocked." });
  }, [searchParams]);

  return (
    <AppShell rail={<HomeRail data={data} />}>
      <HomeMain data={data} />
    </AppShell>
  );
}
