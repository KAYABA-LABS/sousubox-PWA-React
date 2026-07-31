"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn } from "@clerk/nextjs/legacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCodeSwitcher } from "@/components/ui/phone-code-switcher";
import { ArrowLeft, Loader2, ArrowRight, Check, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [countryCode, setCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !phoneNumber.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const fullPhone = phoneNumber.replace(/\s/g, "");
      const formattedPhone = fullPhone.startsWith("+") ? fullPhone : `${countryCode}${fullPhone}`;
      const result = await signIn.create({ identifier: formattedPhone });
      const phoneId = result.supportedFirstFactors?.find((f) => f.strategy === "phone_code")?.phoneNumberId;
      if (phoneId) {
        await signIn.prepareFirstFactor({ strategy: "phone_code", phoneNumberId: phoneId });
        setStep("verify");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (!isLoaded || fullCode.length < 6) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({ strategy: "phone_code", code: fullCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
    setIsLoading(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.every((d) => d) && newCode.join("").length === 6) {
      setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent), 100);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-5 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E660] to-[#00B84D] flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="font-black text-base text-white tracking-tight">SusuChain</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-[#161A24]/60 border border-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          {/* Header section inside card */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-[#00E660]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 21 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3.75m3 0v1.5m3-1.5h3a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-10.5a2.25 2.25 0 0 1 2.25-2.25h3m3-1.5h3" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {step === "phone" ? "Welcome back" : "Verify identity"}
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {step === "phone"
                ? "Enter your phone number to sign in securely."
                : `Enter the 6-digit code sent to ${phoneNumber}`}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                  (step === "verify" && i <= 1) || (step === "phone" && i === 0)
                    ? "bg-[#00E660]"
                    : "bg-white/5"
                }`}
              />
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSendOTP}
                className="space-y-4"
              >
                <div className="flex gap-2">
                  <PhoneCodeSwitcher value={countryCode} onChange={setCountryCode} />
                  <Input
                    type="tel"
                    placeholder="024 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                    autoFocus
                    className="flex-1 h-12 px-4 bg-[#0C0F14] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-0"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-400 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={!phoneNumber.trim() || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#00E660] to-[#00B84D] hover:opacity-90 active:scale-95 text-black font-black rounded-xl transition-all disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVerifyCode}
                className="space-y-4"
              >
                {/* OTP Input Boxes */}
                <div className="flex gap-2 justify-between">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                        if (i === 0 && el) el.focus();
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold bg-[#0C0F14] border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-0 transition-colors"
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-400 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={code.join("").length < 6 || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#00E660] to-[#00B84D] hover:opacity-90 active:scale-95 text-black font-black rounded-xl transition-all disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setCode(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="w-full text-center text-xs text-gray-500 hover:text-[#00E660] transition-colors"
                >
                  Use a different number
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 z-10 flex flex-col items-center space-y-4">
        <p className="text-xs text-gray-500">
          New to SusuChain?{" "}
          <Link href="/signup" className="text-[#00E660] font-bold hover:underline">
            Create an account
          </Link>
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <Shield className="w-3.5 h-3.5" />
          <span>Encrypted in transit</span>
        </div>
      </footer>
    </div>
  );
}
