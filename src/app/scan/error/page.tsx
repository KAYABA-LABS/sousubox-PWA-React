"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QrCode, Clock, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

function ScanErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get("type") || "invalid";

  const errorStates = {
    invalid: {
      icon: QrCode,
      title: "This code isn't supported",
      description: "The QR code doesn't match a payment or Vaulta account.",
    },
    expired: {
      icon: Clock,
      title: "This code has expired",
      description: "Ask the sender to generate a new QR code.",
    },
    error: {
      icon: AlertCircle,
      title: "Something went wrong",
      description: "We couldn't process this QR code. Please try again.",
    },
  };

  const state =
    errorStates[errorType as keyof typeof errorStates] || errorStates.invalid;

  const IconComponent = state.icon;

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
      <EmptyState
        icon={<IconComponent className="w-8 h-8" />}
        title={state.title}
        description={state.description}
        action={{
          label: "Scan again",
          onClick: () => router.push("/scan"),
        }}
      />
    </div>
  );
}

export default function ScanErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ScanErrorContent />
    </Suspense>
  );
}
