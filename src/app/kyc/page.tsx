"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useKycService } from "@/services/kycService";
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface KycData {
  status: string;
  level?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string; glowClass: string; bgClass: string; description: string }
> = {
  NOT_SUBMITTED: {
    label: "Not Started",
    icon: Shield,
    colorClass: "text-zinc-400",
    glowClass: "group-hover:shadow-[0_0_30px_rgba(161,161,170,0.15)]",
    bgClass: "bg-zinc-950/40 border-zinc-800/80",
    description: "Complete identity verification to unlock all features, higher limits, and pool participation.",
  },
  PENDING: {
    label: "Verification Pending",
    icon: Clock,
    colorClass: "text-amber-400",
    glowClass: "shadow-[0_0_30px_rgba(251,191,36,0.15)]",
    bgClass: "bg-amber-950/20 border-amber-500/30",
    description: "Your verification is being processed. This usually takes between 10-30 minutes.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Clock,
    colorClass: "text-yellow-400",
    glowClass: "shadow-[0_0_30px_rgba(250,204,21,0.15)]",
    bgClass: "bg-yellow-950/20 border-yellow-500/30",
    description: "Our compliance team is manually reviewing your documents. Thank you for your patience.",
  },
  VERIFIED: {
    label: "Verified Profile",
    icon: CheckCircle,
    colorClass: "text-[#00E660]",
    glowClass: "shadow-[0_0_30px_rgba(0,230,96,0.2)]",
    bgClass: "bg-emerald-950/25 border-[#00E660]/30",
    description: "Your identity has been fully verified. You now have unrestricted access to all services.",
  },
  REJECTED: {
    label: "Verification Rejected",
    icon: XCircle,
    colorClass: "text-rose-500",
    glowClass: "shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    bgClass: "bg-rose-950/20 border-rose-500/30",
    description: "Your submission could not be verified. Please review the requirements and try again.",
  },
  EXPIRED: {
    label: "Verification Expired",
    icon: XCircle,
    colorClass: "text-rose-400",
    glowClass: "shadow-[0_0_30px_rgba(251,113,133,0.15)]",
    bgClass: "bg-rose-950/20 border-rose-500/30",
    description: "Your verification has expired. Please re-submit your documentation to restore access.",
  },
};

export default function KycPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const kycService = useKycService();

  const [kycData, setKycData] = useState<KycData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadKycStatus = async () => {
    if (!userId) return;
    try {
      const status = await kycService.getStatus(userId);
      setKycData(status);
    } catch {
      toast.error("Failed to load KYC status");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    loadKycStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  const handleStartVerification = async () => {
    if (!userId) return;
    setIsCreating(true);
    try {
      const session = await kycService.createSession(userId, {
        callback: `${window.location.origin}/kyc`,
      });
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error("Failed to initiate verification session.");
      }
    } catch (err) {
      console.error("Failed to create KYC session:", err);
      toast.error("An error occurred while launching verification.");
    }
    setIsCreating(false);
  };

  const status = (kycData?.status || "NOT_SUBMITTED") as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
  const StatusIcon = config.icon;

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,96,0.08),transparent_60%)]" />
        <Loader2 className="w-10 h-10 animate-spin text-[#00E660] z-10" />
        <span className="text-zinc-400 text-sm mt-4 font-medium animate-pulse z-10">Loading KYC Details...</span>
      </div>
    );
  }

  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen bg-[#0C0F14] text-white flex flex-col relative overflow-hidden pb-24"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,230,96,0.08),transparent_60%)]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00E660]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#00E660]/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 pt-8 pb-6 border-b border-white/[0.05] bg-[#0C0F14]/80 backdrop-blur-md sticky top-0 z-20"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-xl border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:text-white text-zinc-400 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Identity Verification
              </h1>
              <p className="text-xs text-zinc-500">KYC Compliance Center</p>
            </div>
          </div>
          {kycData?.level && (
            <Badge className="bg-[#00E660]/10 text-[#00E660] border border-[#00E660]/20 font-medium px-3 py-1 rounded-full">
              Tier Level: {kycData.level}
            </Badge>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto w-full px-6 mt-8 space-y-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Status Card */}
            <Card className={`backdrop-blur-xl border transition-all duration-300 ${config.bgClass} ${config.glowClass}`}>
              <CardHeader className="text-center pt-8 pb-4">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/[0.02] border border-white/[0.05] relative">
                  <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-5 pointer-events-none text-white" />
                  <StatusIcon className={`w-10 h-10 ${config.colorClass}`} />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight text-white mt-2">
                  {config.label}
                </CardTitle>
                <CardDescription className="text-zinc-400 text-sm max-w-md mx-auto mt-2">
                  {config.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-8 flex flex-col items-center">
                {status === "VERIFIED" && (
                  <div className="w-full max-w-sm mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">Reputation Tier</span>
                    <span className="text-lg font-bold text-white tracking-wide">Elite Member status unlocked</span>
                  </div>
                )}

                {status === "PENDING" || status === "UNDER_REVIEW" ? (
                  <div className="w-full flex flex-col items-center gap-3 mt-4 text-center">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm bg-white/[0.02] px-4 py-2.5 rounded-full border border-white/[0.05]">
                      <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Please keep this page bookmarked for updates</span>
                    </div>
                  </div>
                ) : null}

                {(status === "NOT_SUBMITTED" || status === "REJECTED" || status === "EXPIRED") && (
                  <Button
                    onClick={handleStartVerification}
                    disabled={isCreating}
                    className="w-full max-w-md mt-6 py-6 bg-gradient-to-r from-[#00E660] to-[#00C850] hover:from-[#00FF6A] hover:to-[#00D957] text-black font-semibold text-base rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,230,96,0.25)] hover:shadow-[0_4px_25px_rgba(0,230,96,0.4)] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer border-none"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Initializing Secure Session...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Start Verification</span>
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest px-1">
            Verification Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Higher Limits", text: "Increase your contribution and withdrawal limits significantly." },
              { title: "Elite Pools Access", text: "Join exclusive, high-yield pools with verified members." },
              { title: "Faster Payouts", text: "Get priority settlement on your pool payouts." },
              { title: "Reputation Boost", text: "Build credibility and raise your reliability score." },
            ].map((item, i) => (
              <Card key={i} className="bg-white/[0.02] border-white/[0.06] backdrop-blur-md">
                <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                  <div className="w-8 h-8 rounded-lg bg-[#00E660]/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#00E660]" />
                  </div>
                  <CardTitle className="text-sm font-bold text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Help & Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white/[0.01] border-white/[0.04] backdrop-blur-md p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <HelpCircle className="w-6 h-6 text-zinc-500 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Need help verifying your identity?</h4>
                <p className="text-xs text-zinc-400">Our support team is online to assist you with compliance inquiries.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/settings/contact")}
              className="border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.08] text-white text-xs px-4 py-2 h-auto rounded-lg font-medium transition-all"
            >
              Contact Support
            </Button>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
