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
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-sb-ink mb-6">Quiet Hours</h1>
        <div className="bg-sb-surface rounded-2xl p-4 mb-4 flex justify-between items-center">
          <div className="flex gap-3">
            <Moon className="w-5 h-5 text-sb-ink-2" />
            <div>
              <h3 className="text-sb-ink font-medium">Enable Quiet Hours</h3>
              <p className="text-sm text-sb-ink-2">
                Pause non-urgent notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? "bg-sb-brand-800" : "bg-gray-300 dark:bg-gray-600"
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
            <div className="bg-sb-surface rounded-2xl p-4">
              <label className="text-sm text-sb-ink-2 mb-2 block">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
              />
            </div>
            <div className="bg-sb-surface rounded-2xl p-4">
              <label className="text-sm text-sb-ink-2 mb-2 block">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
