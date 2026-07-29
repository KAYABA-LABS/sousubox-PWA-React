"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { usePoolStore } from "@/stores/usePoolStore";
import { usePoolService } from "@/services/poolService";
import { PoolDetailModal } from "@/components/PoolDetailModal";
import { ArrowLeft, Users, Loader2, Sparkles, Compass, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { DiscoverPool } from "@/lib/api";

export default function DiscoverPoolsPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const poolService = usePoolService();
  const { discoverPools, setDiscoverPools, isLoading, setLoading } = usePoolStore();
  const [selectedPool, setSelectedPool] = useState<DiscoverPool | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  const loadPools = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const pools = await poolService.getDiscoverPools(userId);
      setDiscoverPools(pools);
    } catch {
      toast.error("Failed to discover pools");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadPools();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const handleJoin = async (poolId: string) => {
    if (!userId) return;
    setJoining(poolId);
    try {
      await poolService.joinPool(userId, poolId);
      setDiscoverPools(discoverPools.filter((p) => p.id !== poolId));
      setSelectedPool(null);
      router.push("/pools");
    } catch {
      toast.error("Failed to join pool");
    }
    setJoining(null);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Scanning network pools...</p>
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-background text-foreground relative overflow-hidden pb-32">
      {/* Dynamic background lights */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-6 pt-8 pb-6 border-b border-border/40 backdrop-blur-md bg-background/30 sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary animate-pulse" />
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/95 to-muted-foreground bg-clip-text text-transparent">
                  Discover Pools
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Find a collaborative savings pool matching your tier and timeline
              </p>
            </div>
          </div>
          
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-primary/10 border-primary/20 text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Susu Protocol Active
          </Badge>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          {discoverPools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/60 rounded-3xl backdrop-blur-md bg-card/20 p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 border border-border/80 shadow-inner">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Pools Available</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                All pools are currently filled. Check back soon or create your own custom savings pool.
              </p>
              <Button onClick={() => router.push("/pools")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-xl">
                Return to My Pools
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="grid gap-4"
            >
              {discoverPools.map((pool) => (
                <motion.div
                  key={pool.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedPool(pool)}
                  className="group"
                >
                  <Card className="overflow-hidden bg-card/45 hover:bg-card/75 border-border/50 hover:border-primary/40 backdrop-blur-md transition-all duration-300 rounded-2xl cursor-pointer relative shadow-lg hover:shadow-primary/5">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {pool.template.name}
                            </h3>
                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border-muted/80 text-muted-foreground bg-muted/10">
                              {pool.template.tier}
                            </Badge>
                            <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold border-primary/20 text-primary bg-primary/5">
                              {pool.frequency}
                            </Badge>
                          </div>
                          
                          {pool.template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {pool.template.description}
                            </p>
                          )}
                        </div>

                        <Badge className="self-start sm:self-auto px-2.5 py-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold shrink-0">
                          {pool.spotsRemaining} spots left
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-muted/30 border border-border/30 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contribution</p>
                          <p className="text-sm font-bold text-foreground">
                            GH₵ {pool.contributionAmount}
                          </p>
                        </div>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Payout</p>
                          <p className="text-sm font-bold text-primary">
                            GH₵ {pool.payoutAmount}
                          </p>
                        </div>
                        <div className="bg-muted/30 border border-border/30 rounded-xl p-3 text-center">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Cycles</p>
                          <p className="text-sm font-bold text-foreground">
                            {pool.totalCycles}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/30 pt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {pool.currentMemberCount} / {pool.template.maxMembers} members
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform font-bold">
                          <span>View Details</span>
                          <span>→</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          isOpen={!!selectedPool}
          onClose={() => setSelectedPool(null)}
          onJoin={(poolId) => handleJoin(poolId)}
          isJoining={joining === selectedPool.id}
        />
      )}
    </main>
  );
}

