"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMobileMoneyStore } from "@/stores/useMobileMoneyStore";
import { MOMO_PROVIDERS, GHANA_PHONE_REGEX, GHANA_PHONE_ERROR, extractLast4 } from "@/lib/momo";

export default function AddMobileMoneyAccount() {
  const router = useRouter();
  const addAccount = useMobileMoneyStore((s) => s.addAccount);

  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      addAccount({
        network: network as "mtn" | "vodafone" | "airteltigo",
        last4: extractLast4(cleanPhone),
      });
      router.push("/settings/linked-accounts");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings/linked-accounts")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Linked Accounts</span>
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Add Mobile Money Number</h1>
        <p className="text-gray-400 mb-6">
          Link a mobile money number to send and receive payments
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="bg-[#151A1F] border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                Number Details
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Select your network and enter the phone number linked to it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertTitle className="text-sm font-semibold">Validation Error</AlertTitle>
                  <AlertDescription className="text-xs leading-relaxed mt-1">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="network" className="text-xs font-semibold text-gray-300">
                  Network Provider
                </Label>
                <Select onValueChange={setNetwork} value={network}>
                  <SelectTrigger className="w-full bg-[#0C0F14] border-white/10 focus:border-[#00E660] text-white rounded-xl py-6">
                    <SelectValue placeholder="Select network provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151A1F] border-white/10 text-white">
                    {MOMO_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="hover:bg-white/5 focus:bg-white/5">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    className="bg-[#0C0F14] border-white/10 focus-visible:ring-[#00E660] pl-11 py-6 text-white rounded-xl text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button
                type="submit"
                disabled={isConnecting || !phoneNumber || !network}
                className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <p className="text-xs text-gray-400 text-center">
                This number is added as a backup. Set it as your primary from Linked Accounts anytime.
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
