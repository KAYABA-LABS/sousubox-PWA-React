"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download, Calendar } from "lucide-react";

const documents = [
  {
    id: "1",
    type: "Statement",
    date: "December 2025",
    size: "245 KB",
    downloadUrl: "#",
  },
  {
    id: "2",
    type: "Statement",
    date: "November 2025",
    size: "198 KB",
    downloadUrl: "#",
  },
  {
    id: "3",
    type: "Transaction Confirmation",
    date: "Jan 2, 2026",
    size: "42 KB",
    downloadUrl: "#",
  },
  {
    id: "4",
    type: "Transaction Confirmation",
    date: "Dec 30, 2025",
    size: "38 KB",
    downloadUrl: "#",
  },
  {
    id: "5",
    type: "Statement",
    date: "October 2025",
    size: "212 KB",
    downloadUrl: "#",
  },
];

export default function ManageDocumentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "statements" | "confirmations">(
    "all"
  );

  const filteredDocuments = documents.filter((doc) => {
    if (filter === "all") return true;
    if (filter === "statements") return doc.type === "Statement";
    if (filter === "confirmations")
      return doc.type === "Transaction Confirmation";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Documents</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Statements & confirmations</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[#0D4F3C] text-white"
                : "bg-white dark:bg-[#151A1F] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("statements")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "statements"
                ? "bg-[#0D4F3C] text-white"
                : "bg-white dark:bg-[#151A1F] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
            }`}
          >
            Statements
          </button>
          <button
            onClick={() => setFilter("confirmations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "confirmations"
                ? "bg-[#0D4F3C] text-white"
                : "bg-white dark:bg-[#151A1F] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
            }`}
          >
            Confirmations
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] rounded-xl p-4 flex items-center gap-4 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center shrink-0">
                <FileText
                  className="w-6 h-6 text-[#0D4F3C] dark:text-[#156B53]"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1">
                <p className="text-[#0C0F14] dark:text-white font-medium">{doc.type}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{doc.date}</p>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{doc.size}</p>
                </div>
              </div>
              <button
                onClick={() => {}}
                className="w-10 h-10 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 hover:bg-[#0D4F3C]/20 dark:hover:bg-[#156B53]/20 flex items-center justify-center transition-colors"
              >
                <Download className="w-5 h-5 text-[#0D4F3C] dark:text-[#156B53]" strokeWidth={2} />
              </button>
            </motion.div>
          ))}

          {filteredDocuments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-[#151A1F] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No documents found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Documents will appear here as they become available
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Info Notice */}
      <div className="px-5 pb-8">
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Documents are available for download for up to 7 years
          </p>
        </div>
      </div>
    </div>
  );
}
