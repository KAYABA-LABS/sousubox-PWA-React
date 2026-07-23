"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";

export default function TaxDocuments() {
  const router = useRouter();
  const docs = [
    { year: "2025", type: "1099-INT", available: true },
    { year: "2024", type: "1099-INT", available: true },
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
        <h1 className="text-2xl font-bold text-white mb-6">Tax Documents</h1>
        <div className="space-y-3">
          {docs.map((doc, i) => (
            <div
              key={i}
              className="bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-white font-medium">{doc.type}</h3>
                  <p className="text-xs text-gray-400">Tax Year {doc.year}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[#00E660] text-sm">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
