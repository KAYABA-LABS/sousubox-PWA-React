"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dock } from "@/components/dashboard/Dock";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { UserPlus, Bell } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";

export default function ClientDashboard() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [balance] = useState(12000.0);
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const initialWasVerified =
    (typeof window !== "undefined" &&
      (searchParams?.get("verified") === "true" ||
        sessionStorage.getItem("verified") === "true")) ||
    false;
  const [showWelcome, setShowWelcome] = useState(initialWasVerified);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push("/signin");
      return;
    }

    const displayName =
      (user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName) ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "User";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(displayName);
    setIsLoading(false);

    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("verified") === "true"
    ) {
      sessionStorage.removeItem("verified");
    }
  }, [userId, isLoaded, user, router]);

  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const handleDeposit = () => router.push("/deposit");
  const handleTransfer = () => router.push("/transfer");
  const handleViewAllTransactions = () => router.push("/activity");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#558ae7] flex flex-col pb-32">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#00E660] to-[#00cc55] border border-white/10 flex items-center justify-center text-white font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-400">Hello,</p>
              <p className="text-base font-semibold text-white">{userName}</p>
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

      {showWelcome && (
        <div className="fixed inset-x-4 top-6 z-50 flex items-center justify-center">
          <div className="bg-white/95 text-black rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="font-semibold">Welcome aboard!</div>
            <div className="text-sm text-gray-600">
              Your account is verified.
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="ml-3 text-xs text-blue-600 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BalanceCard
            available={balance}
            onDeposit={handleDeposit}
            onTransfer={handleTransfer}
          />
          <TransactionsList onViewAll={handleViewAllTransactions} />
        </motion.div>
      </main>

      <Dock
        activeItem="home"
        onItemClick={(id) => {
          if (id === "home") router.push("/dashboard");
          else if (id === "activity") router.push("/activity");
          else if (id === "scan") router.push("/scan");
          else if (id === "inbox") router.push("/inbox");
          else if (id === "settings") router.push("/settings");
        }}
      />
    </div>
  );
}
