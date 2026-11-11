"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sb-brand-800 to-sb-brand-700 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h1 className="text-2xl font-bold text-sb-ink mb-2">Vaulta</h1>
          <p className="text-sb-ink-2">Version 1.0.0</p>
        </div>
        <div className="space-y-3">
          <div className="bg-sb-surface rounded-2xl p-4">
            <h3 className="text-sb-ink font-semibold mb-2">About Vaulta</h3>
            <p className="text-sm text-sb-ink-2">
              Vaulta is a modern fintech platform designed to simplify your
              financial life. Send money, manage cards, and track spending all
              in one place.
            </p>
          </div>
          <div className="bg-sb-surface rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sb-ink-2 text-sm">Build Number</span>
              <span className="text-sb-ink text-sm">2026.01.12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sb-ink-2 text-sm">Last Updated</span>
              <span className="text-sb-ink text-sm">Jan 12, 2026</span>
            </div>
          </div>
          <button className="w-full bg-sb-surface rounded-xl p-4 text-sb-brand-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors">
            Check for Updates
          </button>
        </div>
      </div>
    </div>
  );
}
