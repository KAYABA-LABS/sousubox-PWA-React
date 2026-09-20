"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

export default function PayPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Pay</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search billers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] transition-colors"
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
              <div className="w-16 h-16 rounded-full bg-white dark:bg-[#151A1F] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">No billers available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Biller data will appear here when the backend provides it.
              </p>
            </div>
        </motion.div>
      </main>

      <div className="px-5 pb-8">
        <button disabled className="w-full bg-black/10 dark:bg-white/10 text-gray-400 dark:text-gray-500 font-semibold py-4 rounded-xl cursor-not-allowed">
          Biller service unavailable
        </button>
      </div>
    </div>
  );
}
