"use client";

import React, { Suspense } from "react";
import ClientDashboard from "@/components/ClientDashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClientDashboard />
    </Suspense>
  );
}
