"use client";

import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
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
import { api, type FundingSource, type FundingSourceNetwork } from "@/lib/api";
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

const paymentProviderByNetwork: Record<FundingSourceNetwork, string> = {
  MTN: "mtn",
  TELECEL: "vodafone",
  AIRTELTIGO: "airteltigo",
};

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
        const sources = await userService.getFundingSources(userId || "");
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

  const handleMomoPayment = async () => {
    if (!fundingSource || !userId) {
      setErrorMessage("No active mobile money account was found.");
      return;
    }

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
        metadata: { userId, referenceCode, networkId: fundingSource.networkId },
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to initiate payment.");
      }

      const result = response.data as {
        reference?: string;
        status?: string;
        display_text?: string;
        message?: string;
      };

      router.push(`/deposit/status?data=${encodeURIComponent(JSON.stringify({
        method: methodId,
        methodName: method.name,
        amount: displayAmount,
        referenceCode: result.reference || referenceCode,
        status: result.status || "pending",
        displayText: result.display_text || result.message || "Payment initiated successfully.",
        phone: fundingSource.phoneNumber,
        providerName: getNetworkLabel(fundingSource.networkId),
      }))}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white flex flex-col">
      <header className="px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => step === "instructions" ? setStep("amount") : router.back()}
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
                    <Button onClick={handleMomoPayment} disabled={isSubmitting || !fundingSource} className="w-full bg-[#0D4F3C] hover:bg-[#156B53] text-white py-6 rounded-xl">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Initiating secure charge...</> : "Authorize payment"}
                    </Button>
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
