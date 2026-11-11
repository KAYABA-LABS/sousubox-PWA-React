"use client";

import { motion } from "framer-motion";
import { Dock } from "@/components/dashboard/Dock";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ActionsPage() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `${action} feature coming soon.`,
    });
  };

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col pb-32">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-black/5 dark:bg-white/10 border border-sb-line flex items-center justify-center">
              <span className="text-sb-ink-2">—</span>
            </div>
            <div>
              <p className="text-base font-semibold text-sb-ink">Actions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2A2F3A] hover:bg-gray-200 dark:hover:bg-[#323842] flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-sb-ink-2" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="px-5 py-16 text-center">
            <p className="text-sb-ink-2">Live actions will appear when backend data is available.</p>
          </div>
        </motion.div>
      </main>

      {/* Bottom dock */}
      <Dock activeItem="" onItemClick={(href) => window.location.href = href} />
    </div>
  );
}
