"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SendAmountPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sb-canvas flex flex-col items-center justify-center px-5 text-center">
      <p className="text-sb-ink-2 mb-4">Transfer details are not available yet.</p>
      <button onClick={() => router.back()} className="text-sb-brand-600 hover:underline">
        <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Go back
      </button>
    </main>
  );
}
