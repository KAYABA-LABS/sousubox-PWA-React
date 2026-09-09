"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0D4F3C] to-[#156B53] rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-2">Vaulta</h1>
          <p className="text-gray-500 dark:text-gray-400">Version 1.0.0</p>
        </div>
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
            <h3 className="text-[#0C0F14] dark:text-white font-semibold mb-2">About Vaulta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vaulta is a modern fintech platform designed to simplify your
              financial life. Send money, manage cards, and track spending all
              in one place.
            </p>
          </div>
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Build Number</span>
              <span className="text-[#0C0F14] dark:text-white text-sm">2026.01.12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Last Updated</span>
              <span className="text-[#0C0F14] dark:text-white text-sm">Jan 12, 2026</span>
            </div>
          </div>
          <button className="w-full bg-white dark:bg-[#151A1F] rounded-xl p-4 text-[#0D4F3C] dark:text-[#156B53] text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1A1F25] transition-colors">
            Check for Updates
          </button>
        </div>
      </div>
    </div>
  );
}
