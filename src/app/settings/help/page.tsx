"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, ChevronRight } from "lucide-react";

export default function HelpCenter() {
  const router = useRouter();
  const topics = [
    { title: "Getting Started", count: 8 },
    { title: "Deposits & Withdrawals", count: 12 },
    { title: "Cards & Payments", count: 15 },
    { title: "Account Security", count: 10 },
    { title: "Transfers", count: 9 },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">Help Center</h1>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search help articles..."
            className="w-full bg-[#151A1F] rounded-xl p-4 text-white placeholder:text-gray-500 border border-white/10 focus:border-[#00E660] focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          {topics.map((topic, i) => (
            <button
              key={i}
              className="w-full bg-[#151A1F] rounded-xl p-4 flex justify-between items-center hover:bg-[#1A1F25] transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <h3 className="text-white font-medium">{topic.title}</h3>
                  <p className="text-xs text-gray-400">
                    {topic.count} articles
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
