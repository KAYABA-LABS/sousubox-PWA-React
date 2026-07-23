"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Dock } from "@/components/dashboard/Dock";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CardsSection } from "@/components/dashboard/CardsSection";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { UserPlus, Bell } from "lucide-react";
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
    <div className="min-h-screen bg-[#0C0F14] flex flex-col pb-32">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-blue-500 to-purple-600 border border-white/10 flex items-center justify-center overflow-hidden">
              <Image
                src="https://avatar.vercel.sh/andrew"
                alt="User avatar"
                width={44}
                height={44}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-semibold text-white">12:00</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-[#2A2F3A] hover:bg-[#323842] flex items-center justify-center transition-colors">
              <UserPlus className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#2A2F3A] hover:bg-[#323842] flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Balance section */}
          <BalanceCard
            available={85354.64}
            onDeposit={() => handleAction("Deposit")}
            onTransfer={() => handleAction("Transfer")}
          />

          {/* Cards section */}
          <CardsSection onCardClick={(id) => handleAction(`Card ${id}`)} />

          {/* Transactions */}
          <TransactionsList
            onViewAll={() => handleAction("View all transactions")}
          />

          {/* Analytics Section */}
          <div className="px-5 py-6">
            <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
            <div className="bg-[#2A2F3A] rounded-2xl p-4 h-48 flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom dock */}
      <Dock activeItem="" onItemClick={(href) => window.location.href = href} />
    </div>
  );
}
