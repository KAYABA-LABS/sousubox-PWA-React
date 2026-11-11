"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";

export default function SendPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sb-canvas flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b border-sb-line">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Send Money
        </button>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <Search className="w-8 h-8 text-sb-ink-3 mb-4" />
        <p className="text-sb-ink-2 mb-2">No recipients available</p>
        <p className="text-sm text-sb-ink-3">Recipient data will appear when the backend provides it.</p>
      </section>
    </main>
  );
}
