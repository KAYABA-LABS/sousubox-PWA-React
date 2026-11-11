"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function DataUsage() {
  const router = useRouter();

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
        <h1 className="text-2xl font-bold text-sb-ink mb-6">Data Usage</h1>
        <div className="space-y-3">
          <div className="bg-sb-surface rounded-2xl p-4">
            <h3 className="text-sb-ink font-semibold mb-2">Storage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-sb-ink-2">App Data</span>
                <span className="text-sb-ink">12.4 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sb-ink-2">Cache</span>
                <span className="text-sb-ink">3.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sb-ink-2">Documents</span>
                <span className="text-sb-ink">8.1 MB</span>
              </div>
            </div>
          </div>
          <button className="w-full bg-sb-surface rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors">
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            <div className="text-left flex-1">
              <h3 className="text-sb-ink font-medium">Clear Cache</h3>
              <p className="text-sm text-sb-ink-2">Free up 3.2 MB</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
