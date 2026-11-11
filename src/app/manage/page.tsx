"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  FileText,
  ChevronRight,
} from "lucide-react";

const manageTiles = [
  // {
  //   id: "account",
  //   title: "Account details",
  //   description: "View and edit account information",
  //   icon: User,
  //   route: "/manage/account",
  // },
  // {
  //   id: "security",
  //   title: "Security",
  //   description: "Password, email, and authentication",
  //   icon: Shield,
  //   route: "/manage/security",
  // },
  {
    id: "limits",
    title: "Limits",
    description: "Transaction and spending limits",
    icon: TrendingUp,
    route: "/manage/limits",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Statements and confirmations",
    icon: FileText,
    route: "/manage/documents",
  },
];

export default function ManagePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header className="bg-sb-canvas px-5 pt-6 pb-4 border-b border-sb-line">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-sb-ink">Manage</h1>
            <p className="text-sm text-sb-ink-2">Account controls</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {manageTiles.map((tile, index) => {
            const Icon = tile.icon;
            return (
              <motion.button
                key={tile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(tile.route)}
                className="w-full bg-sb-surface hover:bg-gray-50 dark:hover:bg-sb-surface-2 rounded-xl p-4 flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-sb-brand-800/10 dark:bg-sb-brand-700/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-sb-brand-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sb-ink font-medium">{tile.title}</p>
                  <p className="text-sm text-sb-ink-2">{tile.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-sb-ink-3" />
              </motion.button>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
