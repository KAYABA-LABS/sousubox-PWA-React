"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useUserService } from "@/services/userService";
import { type FundingSourceNetwork } from "@/lib/api";
import { MOMO_PROVIDERS, GHANA_PHONE_REGEX, GHANA_PHONE_ERROR } from "@/lib/momo";

export default function AddMobileMoneyAccount() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const userService = useUserService();

  const [network, setNetwork] = useState<FundingSourceNetwork | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
    }
  }, [isLoaded, userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!network) {
      setErrorMessage("Please select your mobile money provider");
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!GHANA_PHONE_REGEX.test(cleanPhone)) {
      setErrorMessage(GHANA_PHONE_ERROR);
      return;
    }

    setIsConnecting(true);
    try {
      await userService.addFundingSource(userId || "", {
        networkId: network,
        phoneNumber: cleanPhone,
      });
      router.push("/settings/linked-accounts");
    } catch (err) {
      console.error("Failed to add funding source:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to add mobile money number");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings/linked-accounts")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Linked Accounts</span>
        </button>

        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-2">Add Mobile Money Number</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Link a mobile money number to send and receive payments
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0C0F14] dark:text-white">
                Number Details
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                Select your network and enter the phone number linked to it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertTitle className="text-sm font-semibold">Validation Error</AlertTitle>
                  <AlertDescription className="text-xs leading-relaxed mt-1">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="network" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Network Provider
                </Label>
                <Select onValueChange={(v) => setNetwork(v as FundingSourceNetwork)} value={network}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-[#0C0F14] border-black/10 dark:border-white/10 focus:border-[#0D4F3C] dark:focus:border-[#156B53] text-[#0C0F14] dark:text-white rounded-xl py-6">
                    <SelectValue placeholder="Select network provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white">
                    {MOMO_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Mobile Money Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="e.g. 0241234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-50 dark:bg-[#0C0F14] border-black/10 dark:border-white/10 focus-visible:ring-[#0D4F3C] dark:focus-visible:ring-[#156B53] pl-11 py-6 text-[#0C0F14] dark:text-white rounded-xl text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button
                type="submit"
                disabled={isConnecting || !phoneNumber || !network}
                className="w-full bg-[#0D4F3C] text-white font-medium py-3 rounded-xl hover:bg-[#156B53] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                    Adding number...
                  </>
                ) : (
                  "Add Mobile Money Number"
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This number is added as a backup. Set it as your primary from Linked Accounts anytime.
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
