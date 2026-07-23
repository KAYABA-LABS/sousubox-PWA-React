"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountNotFoundProps {
  onClose: () => void;
}

export function AccountNotFound({ onClose }: AccountNotFoundProps) {
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
          <Shield className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          Account not found
        </h2>

        {/* Body */}
        <p className="text-base text-gray-400 leading-relaxed mb-8">
          We&apos;re unable to locate a Vaulta account associated with this
          email address.
          <br />
          <br />
          To use Vaulta, an account must be created for you by an authorized
          onboarding partner.
        </p>

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full h-12 text-base font-medium bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white rounded-xl transition-colors"
        >
          OK, got it
        </Button>
      </div>
    </motion.div>
  );
}
