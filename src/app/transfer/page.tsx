"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";

export default function TransferPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sb-canvas flex flex-col items-center justify-center px-5 text-center">
      <ArrowRightLeft className="w-8 h-8 text-sb-ink-3 mb-4" />
      <p className="text-sb-ink-2 mb-4">Account balances are not available yet.</p>
      <button onClick={() => router.back()} className="text-sb-brand-600 hover:underline">
        <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Go back
      </button>
    </main>
  );
}
