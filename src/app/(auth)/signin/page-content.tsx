"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn } from "@clerk/nextjs";
import { PhoneCodeSwitcher } from "@/components/ui/phone-code-switcher";
import { api } from "@/lib/api";
import { Loader2, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function SignInPageContent() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const isClerkLoaded = fetchStatus === "idle";
  const [countryCode, setCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    if (step !== "verify") return;
    requestAnimationFrame(() => {
      const firstEmpty = code.findIndex((digit) => !digit);
      inputRefs.current[firstEmpty === -1 ? code.length - 1 : firstEmpty]?.focus();
    });
  }, [step]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const loginBackendUser = async () => {
    const rawPhone = phoneNumber.replace(/\s/g, "");
    const localPhone = rawPhone.replace(/^0+/, "");

    const formattedPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${countryCode}${localPhone}`;

    const result = await api.loginUser(formattedPhone);

    console.log("Backend login result:", result);

    if (!result.success) {
      throw new Error(result.message || result.error || "Could not log you in");
    }

    return result.user?.id || null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isClerkLoaded || !signIn || !phoneNumber.trim()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const rawPhone = phoneNumber.replace(/\s/g, "");
      const localPhone = rawPhone.replace(/^0+/, "");

      const formattedPhone = rawPhone.startsWith("+")
        ? rawPhone
        : `${countryCode}${localPhone}`;

      console.log("Creating Clerk signin:", formattedPhone);

      const result = await signIn.create({
        identifier: formattedPhone,
      });

      if (result.error) {
        throw result.error;
      }

      console.log("Sign-in created successfully");

      const codeResult = await signIn.phoneCode.sendCode();

      if (codeResult.error) {
        throw codeResult.error;
      }

      console.log("OTP sent successfully");

      setStep("verify");

      setCode(["", "", "", "", "", ""]);
      autoSubmitRef.current = false;
    } catch (err: unknown) {
      console.error("SEND OTP ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send verification code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (
    e: React.FormEvent,
    submittedCode?: string
  ) => {
    e.preventDefault();

    const fullCode = submittedCode ?? code.join("");

    if (
      !isClerkLoaded ||
      !signIn ||
      fullCode.length !== 6 ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Verifying phone code...");

      const verification = await signIn.phoneCode.verifyCode({
        code: fullCode,
      });

      if (verification.error) {
        throw verification.error;
      }

      console.log("Phone verification successful");

      await loginBackendUser();

      const finalized = await signIn.finalize();

      if (finalized.error) {
        throw finalized.error;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("VERIFY OTP ERROR:", err);

      autoSubmitRef.current = false;

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid verification code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    const digits = value.slice(0, code.length - index);
    digits.split("").forEach((digit, offset) => {
      newCode[index + offset] = digit;
    });
    setCode(newCode);
    setError("");
    if (digits) {
      const nextEmpty = newCode.findIndex((digit, i) => i > index && !digit);
      inputRefs.current[nextEmpty === -1 ? Math.min(index + digits.length, 5) : nextEmpty]?.focus();
    }
    if (
      newCode.every(Boolean) &&
      newCode.join("").length === 6 &&
      !autoSubmitRef.current &&
      !isLoading
    ) {
      autoSubmitRef.current = true;
      setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent, newCode.join("")), 0);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.join("").length === 6 && !isLoading) {
      handleVerifyCode(e as unknown as React.FormEvent);
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    setError("");
    const nextEmpty = newCode.findIndex((d) => !d);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
    if (
      newCode.every((d) => d) &&
      newCode.join("").length === 6 &&
      !autoSubmitRef.current &&
      !isLoading
    ) {
      autoSubmitRef.current = true;
      setTimeout(() => handleVerifyCode({ preventDefault: () => {} } as React.FormEvent, newCode.join("")), 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] flex flex-col font-sans">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </div>
          <span className="font-bold text-lg text-emerald-950 tracking-tight">SusuChain</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_2px_8px_rgba(20,60,40,0.06),0_16px_40px_rgba(20,60,40,0.08)] border border-emerald-950/[0.04]">
            {/* Header */}
            <div className="mb-8">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                {step === "phone" ? (
                  <PhoneCall className="w-5 h-5 text-amber-700" strokeWidth={2} />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-amber-700" strokeWidth={2} />
                )}
              </div>
              <h1 className="text-[26px] leading-tight font-bold text-emerald-950 tracking-tight">
                {step === "phone" ? "Welcome back" : "Check your phone"}
              </h1>
              <p className="text-[15px] text-emerald-950/55 mt-2 leading-relaxed">
                {step === "phone"
                  ? "Sign in with the phone number on your account."
                  : `We sent a 6-digit code to ${phoneNumber}`}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendOTP}
                  className="space-y-5"
                >
                  <div className="flex gap-2">
                    <PhoneCodeSwitcher value={countryCode} onChange={setCountryCode} />
                    <input
                      type="tel"
                      placeholder="055 555 5555"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                      autoFocus
                      className="flex-1 h-14 px-4 bg-[#FBF6EF] border border-emerald-950/10 rounded-2xl text-emerald-950 placeholder:text-emerald-950/30 text-[15px] font-medium focus:outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
                    />
                  </div>

                  <div id="clerk-captcha" />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!phoneNumber.trim() || isLoading}
                    className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_14px_rgba(4,120,87,0.25)]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-[15px]">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyCode}
                  className="space-y-6"
                >
                  {/* OTP Input Boxes */}
                  <div className="flex gap-2.5 justify-center">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        onPaste={handleCodePaste}
                        autoComplete="one-time-code"
                        className="w-12 h-14 text-center text-xl font-bold text-emerald-950 bg-[#FBF6EF] border-2 border-emerald-950/10 rounded-2xl focus:outline-none focus:border-emerald-700 transition-colors"
                      />
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={code.join("").length < 6 || isLoading}
                      className="w-full h-14 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all disabled:opacity-40 disabled:active:scale-100 shadow-[0_4px_14px_rgba(4,120,87,0.25)]"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign in"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setCode(["", "", "", "", "", ""]);
                        setError("");
                      }}
                      className="w-full text-center text-sm font-medium text-emerald-950/50 hover:text-emerald-700 transition-colors py-1"
                    >
                      Use a different number
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-sm text-emerald-950/55 mt-6">
            New to SusuChain?{" "}
            <Link href="/signup" className="text-emerald-700 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
