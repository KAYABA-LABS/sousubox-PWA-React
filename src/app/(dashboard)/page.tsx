"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dock } from "@/components/dashboard/Dock";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { UserPlus, Bell } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { isDevMode } from "@/lib/dev";
import { toast } from "sonner";

function getDisplayName(user: { firstName?: string | null; emailAddresses?: { emailAddress: string }[] } | null): string {
  if (user?.firstName) return user.firstName;
  if (user?.emailAddresses?.[0]?.emailAddress) {
    const email = user.emailAddresses[0].emailAddress;
    return email.split("@")[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  }
  return "User";
}

export default function Dashboard() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [balance] = useState(3445780.0);
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

    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(getDisplayName(user ?? null));
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

  const handleDeposit = () => {
    toast.info("Deposit clicked");
  };

  const handleTransfer = () => {
    toast.info("Transfer clicked");
  };

  const handleViewAllTransactions = () => {
    router.push("/activity");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-blue-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#00E660] to-[#00cc55] border border-gray-200 flex items-center justify-center text-gray-900 font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-500">Hello,</p>
              <p className="text-base font-semibold text-gray-900">{userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Add user">
              <UserPlus className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </Button>
            <Button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </motion.header>

      {showWelcome && (
        <div className="fixed inset-x-4 top-6 z-50 flex items-center justify-center">
          <div className="bg-white/95 text-black rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="font-semibold">Welcome aboard!</div>
            <div className="text-sm text-gray-500">
              Your account is verified.
            </div>
            <Button
              onClick={() => setShowWelcome(false)}
              className="ml-3 text-xs text-blue-600 underline"
            >
              Dismiss
            </Button>
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

      <Dock activeItem="home" onItemClick={(href) => router.push(href)} />
    </main>
  );
}
