"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

export default function Agreements() {
  const router = useRouter();
  const docs = [
    { title: "Terms of Service", updated: "Jan 1, 2026" },
    { title: "Privacy Policy", updated: "Jan 1, 2026" },
    { title: "Account Agreement", updated: "Dec 15, 2025" },
    { title: "E-Sign Disclosure", updated: "Dec 1, 2025" },
  ];

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
          Account Agreements
        </h1>
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <button
              key={i}
              className="w-full bg-sb-surface rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors"
            >
              <div className="flex gap-3 items-center">
                <FileText className="w-5 h-5 text-sb-ink-2" />
                <div className="text-left">
                  <h3 className="text-sb-ink font-medium">{doc.title}</h3>
                  <p className="text-xs text-sb-ink-2">Updated {doc.updated}</p>
                </div>
              </div>
              <span className="text-sb-brand-600 text-sm">View</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
