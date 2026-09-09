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
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Manage</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Account controls</p>
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
                className="w-full bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] rounded-xl p-4 flex items-center gap-4 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#0D4F3C] dark:text-[#156B53]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#0C0F14] dark:text-white font-medium">{tile.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tile.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </motion.button>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
