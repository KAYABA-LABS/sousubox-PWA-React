"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ShieldAlert, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
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
  const { user } = useUser();
  const databaseUserId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const userService = useUserService();

  const [network, setNetwork] = useState<FundingSourceNetwork | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!databaseUserId && !isDevMode()) {
      router.push("/signin");
    }
  }, [isLoaded, databaseUserId, router]);

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
      await userService.addFundingSource(databaseUserId || "", {
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
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings/linked-accounts")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Linked Accounts</span>
        </button>

        <h1 className="text-2xl font-bold text-sb-ink mb-2">Add Mobile Money Number</h1>
        <p className="text-sb-ink-2 mb-6">
          Link a mobile money number to send and receive payments
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="bg-sb-surface border-sb-line">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-sb-ink">
                Number Details
              </CardTitle>
              <CardDescription className="text-xs text-sb-ink-2">
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
                <Label htmlFor="network" className="text-xs font-semibold text-sb-ink-2">
                  Network Provider
                </Label>
                <Select onValueChange={(v) => setNetwork(v as FundingSourceNetwork)} value={network}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-sb-canvas border-sb-line focus:border-sb-brand-600 text-sb-ink rounded-xl py-6">
                    <SelectValue placeholder="Select network provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-sb-surface border-sb-line text-sb-ink">
                    {MOMO_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/5 dark:focus:bg-white/5">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-sb-ink-2">
                  Mobile Money Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-ink-2" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="e.g. 0241234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-50 dark:bg-sb-canvas border-sb-line focus-visible:ring-sb-brand-600 pl-11 py-6 text-sb-ink rounded-xl text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button
                type="submit"
                disabled={isConnecting || !phoneNumber || !network}
                className="w-full bg-sb-brand-800 text-white font-medium py-3 rounded-xl hover:bg-sb-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <p className="text-xs text-sb-ink-2 text-center">
                This number is added as a backup. Set it as your primary from Linked Accounts anytime.
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
