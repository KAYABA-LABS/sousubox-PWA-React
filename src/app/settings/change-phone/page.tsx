"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft, Loader2, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ChangePhonePage() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentPhone = user?.phoneNumbers?.[0]?.phoneNumber || "Not set";

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError("Please enter a phone number");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const phoneNumber = await user?.createPhoneNumber({ phoneNumber: phone });
      await phoneNumber?.prepareVerification();
      setStep("verify");
      toast.success("Verification code sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    }
    setIsSubmitting(false);
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const phoneNumber = user?.phoneNumbers?.[0];
      if (!phoneNumber) throw new Error("No phone number found");
      await phoneNumber.attemptVerification({ code });
      toast.success("Phone number updated");
      router.push("/settings");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
    setIsSubmitting(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      {/* Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Change Phone Number</h1>
        </div>
      </motion.header>

      <div className="flex-1 px-5 space-y-6">
        {/* Current Phone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-white border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Current Phone</p>
                <p className="text-sm font-semibold text-gray-900">{currentPhone}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {step === "phone" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
              <Input
                type="tel"
                placeholder="+233 XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-gray-200 text-gray-900 h-14 rounded-xl focus-visible:ring-[#00E660]/50"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleSendCode}
              disabled={isSubmitting || !phone.trim()}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm text-gray-700">
                Code sent to <span className="text-gray-900 font-medium">{phone}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="bg-white border-gray-200 text-gray-900 h-14 rounded-xl text-center text-lg tracking-widest focus-visible:ring-[#00E660]/50"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleVerify}
              disabled={isSubmitting || code.length < 6}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Update"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              className="w-full text-gray-500"
            >
              Change number
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
