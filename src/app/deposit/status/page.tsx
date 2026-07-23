"use client";

import { motion } from "framer-motion";
import { useMemo, Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

export const dynamic = "force-dynamic";

interface DepositData {
  method: string;
  methodName: string;
  amount: string;
  referenceCode: string;
}

function DepositStatusContent() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] = useState("");
  const [blocked, setBlocked] = useState(false);

  const depositData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as DepositData) : null;
  }, [searchParams]);

  useEffect(() => {
    if (depositData && !blocked) {
      try {
        sessionStorage.setItem("pending_deposit", depositData.amount);
        sessionStorage.setItem("pending_deposit_ts", String(Date.now()));
      } catch {
        // ignore storage errors
      }
    }
  }, [depositData, blocked]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const forceBlocked = searchParams.get("force_blocked");
    if (forceBlocked) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlocked(true);
      setErrorMsg(
        "Your account has been blocked. This deposit cannot be processed. Please contact support."
      );
    }
  }, [userId, isLoaded, user, router, searchParams]);

  if (!depositData) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      <main className="flex-1 px-5 py-12 flex flex-col items-center justify-center">
        {blocked && errorMsg && (
          <div className="w-full max-w-lg mb-6 px-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          </div>
        )}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Clock className="w-14 h-14 text-amber-400" strokeWidth={2} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Deposit pending
          </h1>
          <p className="text-gray-400">We&apos;re waiting for your transfer</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-4"
        >
          {/* Amount Card */}
          <div className="bg-[#151A1F] rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Expected deposit</p>
            <p className="text-5xl font-bold text-white mb-2">
              ${parseFloat(depositData.amount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              via {depositData.methodName}
            </p>
          </div>

          {/* Status Details */}
          <div className="bg-[#151A1F] rounded-xl divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Reference code</p>
              <p className="text-white font-mono text-sm">
                {depositData.referenceCode}
              </p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Status</p>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
                Pending
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Estimated time</p>
              <p className="text-white text-sm">2-3 business days</p>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300 mb-2 font-medium">
              What happens next?
            </p>
            <ul className="space-y-1.5 text-xs text-blue-300/80">
              <li>
                • Your deposit will be processed once we receive the transfer
              </li>
              <li>
                • You&apos;ll receive a notification when funds are available
              </li>
              <li>• Track status in your transaction history</li>
            </ul>
          </div>
        </motion.div>
      </main>

      {/* Bottom Actions */}
      <div className="px-5 pb-8 space-y-3">
        {blocked ? (
          <>
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-red-300">
                Your account is blocked and this deposit cannot be processed.
                Please contact support for assistance.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#00E660] hover:bg-[#00cc55] text-black font-semibold py-4 rounded-xl transition-colors"
            >
              Back to dashboard
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#00E660] hover:bg-[#00cc55] text-black font-semibold py-4 rounded-xl transition-colors"
            >
              Back to dashboard
            </button>
            <button
              onClick={() =>
                router.push(
                  "/deposit/instructions?data=" + searchParams.get("data")
                )
              }
              className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium py-4 rounded-xl transition-colors"
            >
              View instructions again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DepositStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DepositStatusContent />
    </Suspense>
  );
}
