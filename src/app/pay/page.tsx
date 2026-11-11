"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

export default function PayPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header className="bg-sb-canvas px-5 pt-6 pb-4 border-b border-sb-line">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-semibold text-sb-ink">Pay</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sb-ink-3" />
          <input
            type="text"
            placeholder="Search billers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sb-surface border border-sb-line rounded-xl pl-12 pr-4 py-3 text-sb-ink placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-sb-brand-600 transition-colors"
          />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-sb-surface flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-sb-ink-3" />
          </div>
              <p className="text-sb-ink-2 text-center mb-2">No billers available</p>
              <p className="text-sm text-sb-ink-3 text-center">
                Biller data will appear here when the backend provides it.
              </p>
            </div>
        </motion.div>
      </main>

      <div className="px-5 pb-8">
        <button disabled className="w-full bg-black/10 dark:bg-white/10 text-sb-ink-3 font-semibold py-4 rounded-xl cursor-not-allowed">
          Biller service unavailable
        </button>
      </div>
    </div>
  );
}
