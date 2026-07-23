"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, ChevronRight } from "lucide-react";

const billers = [
  {
    id: "1",
    name: "Electric Company",
    logo: "⚡",
    lastPaid: "Dec 28, 2025",
    category: "Utilities",
  },
  {
    id: "2",
    name: "Internet Provider",
    logo: "🌐",
    lastPaid: "Dec 25, 2025",
    category: "Utilities",
  },
  {
    id: "3",
    name: "Mobile Carrier",
    logo: "📱",
    lastPaid: "Dec 20, 2025",
    category: "Telecom",
  },
];

export default function PayPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBillers = useMemo(() => {
    if (searchQuery.trim()) {
      return billers.filter((biller) =>
        biller.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return billers;
  }, [searchQuery]);

  const handleBillerSelect = (billerId: string) => {
    router.push(`/pay/${billerId}/amount`);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-semibold text-white">Pay</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search billers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151A1F] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E660] transition-colors"
          />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Frequent Billers */}
          {filteredBillers.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-3">
                {searchQuery ? "Search results" : "Your billers"}
              </h2>
              <div className="space-y-2">
                {filteredBillers.map((biller) => (
                  <button
                    key={biller.id}
                    onClick={() => handleBillerSelect(biller.id)}
                    className="w-full bg-[#151A1F] hover:bg-[#1A1F25] rounded-xl p-4 flex items-center gap-4 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#00E660]/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl">{biller.logo}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{biller.name}</p>
                      <p className="text-sm text-gray-400">
                        Last paid: {biller.lastPaid}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredBillers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#151A1F] flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-center mb-2">No billers found</p>
              <p className="text-sm text-gray-500 text-center">
                Try adjusting your search
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Biller CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={() => router.push("/pay/add")}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] text-black font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add biller</span>
        </button>
      </div>
    </div>
  );
}
