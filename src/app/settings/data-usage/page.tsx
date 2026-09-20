"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function DataUsage() {
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
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">Data Usage</h1>
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
            <h3 className="text-[#0C0F14] dark:text-white font-semibold mb-2">Storage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">App Data</span>
                <span className="text-[#0C0F14] dark:text-white">12.4 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cache</span>
                <span className="text-[#0C0F14] dark:text-white">3.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Documents</span>
                <span className="text-[#0C0F14] dark:text-white">8.1 MB</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-white dark:bg-[#151A1F] rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#1A1F25] transition-colors">
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            <div className="text-left flex-1">
              <h3 className="text-[#0C0F14] dark:text-white font-medium">Clear Cache</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Free up 3.2 MB</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
