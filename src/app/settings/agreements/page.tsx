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
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">
          Account Agreements
        </h1>
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <button
              key={i}
              className="w-full bg-white dark:bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-[#1A1F25] transition-colors"
            >
              <div className="flex gap-3 items-center">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <h3 className="text-[#0C0F14] dark:text-white font-medium">{doc.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Updated {doc.updated}</p>
                </div>
              </div>
              <span className="text-[#0D4F3C] dark:text-[#156B53] text-sm">View</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
