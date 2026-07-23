"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn } from "@clerk/nextjs/legacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCodeSwitcher } from "@/components/ui/phone-code-switcher";
import { ArrowLeft, Loader2, ArrowRight, Check, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function SignInPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [countryCode, setCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      refs.current[index + 1]?.focus();
    }
    if (newCode.every((d) => d) && newCode.join("").length === 6) {
      setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent), 100);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex flex-col`}>
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-base ${theme.text.primary}`}>SousuChain</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Icon */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 21 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3.75m3 0v1.5m3-1.5h3a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-10.5a2.25 2.25 0 0 1 2.25-2.25h3m3-1.5h3" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${theme.text.primary} mb-1`}>
            {step === "phone" ? "Welcome back" : "Verify it's you"}
          </h1>
          <p className={`text-sm ${theme.text.secondary} mb-8`}>
            {step === "phone"
              ? "Enter your phone number to continue"
              : `Enter the 6-digit code sent to ${phoneNumber}`}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-8">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                  (step === "verify" && i <= 1) || (step === "phone" && i === 0)
                    ? "bg-emerald-600"
                    : "bg-gray-200"
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
                    className={`flex-1 h-14 px-4 ${theme.input.bg} border border-gray-200 rounded-xl ${theme.input.text} placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0`}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-500 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={!phoneNumber.trim() || isLoading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
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
                {/* OTP */}
                <div className="flex gap-2.5 justify-center">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { refs.current[i] = el; if (i === 0 && el) el.focus(); }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className={`w-11 h-14 text-center text-xl font-bold ${theme.input.bg} border border-gray-200 rounded-xl ${theme.input.text} focus:border-emerald-500 focus:ring-0 transition-colors`}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-500 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={code.join("").length < 6 || isLoading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("phone"); setCode(["", "", "", "", "", ""]); setError(""); }}
                  className={`w-full text-center text-sm ${theme.text.secondary} hover:text-emerald-600 transition-colors`}
                >
                  Use a different number
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5">
        <div className="text-center">
          <p className={`text-sm ${theme.text.secondary}`}>
            New to SousuChain?{" "}
            <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-gray-400">
          <Shield className="w-3 h-3" />
          <span>Encrypted in transit</span>
        </div>
      </footer>
    </div>
  );
}

const refs = { current: [] as (HTMLInputElement | null)[] };
