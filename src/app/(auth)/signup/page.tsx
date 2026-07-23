"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSignUp } from "@clerk/nextjs/legacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCodeSwitcher } from "@/components/ui/phone-code-switcher";
import { ArrowLeft, Loader2, ArrowRight, Check, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function SignUpPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"phone" | "verify" | "details">("phone");
  const [countryCode, setCountryCode] = useState("+233");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      await signUp.create({ phoneNumber: formattedPhone });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      setStep("verify");
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
      const result = await signUp.attemptPhoneNumberVerification({ code: fullCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "missing_requirements") {
        setStep("details");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    }
    setIsLoading(false);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError("");
    try {
      await signUp.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete profile");
    }
    setIsLoading(false);
  };

  const stepNum = step === "phone" ? 1 : step === "verify" ? 2 : 3;

  const stepIcons: Record<string, React.ReactNode> = {
    phone: <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 21 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3.75m3 0v1.5m3-1.5h3a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-10.5a2.25 2.25 0 0 1 2.25-2.25h3m3-1.5h3" /></svg>,
    verify: <Shield className="w-6 h-6 text-emerald-600" />,
    details: <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) refs.current[index - 1]?.focus();
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex flex-col`}>
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className={`font-bold text-base ${theme.text.primary}`}>SousuChain</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              {stepIcons[step]}
            </div>
          </div>

          <h1 className={`text-2xl font-bold ${theme.text.primary} mb-1`}>
            {step === "phone" && "Create your account"}
            {step === "verify" && "Verify it's you"}
            {step === "details" && "Almost there"}
          </h1>
          <p className={`text-sm ${theme.text.secondary} mb-8`}>
            {step === "phone" && "Start saving with just your phone number"}
            {step === "verify" && `Enter the 6-digit code sent to ${phoneNumber}`}
            {step === "details" && "How should we call you?"}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                stepNum > i ? "bg-emerald-600" : stepNum === i + 1 ? "bg-emerald-600" : "bg-gray-200"
              }`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.form key="phone" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} onSubmit={handleSendOTP} className="space-y-4">
                <div className="flex gap-2">
                  <PhoneCodeSwitcher value={countryCode} onChange={setCountryCode} />
                  <Input type="tel" placeholder="024 123 4567" value={phoneNumber} onChange={(e) => setPhoneNumber(formatPhone(e.target.value))} autoFocus
                    className={`flex-1 h-14 px-4 ${theme.input.bg} border-2 border-gray-200 rounded-xl ${theme.input.text} placeholder:text-gray-400 focus:border-emerald-600 focus:ring-0`} />
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 text-center">{error}</motion.p>}
                <Button type="submit" disabled={!phoneNumber.trim() || isLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center justify-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>}
                </Button>
              </motion.form>
            )}

            {step === "verify" && (
              <motion.form key="verify" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} onSubmit={handleVerifyCode} className="space-y-4">
                <div className="flex gap-2.5 justify-center">
                  {code.map((digit, i) => (
                    <input key={i} ref={(el) => { (refs as { current: (HTMLInputElement | null)[] }).current[i] = el; if (i === 0 && el) el.focus(); }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => { if (!/^\d*$/.test(e.target.value)) return; const n = [...code]; n[i] = e.target.value.slice(-1); setCode(n); setError(""); if (e.target.value && i < 5) (refs as { current: (HTMLInputElement | null)[] }).current[i + 1]?.focus(); }}
                      onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) (refs as { current: (HTMLInputElement | null)[] }).current[i - 1]?.focus(); }}
                      className={`w-11 h-14 text-center text-xl font-bold ${theme.input.bg} border border-gray-200 rounded-xl ${theme.input.text} focus:border-emerald-500 focus:ring-0`} />
                  ))}
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 text-center">{error}</motion.p>}
                <Button type="submit" disabled={code.join("").length < 6 || isLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                </Button>
                <button type="button" onClick={() => { setStep("phone"); setCode(["", "", "", "", "", ""]); setError(""); }} className="w-full text-center text-sm text-gray-400 hover:text-emerald-600 transition-colors">
                  Use a different number
                </button>
              </motion.form>
            )}

            {step === "details" && (
              <motion.form key="details" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} onSubmit={handleCompleteProfile} className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-emerald-700">{phoneNumber} verified</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <Input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus
                      className={`h-12 px-4 ${theme.input.bg} border border-gray-200 rounded-xl ${theme.input.text} placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0`} />
                  </div>
                  <div>
                    <Input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                      className={`h-12 px-4 ${theme.input.bg} border border-gray-200 rounded-xl ${theme.input.text} placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0`} />
                  </div>
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 text-center">{error}</motion.p>}
                <Button type="submit" disabled={!firstName.trim() || isLoading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Started"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="px-6 py-5">
        <div className="text-center">
          <p className={`text-sm ${theme.text.secondary}`}>
            Already have an account?{" "}
            <Link href="/signin" className="text-emerald-600 font-semibold hover:underline">
              Sign in
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

const refs = { current: [] as (HTMLInputElement | null)[] } as { current: (HTMLInputElement | null)[] };
