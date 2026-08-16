"use client";

import React, { Suspense } from "react";
import ClientDashboard from "@/components/ClientDashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClientDashboard />
    </Suspense>
  );
}
