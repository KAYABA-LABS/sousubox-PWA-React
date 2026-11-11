"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function VirtualCards() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="bg-sb-surface rounded-2xl p-6 text-center">
          <CreditCard className="w-8 h-8 text-sb-ink-2 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-sb-ink mb-2">Virtual Cards</h1>
          <p className="text-sb-ink-2">Card data will appear when the backend provides it.</p>
        </div>
      </div>
    </div>
  );
}
