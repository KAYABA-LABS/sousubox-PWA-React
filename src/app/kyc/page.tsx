"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useKycService } from "@/services/kycService";
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface KycData {
  status: string;
  level?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; description: string }> = {
  NOT_SUBMITTED: { label: "Not Started", icon: Shield, color: "gray", description: "Complete identity verification to unlock all features." },
  PENDING: { label: "Pending", icon: Clock, color: "yellow", description: "Your verification is being processed." },
  UNDER_REVIEW: { label: "Under Review", icon: Clock, color: "yellow", description: "Our team is reviewing your documents." },
  VERIFIED: { label: "Verified", icon: CheckCircle, color: "green", description: "Your identity has been verified." },
  REJECTED: { label: "Rejected", icon: XCircle, color: "red", description: "Your verification was not approved." },
  EXPIRED: { label: "Expired", icon: XCircle, color: "red", description: "Your verification has expired." },
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
      }
    } catch (err) {
      console.error("Failed to create KYC session:", err);
    }
    setIsCreating(false);
  };

  const status = (kycData?.status || "NOT_SUBMITTED") as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
  const StatusIcon = config.icon;

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
        </div>
      </motion.header>

      <main className="flex-1 px-5 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-gray-200 rounded-2xl p-6 text-center">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                config.color === "green"
                  ? "bg-emerald-50"
                  : config.color === "red"
                    ? "bg-red-500/10"
                    : config.color === "yellow"
                      ? "bg-yellow-500/10"
                      : "bg-gray-100"
              }`}
            >
              <StatusIcon
                className={`w-10 h-10 ${
                  config.color === "green"
                    ? "text-emerald-600"
                    : config.color === "red"
                      ? "text-red-500"
                      : config.color === "yellow"
                        ? "text-yellow-400"
                        : "text-gray-500"
                }`}
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{config.label}</h2>
            <p className="text-sm text-gray-500">{config.description}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Why verify?</h3>
            <ul className="space-y-3">
              {[
                "Unlock higher transaction limits",
                "Access all pool features",
                "Enable withdrawals",
                "Build your reputation score",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {status === "NOT_SUBMITTED" || status === "REJECTED" || status === "EXPIRED" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleStartVerification}
              disabled={isCreating}
              className="w-full py-4 bg-emerald-600 text-black font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Start Verification
                </>
              )}
            </Button>
          </motion.div>
        ) : null}
      </main>
    </main>
  );
}
