"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenOnboarding = localStorage.getItem("sousuchain_onboarded");
      if (hasSeenOnboarding) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 rounded-3xl bg-[#0D4F3C] flex items-center justify-center mb-6"
      >
        <span className="text-white text-4xl font-extrabold">S</span>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-extrabold text-[#0C0F14] dark:text-white tracking-tight"
      >
        SousuChain
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-gray-500 dark:text-gray-400 mt-2"
      >
        Save together. Grow together.
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12"
      >
        <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
