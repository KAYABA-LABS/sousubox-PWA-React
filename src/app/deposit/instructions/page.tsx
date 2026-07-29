"use client";

import { motion } from "framer-motion";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle2, Loader2, CreditCard, Landmark, Phone, ShieldAlert, Sparkles, Check } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

interface DepositData {
  method: string;
  methodName: string;
  amount: string;
}

const PROVIDERS = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "vodafone", label: "Telecel / Vodafone Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
];

function DepositInstructionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [referenceCode] = useState(
    () => `DEP${Date.now().toString().slice(-8)}`
  );

  const depositData = useMemo(() => {
    const dataParam = searchParams.get("data");
    return dataParam ? (JSON.parse(dataParam) as DepositData) : null;
  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [userId, isLoaded, router]);

  const accountDetails = {
    accountName: "Vaulta Mobile Banking",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    bankName: "First National Bank",
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleComplete = () => {
    // Force blocked status when completing bank deposit (as in original demo/testing)
    router.push(
      `/deposit/status?data=${encodeURIComponent(
        JSON.stringify({ ...depositData, referenceCode })
      )}&force_blocked=1`
    );
  };

  const handleMomoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositData) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    // Basic Ghana mobile number validation: format starting with 0 or +233, total length check
    const cleanPhone = phoneNumber.trim();
    const phoneRegex = /^(?:0|\+233)[235]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage("Please enter a valid Ghana mobile number (e.g., 0241234567 or +233241234567)");
      setIsSubmitting(false);
      return;
    }

    if (!provider) {
      setErrorMessage("Please select your mobile money provider");
      setIsSubmitting(false);
      return;
    }

    try {
      const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress || "user@susuchain.com";
      const floatAmount = parseFloat(depositData.amount);

      const response = await api.mobileMoneyPayment({
        amount: floatAmount,
        email,
        mobile_money: {
          phone: cleanPhone,
          provider,
        },
        currency: "GHS",
        metadata: {
          userId,
          referenceCode,
        },
      });

      if (response.success && response.data) {
        const result = response.data;
        const statusData = {
          ...depositData,
          referenceCode: result.reference || referenceCode,
          status: result.status || "pending",
          displayText: result.display_text || result.message || "Payment initiated successfully.",
          phone: cleanPhone,
          providerName: PROVIDERS.find((p) => p.value === provider)?.label || provider,
        };

        router.push(
          `/deposit/status?data=${encodeURIComponent(
            JSON.stringify(statusData)
          )}`
        );
      } else {
        setErrorMessage(response.message || "Failed to initiate payment. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!depositData) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isMomo = depositData.method === "momo";

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header role="banner" className="bg-[#0C0F14]/80 backdrop-blur-md sticky top-0 z-50 px-5 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {isMomo ? "Mobile Money Payment" : "Instructions"}
            </h1>
            <p className="text-xs text-gray-400">
              {isMomo ? "Provide payment details" : "Follow the steps below"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start px-5 py-8 max-w-2xl mx-auto w-full z-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 w-full"
        >
          {/* Summary Card */}
          <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="text-center pb-4">
              <CardDescription className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Deposit Amount
              </CardDescription>
              <CardTitle className="text-4xl font-bold mt-1 text-white tracking-tight">
                GH₵ {parseFloat(depositData.amount).toFixed(2)}
              </CardTitle>
              <div className="mt-2 flex justify-center">
                <Badge variant="outline" className="text-xs border-white/10 bg-white/5 text-gray-300 rounded-md">
                  {depositData.methodName}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {isMomo ? (
            /* Mobile Money Payment form */
            <form onSubmit={handleMomoSubmit} className="space-y-6">
              <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Enter Wallet Details
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    Your wallet will be billed instantly via Paystack. Please ensure you have sufficient balance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errorMessage && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                      <ShieldAlert className="w-4 h-4" />
                      <AlertTitle className="text-sm font-semibold">Verification Error</AlertTitle>
                      <AlertDescription className="text-xs leading-relaxed mt-1">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Provider Select */}
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="text-xs font-semibold text-gray-300">
                      Provider
                    </Label>
                    <Select onValueChange={setProvider} value={provider}>
                      <SelectTrigger className="w-full bg-[#151A1F]/50 border-white/10 focus:border-emerald-500 text-white rounded-xl py-6">
                        <SelectValue placeholder="Select network provider" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#151A1F] border-white/10 text-white">
                        {PROVIDERS.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="hover:bg-white/5 focus:bg-white/5">
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold text-gray-300">
                      Mobile Money Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="text"
                        placeholder="e.g. 0241234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-[#151A1F]/50 border-white/10 focus:border-emerald-500 pl-11 py-6 text-white rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !phoneNumber || !provider}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initiating Secure Charge...
                      </div>
                    ) : (
                      "Authorize Payment"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          ) : (
            /* Bank transfer / Manual deposit instruction steps */
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pl-1">
                Bank Transfer Steps
              </h2>

              {/* Step 1 */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm">Copy Memo / Reference Code</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        You must include this code in your bank transfer description to map the funds to your account.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCopy("reference", referenceCode)}
                      variant="outline"
                      className="w-full bg-[#0C0F14] border-white/10 hover:bg-white/5 hover:text-white rounded-xl py-6 flex items-center justify-between font-mono"
                    >
                      <span>{referenceCode}</span>
                      {copiedField === "reference" ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                    2
                  </div>
                  <div className="flex-grow space-y-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm">Transfer to the Vaulta Settlement Account</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Send the exact amount via bank deposit/wire using these destination details:
                      </p>
                    </div>

                    <div className="grid gap-2 text-xs">
                      {/* Bank Details Rows */}
                      <button
                        onClick={() => handleCopy("bankName", accountDetails.bankName)}
                        className="w-full bg-[#0C0F14] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 font-medium uppercase">Bank Name</p>
                          <p className="text-white font-medium mt-0.5">{accountDetails.bankName}</p>
                        </div>
                        {copiedField === "bankName" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy("accountName", accountDetails.accountName)}
                        className="w-full bg-[#0C0F14] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 font-medium uppercase">Account Name</p>
                          <p className="text-white font-medium mt-0.5">{accountDetails.accountName}</p>
                        </div>
                        {copiedField === "accountName" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy("accountNumber", accountDetails.accountNumber)}
                        className="w-full bg-[#0C0F14] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 font-medium uppercase">Account Number</p>
                          <p className="text-white font-mono font-medium mt-0.5">{accountDetails.accountNumber}</p>
                        </div>
                        {copiedField === "accountNumber" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy("routingNumber", accountDetails.routingNumber)}
                        className="w-full bg-[#0C0C0F] border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 font-medium uppercase">Routing / Sort Code</p>
                          <p className="text-white font-mono font-medium mt-0.5">{accountDetails.routingNumber}</p>
                        </div>
                        {copiedField === "routingNumber" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">Wait for Confirmation</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Bank transfers generally settle within 2-3 business days. We will notify you instantly via email/SMS once credited to your Susu account.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="pt-4">
                <Button
                  onClick={handleComplete}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10"
                >
                  I&apos;ve completed the deposit
                </Button>
              </div>
            </div>
          )}

          {/* Important Notice Footer */}
          <Alert className="bg-amber-500/[0.02] border-amber-500/20 text-amber-300 rounded-2xl p-5 mt-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <AlertTitle className="text-sm font-semibold flex items-center gap-1.5">Important Security Warning</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-1 text-amber-300/80">
              {isMomo
                ? "Do not close the application or lock your device while payment authorization is in progress. A mobile network prompt will appear on your phone asking you to enter your momo PIN."
                : "Double-check the destination details and reference code before confirming the bank wire. If reference is missing, reconciliation may take up to 7 business days."}
            </AlertDescription>
          </Alert>
        </motion.div>
      </main>
    </div>
  );
}

export default function DepositInstructionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <DepositInstructionsContent />
    </Suspense>
  );
}
