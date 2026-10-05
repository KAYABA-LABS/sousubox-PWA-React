"use client";

import { motion } from "framer-motion";
import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { api, getApiUserId, type FundingSource, type FundingSourceNetwork, type MomoChargeResult, type MomoChargeStatus } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { getNetworkLabel, maskLast4, extractLast4 } from "@/lib/momo";
import { useUserService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const methodData: Record<string, {
  name: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}> = {
  momo: { name: "Mobile Money", icon: CreditCard },
  bank: { name: "Bank transfer", icon: Landmark },
  card: { name: "Debit card", icon: CreditCard },
  manual: { name: "Manual deposit", icon: FileText },
};

const paymentProviderByNetwork: Record<FundingSourceNetwork, "mtn" | "vod" | "atl"> = {
  MTN: "mtn",
  TELECEL: "vod",
  AIRTELTIGO: "atl",
};

const MOMO_POLL_INTERVAL_MS = 5000;
const MOMO_POLL_TIMEOUT_MS = 2 * 60 * 1000;
const MOMO_STILL_PROCESSING_TEXT = "Still processing — your balance will update once the payment completes.";

const accountDetails = {
  accountName: "Vaulta Mobile Banking",
  accountNumber: "1234567890",
  routingNumber: "021000021",
  bankName: "First National Bank",
};

function DepositAmountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const userService = useUserService();
  const databaseUserId = getApiUserId(userId);

  const methodId = searchParams.get("method") || "bank";
  const method = methodData[methodId] || methodData.bank;
  const Icon = method.icon;
  const isMomo = methodId === "momo";

  const [step, setStep] = useState<"amount" | "instructions">("amount");
  const [amount, setAmount] = useState("");
  const [fundingSource, setFundingSource] = useState<FundingSource | null>(null);
  const [isLoadingFundingSource, setIsLoadingFundingSource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [referenceCode] = useState(() => `DEP${Date.now().toString().slice(-8)}`);
  const [momoPhase, setMomoPhase] = useState<"idle" | "otp" | "waiting">("idle");
  const [chargeReference, setChargeReference] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [waitingText, setWaitingText] = useState("");
  const pollInFlight = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) router.push("/signin");
  }, [isLoaded, userId, router]);

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? (parseInt(numericValue, 10) / 100).toFixed(2) : "";
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 8) setAmount(numericValue);
  };

  const displayAmount = amount ? formatAmount(amount) : "0.00";
  const numericAmount = parseFloat(displayAmount);
  const canContinue = numericAmount > 0;
  const meetsMinimum = numericAmount >= 350;

  const handleContinue = async () => {
    if (!canContinue) return;
    setErrorMessage(null);

    if (isMomo) {
      setIsLoadingFundingSource(true);
      try {
        const sources = await userService.getFundingSources(databaseUserId || "");
        const activeSource = sources.find((source) => source.active);
        if (!activeSource) {
          throw new Error("No active mobile money account was found. Please link an account first.");
        }
        setFundingSource(activeSource);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load your mobile money account.");
        return;
      } finally {
        setIsLoadingFundingSource(false);
      }
    }

    setStep("instructions");
  };

  const handleCopy = async (field: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCompleteBankDeposit = () => {
    router.push(`/deposit/status?data=${encodeURIComponent(JSON.stringify({
      method: methodId,
      methodName: method.name,
      amount: displayAmount,
      referenceCode,
    }))}&force_blocked=1`);
  };

  const goToStatus = (status: MomoChargeStatus, displayText: string, reference: string) => {
    if (!fundingSource) return;
    router.push(`/deposit/status?data=${encodeURIComponent(JSON.stringify({
      method: methodId,
      methodName: method.name,
      amount: displayAmount,
      referenceCode: reference,
      status,
      displayText,
      phone: fundingSource.phoneNumber,
      providerName: getNetworkLabel(fundingSource.networkId),
    }))}`);
  };

  const handleChargeResult = (result: Pick<MomoChargeResult, "reference" | "status" | "display_text" | "message">) => {
    const text = result.display_text || result.message || "";
    switch (result.status) {
      case "send_otp":
        setOtp("");
        setMomoPhase("otp");
        break;
      case "pay_offline":
      case "pending":
        setWaitingText(text);
        setMomoPhase("waiting");
        break;
      case "success":
        goToStatus("success", text || "Payment received.", result.reference);
        break;
      case "failed":
        goToStatus("failed", text || "The payment could not be completed.", result.reference);
        break;
      default:
        setErrorMessage("Unexpected payment status. Please try again.");
    }
  };

  const resetMomoCharge = () => {
    setMomoPhase("idle");
    setChargeReference(null);
    setOtp("");
    setWaitingText("");
  };

  const handleMomoPayment = async () => {
    if (!fundingSource) {
      setErrorMessage("No active mobile money account was found.");
      return;
    }
    if (!databaseUserId) {
      setErrorMessage("We couldn't identify your account. Please sign in again.");
      return;
    }

    // A retry always starts a new charge; never reuse an old reference
    resetMomoCharge();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "user@sousubox.com";
      const response = await api.mobileMoneyPayment({
        amount: numericAmount,
        email,
        mobile_money: {
          phone: fundingSource.phoneNumber,
          provider: paymentProviderByNetwork[fundingSource.networkId],
        },
        currency: "GHS",
        metadata: { userId: databaseUserId, referenceCode, networkId: fundingSource.networkId },
      });

      if (!response.success || !response.data?.reference) {
        throw new Error(response.message || "Failed to initiate payment.");
      }

      setChargeReference(response.data.reference);
      handleChargeResult(response.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (!chargeReference || !databaseUserId || otp.length !== 6) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await api.submitMomoOtp({ otp, reference: chargeReference, userId: databaseUserId });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to verify OTP.");
      }
      handleChargeResult({ ...response.data, reference: response.data.reference || chargeReference });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to verify OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPollResult = useEffectEvent(handleChargeResult);
  const onPollTimeout = useEffectEvent((reference: string) => {
    goToStatus("pending", MOMO_STILL_PROCESSING_TEXT, reference);
  });

  // Single poller: only runs while waiting, torn down on phase change and unmount
  useEffect(() => {
    if (momoPhase !== "waiting" || !chargeReference || !databaseUserId) return;

    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (pollInFlight.current) return;
      pollInFlight.current = true;
      try {
        const response = await api.getMomoChargeStatus(chargeReference, databaseUserId);
        if (cancelled || !response.success || !response.data) return;
        const { status } = response.data;
        // Still waiting on the customer; keep polling
        if (status === "pending" || status === "pay_offline") return;
        cancelled = true;
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        onPollResult({ ...response.data, reference: response.data.reference || chargeReference });
      } catch (error) {
        console.error("Failed to poll mobile money charge status:", error);
      } finally {
        pollInFlight.current = false;
      }
    }, MOMO_POLL_INTERVAL_MS);

    const timeout = window.setTimeout(() => {
      cancelled = true;
      window.clearInterval(interval);
      onPollTimeout(chargeReference);
    }, MOMO_POLL_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [momoPhase, chargeReference, databaseUserId]);

  const handleBack = () => {
    if (step === "instructions") {
      resetMomoCharge();
      setErrorMessage(null);
      setStep("amount");
      return;
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Deposit</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === "amount" ? "Enter amount" : "Instructions"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0D4F3C]/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#0D4F3C] dark:text-[#156B53]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deposit method</p>
              </div>
            </CardContent>
          </Card>

          {step === "amount" ? (
            <>
              <div className="py-8">
                <div className="text-center">
                  <div className="flex items-start justify-center gap-2">
                    <span className="text-4xl font-light text-gray-500 mt-2">₵</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={displayAmount}
                      onChange={(event) => handleAmountChange(event.target.value)}
                      className="text-6xl font-bold bg-transparent border-none outline-none text-center w-auto min-w-50"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-center mt-6">
                  {[20, 50, 100, 250, 500].map((quickAmount) => (
                    <button key={quickAmount} onClick={() => setAmount((quickAmount * 100).toString())} className="px-4 py-2 bg-white dark:bg-[#151A1F] hover:bg-gray-50 dark:hover:bg-[#1A1F25] text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                      ₵ {quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {!meetsMinimum && numericAmount > 0 && (
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertTitle>Minimum deposit required</AlertTitle>
                  <AlertDescription>A minimum deposit of GH₵ 350.00 is required to unlock withdrawals.</AlertDescription>
                </Alert>
              )}

              {meetsMinimum && (
                <Alert className="bg-[#0D4F3C]/10 border-[#0D4F3C]/20">
                  <Check className="w-4 h-4" />
                  <AlertDescription>This deposit will unlock withdrawal functionality.</AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertTitle>Payment account error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleContinue} disabled={!canContinue || isLoadingFundingSource} className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl">
                {isLoadingFundingSource ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading payment account...</> : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
                <CardHeader className="text-center">
                  <CardDescription>Deposit amount</CardDescription>
                  <CardTitle className="text-4xl">GH₵ {numericAmount.toFixed(2)}</CardTitle>
                </CardHeader>
              </Card>

              {errorMessage && (
                <Alert variant="destructive">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertTitle>Payment error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {isMomo ? (
                <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" />Payment account</CardTitle>
                    <CardDescription>Your active mobile money account will be charged.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fundingSource && (
                      <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{getNetworkLabel(fundingSource.networkId)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{maskLast4(extractLast4(fundingSource.phoneNumber))}</p>
                        </div>
                      </div>
                    )}
                    {momoPhase === "idle" && (
                      <Button onClick={handleMomoPayment} disabled={isSubmitting || !fundingSource} className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Initiating secure charge...</> : "Authorize payment"}
                      </Button>
                    )}

                    {momoPhase === "otp" && (
                      <motion.form
                        key="momo-otp"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSubmitOtp();
                        }}
                      >
                        <div className="space-y-2">
                          <label htmlFor="momo-otp" className="text-sm font-medium">Enter the OTP sent to your phone</label>
                          <input
                            id="momo-otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            autoFocus
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53]"
                            placeholder="••••••"
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting || otp.length !== 6} className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl">
                          {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Confirm"}
                        </Button>
                      </motion.form>
                    )}

                    {momoPhase === "waiting" && (
                      <motion.div
                        key="momo-waiting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-[#0D4F3C]/20 bg-[#0D4F3C]/5 dark:bg-[#156B53]/10 p-5 flex items-start gap-3"
                        role="status"
                        aria-live="polite"
                      >
                        <Loader2 className="w-5 h-5 mt-0.5 shrink-0 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
                        <div className="space-y-1">
                          <p className="font-medium">Approve the prompt on your phone</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {waitingText || "We've sent a payment request to your mobile money wallet. Approve it to complete your deposit."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
                    <CardContent className="p-5 space-y-3">
                      <h2 className="font-semibold">Copy memo / reference code</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Include this code in your bank transfer description.</p>
                      <Button variant="outline" onClick={() => handleCopy("reference", referenceCode)} className="w-full justify-between font-mono">
                        {referenceCode}
                        {copiedField === "reference" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-[#151A1F] border-black/5 dark:border-white/5">
                    <CardContent className="p-5 space-y-3">
                      <h2 className="font-semibold">Transfer to the settlement account</h2>
                      {Object.entries(accountDetails).map(([key, value]) => (
                        <button key={key} onClick={() => handleCopy(key, value)} className="w-full rounded-xl bg-black/5 dark:bg-white/5 p-4 flex items-center justify-between text-left">
                          <div>
                            <p className="text-xs uppercase text-gray-500">{key}</p>
                            <p className="font-medium mt-1">{value}</p>
                          </div>
                          {copiedField === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                      ))}
                      <Button onClick={handleCompleteBankDeposit} className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl">I&apos;ve completed the deposit</Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function DepositAmountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C]" /></div>}>
      <DepositAmountContent />
    </Suspense>
  );
}
