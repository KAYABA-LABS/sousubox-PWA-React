"use client";

import { motion } from "framer-motion";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type PaymentData = {
  amount?: string;
  biller?: { id?: string; name?: string } | null;
  billerId?: string;
  [key: string]: unknown;
};

function PayScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const initialPaymentData = useMemo<PaymentData | null>(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(dataParam) as PaymentData;
    } catch {
      return null;
    }
  }, [dataParam]);

  const tomorrowIso = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  }, []);

  const [paymentData] = useState<PaymentData | null>(initialPaymentData);
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState<string>(tomorrowIso);

  const handleReview = () => {
    if (!paymentData) return;

    const finalData = {
      ...paymentData,
      timing,
      scheduledDate:
        timing === "later" ? scheduledDate : new Date().toISOString(),
    };

    const billerIdSafe = paymentData.billerId ?? "";

    router.push(
      `/pay/${billerIdSafe}/confirm?data=${encodeURIComponent(
        JSON.stringify(finalData)
      )}`
    );
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">Schedule</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose payment timing</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Payment Summary */}
          <div className="bg-white dark:bg-[#151A1F] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Payment amount</p>
            <p className="text-4xl font-bold text-[#0C0F14] dark:text-white mb-2">
              ${parseFloat(paymentData?.amount ?? "0").toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              to {paymentData?.biller?.name ?? ""}
            </p>
          </div>

          {/* Timing Options */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">When to pay</h2>

            {/* Pay Now */}
            <button
              onClick={() => setTiming("now")}
              className={`w-full rounded-xl p-4 border-2 transition-all ${
                timing === "now"
                  ? "bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 border-[#0D4F3C] dark:border-[#156B53]"
                  : "bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    timing === "now" ? "border-[#0D4F3C] dark:border-[#156B53]" : "border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {timing === "now" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0D4F3C]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#0C0F14] dark:text-white font-medium mb-1">Pay now</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Payment will be processed immediately
                  </p>
                </div>
              </div>
            </button>

            {/* Schedule for Later */}
            <button
              onClick={() => setTiming("later")}
              className={`w-full rounded-xl p-4 border-2 transition-all ${
                timing === "later"
                  ? "bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 border-[#0D4F3C] dark:border-[#156B53]"
                  : "bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1A1F25]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    timing === "later" ? "border-[#0D4F3C] dark:border-[#156B53]" : "border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {timing === "later" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0D4F3C]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#0C0F14] dark:text-white font-medium mb-1">
                    Schedule for later
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose a specific date
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Date Picker (shown when "later" is selected) */}
          {timing === "later" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-[#151A1F] rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Payment date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-gray-50 dark:bg-[#0C0F14] border border-black/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-[#0C0F14] dark:text-white focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={handleReview}
          className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white font-semibold py-4 rounded-xl transition-colors"
        >
          Review payment
        </button>
      </div>
    </div>
  );
}

export default function PaySchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PayScheduleContent />
    </Suspense>
  );
}
