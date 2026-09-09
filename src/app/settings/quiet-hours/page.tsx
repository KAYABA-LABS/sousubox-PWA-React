"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon } from "lucide-react";

export default function QuietHours() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("08:00");

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
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">Quiet Hours</h1>
        <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4 mb-4 flex justify-between items-center">
          <div className="flex gap-3">
            <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <h3 className="text-[#0C0F14] dark:text-white font-medium">Enable Quiet Hours</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pause non-urgent notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? "bg-[#0D4F3C]" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {enabled && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0C0F14] rounded-xl p-3 text-[#0C0F14] dark:text-white"
              />
            </div>
            <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0C0F14] rounded-xl p-3 text-[#0C0F14] dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
