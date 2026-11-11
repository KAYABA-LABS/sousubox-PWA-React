"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function DownloadData() {
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

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
        <h1 className="text-2xl font-bold text-sb-ink mb-6">
          Download Your Data
        </h1>
        <div className="bg-sb-surface rounded-2xl p-5 mb-4">
          <h3 className="text-sb-ink font-semibold mb-2">What&apos;s included?</h3>
          <ul className="text-sm text-sb-ink-2 space-y-1">
            <li>• Transaction history</li>
            <li>• Account statements</li>
            <li>• Profile information</li>
            <li>• Card details</li>
          </ul>
        </div>
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-sb-ink-2">
              Your data will be prepared and sent to your email within 48 hours.
            </p>
          </div>
        </div>
        <button
          onClick={() => setRequesting(true)}
          disabled={requesting}
          className="w-full bg-sb-brand-800 text-white font-medium py-3 rounded-xl hover:bg-sb-brand-700 disabled:opacity-50"
        >
          {requesting ? "Processing..." : "Request Data Download"}
        </button>
      </div>
    </div>
  );
}
