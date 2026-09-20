"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Shield,
  Coins
} from "lucide-react";
import { toast } from "sonner";

interface PoolData {
  template: { name: string };
  contributionAmount: number;
}

export default function PoolContributePage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const { userId, isLoaded } = useAuth();
  const [pool, setPool] = useState<PoolData | null>(null);
  const [amount, setAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPool = async () => {
    try {
      const result = await api.getPoolDetails(poolId);
      const poolData = result.data as unknown as PoolData;
      setPool(poolData);
      if (poolData?.contributionAmount) {
        setAmount(String(poolData.contributionAmount));
      }
    } catch {
      toast.error("Failed to load pool");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !poolId) return;
    loadPool();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, poolId]);

  const handleContribute = async () => {
    if ((!userId && !isDevMode()) || !poolId) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsContributing(true);
    try {
      await api.contributeToPool(userId || "", poolId, numAmount);
      setIsSuccess(true);
      toast.success(`GH₵ ${numAmount.toFixed(2)} contributed to pool`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Contribution failed");
    }
    setIsContributing(false);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Securing connection channels...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <main id="main-content" role="main" className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Dynamic glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
            <CheckCircle2 className="w-10 h-10 text-primary animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Contribution Successful!</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            GH₵ {parseFloat(amount || "0").toFixed(2)} has been successfully contributed to <span className="text-foreground font-semibold">{pool?.template?.name || "the pool"}</span>.
          </p>
          <Button
            onClick={() => router.push(`/pools/${poolId}`)}
            className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/10"
          >
            View Pool Dashboard
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-background text-foreground relative overflow-hidden pb-36">
      {/* Background radial glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-8 pb-6 border-b border-border/40 backdrop-blur-md bg-background/30 sticky top-0 z-40"
      >
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full border-border/60 hover:bg-muted/80 w-10 h-10 shrink-0" 
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Contribute to Pool</h1>
            <p className="text-xs text-muted-foreground font-medium">Susu Financial Networks</p>
          </div>
        </div>
      </motion.header>

      <div className="max-w-xl mx-auto px-6 mt-8 space-y-6">
        {/* Pool Info Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-card/45 backdrop-blur-md border-border/50 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Coins className="w-16 h-16 text-primary" />
            </div>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Pool</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{pool?.template?.name || "Savings Pool"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Required Contribution</p>
                <p className="text-lg font-black text-primary mt-0.5">GH₵ {pool?.contributionAmount || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Amount Input */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="space-y-2.5"
        >
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Contribution Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="text-lg font-bold text-muted-foreground">GH₵</span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-16 pl-16 pr-6 text-xl font-bold bg-muted/20 border-border/60 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
            />
          </div>
        </motion.div>

        {/* Quick Amounts */}
        {pool?.contributionAmount && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }} 
            className="flex gap-2"
          >
            {[pool.contributionAmount, pool.contributionAmount * 2, pool.contributionAmount * 5].map((amt) => {
              const isActive = parseFloat(amount) === amt;
              return (
                <Button
                  key={amt}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setAmount(String(amt))}
                  className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 border-primary" 
                      : "border-border/60 hover:bg-muted/50"
                  }`}
                >
                  GH₵ {amt}
                </Button>
              );
            })}
          </motion.div>
        )}

        {/* Insurance / Protection notice */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-primary/5 border border-primary/10 rounded-2xl shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Susu Shield Active</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Your capital contribution is fully protected. All members are verified, and shortfalls are covered by the collective reserve pool system.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-30 shadow-2xl">
        <div className="max-w-xl mx-auto">
          <Button
            onClick={handleContribute}
            disabled={isContributing || !amount || parseFloat(amount) <= 0}
            className="w-full h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-base shadow-lg shadow-primary/20 transition-all duration-300 transform active:scale-[0.99] touch-target"
          >
            {isContributing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Confirm Contribution of GH₵ ${parseFloat(amount || "0").toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

