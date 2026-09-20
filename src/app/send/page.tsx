"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";

export default function SendPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Send Money
        </button>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <Search className="w-8 h-8 text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">No recipients available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Recipient data will appear when the backend provides it.</p>
      </section>
    </main>
  );
}
