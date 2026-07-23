"use client";

import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountAlreadyExistsProps {
  email: string;
  onSignIn: () => void;
}

export function AccountAlreadyExists({
  email,
  onSignIn,
}: AccountAlreadyExistsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center min-h-screen p-5"
    >
      <div className="w-full max-w-md bg-[#1C1C1E] rounded-3xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#2C2C2E] flex items-center justify-center">
          <UserCheck className="w-8 h-8 text-[#00E660]" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          You already have a Vaulta account
        </h2>

        {/* Body */}
        <p className="text-base text-gray-400 leading-relaxed mb-8">
          An account with{" "}
          <span className="text-white font-medium">{email}</span> already
          exists.
          <br />
          <br />
          Please sign in to continue.
        </p>

        {/* Action Button */}
        <Button
          onClick={onSignIn}
          className="w-full h-12 text-base font-medium bg-[#00E660] hover:bg-[#00E660]/90 text-black rounded-xl transition-colors"
        >
          Sign in
        </Button>
      </div>
    </motion.div>
  );
}
