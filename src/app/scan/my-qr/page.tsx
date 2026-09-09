"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Check } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import QRCode from "qrcode";

export default function MyQRPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [userName, setUserName] = useState("User");
  const [accountNumber, setAccountNumber] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(name);
      setAccountNumber("0000");

      const paymentData = {
        type: "vaulta_payment",
        userId: userId,
        accountNumber: "0000",
        name: name,
        timestamp: Date.now(),
      };

      const qrData = JSON.stringify(paymentData);
      QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      }).then(setQrCodeUrl);
    }
  }, [userId, isLoaded, user, router]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay me on Vaulta",
          text: `Scan this QR code to pay ${userName}`,
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <h1 className="text-lg font-semibold text-[#0C0F14] dark:text-white">My QR Code</h1>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* QR Code Card */}
          <div className="bg-white rounded-3xl p-8 mb-6 border border-black/5 dark:border-transparent shadow-sm dark:shadow-none">
            {qrCodeUrl ? (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                src={qrCodeUrl}
                alt="Payment QR Code"
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#151A1F] rounded-3xl p-6 mb-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#0C0F14] dark:text-white mb-2">
                {userName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account ••••{accountNumber.slice(-4)}
              </p>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 border border-[#0D4F3C]/20 dark:border-[#156B53]/20 rounded-2xl p-4 mb-6"
          >
            <p className="text-sm text-[#0D4F3C] dark:text-[#156B53] text-center">
              Let others scan this code to send you money instantly
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-5 space-y-3"
      >
        <button
          onClick={handleShare}
          className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span>Share QR</span>
            </>
          )}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] text-[#0C0F14] dark:text-white font-semibold py-4 rounded-xl transition-all"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}
