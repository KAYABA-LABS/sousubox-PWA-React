"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, DollarSign, Loader2, Award, Info, Landmark } from "lucide-react";
import { toast } from "sonner";

interface PoolDetail {
  template: { name: string; tier: string; description: string };
  contributionAmount: number;
  payoutAmount: number;
  totalCycles: number;
  currentCycle: number;
  currentMemberCount: number;
  maxMembers: number;
  frequency: string;
  nextContributionDue: string | null;
  status: string;
}

export default function PoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const { isLoaded } = useAuth();
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPoolDetails = async () => {
    try {
      const result = await api.getPoolDetails(poolId);
      setPool(result.data as unknown as PoolDetail);
    } catch {
      toast.error("Failed to load pool details");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !poolId) return;
    loadPoolDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, poolId]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Fetching pool intelligence...</p>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Landmark className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-bold text-foreground">Pool Not Found</p>
        <p className="text-sm text-muted-foreground mt-1 mb-6">The requested pool does not exist or you lack permission to view it.</p>
        <Button onClick={() => router.push("/pools")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl">
          Back to Pools
        </Button>
      </div>
    );
  }

  const completionPercentage = Math.min((pool.currentCycle / pool.totalCycles) * 100, 100);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-background text-foreground relative overflow-hidden pb-36">
      {/* Background radial highlights */}
      <div className="absolute top-[-5%] right-[-15%] w-[70%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-8 pb-6 border-b border-border/40 backdrop-blur-md bg-background/30 sticky top-0 z-40"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="icon"
              className="rounded-full border-border/60 hover:bg-muted/80 transition-all duration-300 w-10 h-10 shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Pool Details</h1>
              <p className="text-xs text-muted-foreground font-medium">Susu Protocol Member Portal</p>
            </div>
          </div>
          <Badge className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            pool.status === "ACTIVE"
              ? "bg-primary/10 border-primary/20 text-primary"
              : pool.status === "FORMING"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-muted text-muted-foreground"
          }`}>
            {pool.status}
          </Badge>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
        {/* Pool Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/45 backdrop-blur-md border-border/50 rounded-2xl overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Award className="w-24 h-24 text-primary" />
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {pool.template?.name || "Savings Pool"}
                  </h2>
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                    {pool.template?.tier}
                  </Badge>
                </div>
                <p className="text-sm text-primary font-semibold">
                  Frequency: {pool.frequency}
                </p>
              </div>

              {pool.template?.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-l-2 border-primary/30 pl-3">
                  {pool.template.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/30 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                    <Landmark className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Contribution</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    GH₵ {pool.contributionAmount}
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1 text-primary">
                    <Landmark className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Payout</span>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    GH₵ {pool.payoutAmount}
                  </p>
                </div>

                <div className="bg-muted/30 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Cycle</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {pool.currentCycle} / {pool.totalCycles}
                  </p>
                </div>

                <div className="bg-muted/30 border border-border/30 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Members</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {pool.currentMemberCount} / {pool.maxMembers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/45 backdrop-blur-md border-border/50 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-foreground tracking-tight">Cycle Progress</h3>
                <span className="text-xs font-bold text-primary">{Math.round(completionPercentage)}% Complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2.5 bg-muted/60" />
              <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium">
                <span>Completed cycle {pool.currentCycle} of {pool.totalCycles}</span>
                <span>{pool.totalCycles - pool.currentCycle} cycles remaining</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Contribution Card */}
        {pool.nextContributionDue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-primary/5 border border-primary/20 rounded-2xl overflow-hidden relative shadow-lg">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary mt-1">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Next Contribution Due</h3>
                  <p className="text-lg font-bold text-foreground mt-1 leading-snug">
                    {new Date(pool.nextContributionDue).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Automatic wallet deduction or manual dispatch is supported.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Contribute CTA Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-30 shadow-2xl">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => router.push(`/pools/${poolId}/contribute`)}
            className="w-full h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 text-base transition-all duration-300 transform active:scale-[0.99] touch-target"
          >
            Contribute GH₵ {pool.contributionAmount}
          </Button>
        </div>
      </div>
    </main>
  );
}

