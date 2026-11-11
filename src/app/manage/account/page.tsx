"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserData {
  name: string;
  email: string;
  accountNumber: string;
  routingNumber: string;
  status: string;
  memberSince: string;
}

export default function ManageAccountPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserData({
        name,
        email,
        accountNumber: "1234567890",
        routingNumber: "021000021",
        status: "Active",
        memberSince,
      });
    }
  }, [userId, isLoaded, user, router]);

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-sb-canvas flex items-center justify-center">
        <p className="text-sb-ink-2">Loading...</p>
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header role="banner" className="bg-sb-canvas px-5 pt-6 pb-4 border-b border-sb-line">
        <div className="flex items-center gap-4 mb-2">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-sb-ink">
              Account details
            </h1>
            <p className="text-sm text-sb-ink-2">View your information</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Section */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">Profile</h2>
            <div className="bg-sb-surface rounded-xl divide-y divide-black/5 dark:divide-white/5">
              <div className="p-4">
                <p className="text-xs text-sb-ink-3 mb-1">Full name</p>
                <p className="text-sb-ink font-medium">{userData.name}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-sb-ink-3 mb-1">Email address</p>
                <p className="text-sb-ink">{userData.email}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-sb-ink-3 mb-1">Member since</p>
                <p className="text-sb-ink">{userData.memberSince}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">
              Account information
            </h2>
            <div className="space-y-2">
              {/* Account Number */}
              <Button
                onClick={() =>
                  handleCopy("accountNumber", userData.accountNumber)
                }
                className="w-full bg-sb-surface border border-sb-line rounded-xl p-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors"
                aria-label="Copy account number"
              >
                <div className="text-left">
                  <p className="text-xs text-sb-ink-3 mb-1">Account number</p>
                  <p className="text-sb-ink font-mono">
                    {userData.accountNumber}
                  </p>
                </div>
                {copiedField === "accountNumber" ? (
                  <CheckCircle2 className="w-5 h-5 text-sb-brand-600" />
                ) : (
                  <Copy className="w-5 h-5 text-sb-ink-3 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                )}
              </Button>

              {/* Routing Number */}
              <Button
                onClick={() =>
                  handleCopy("routingNumber", userData.routingNumber)
                }
                className="w-full bg-sb-surface border border-sb-line rounded-xl p-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors"
                aria-label="Copy routing number"
              >
                <div className="text-left">
                  <p className="text-xs text-sb-ink-3 mb-1">Routing number</p>
                  <p className="text-sb-ink font-mono">
                    {userData.routingNumber}
                  </p>
                </div>
                {copiedField === "routingNumber" ? (
                  <CheckCircle2 className="w-5 h-5 text-sb-brand-600" />
                ) : (
                  <Copy className="w-5 h-5 text-sb-ink-3 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                )}
              </Button>

              {/* Account Status */}
              <div className="w-full bg-sb-surface border border-sb-line rounded-xl p-4">
                <p className="text-xs text-sb-ink-3 mb-1">Account status</p>
                <div className="flex items-center gap-2">
                  <Badge className="px-2.5 py-0.5 bg-sb-brand-800/20 dark:bg-sb-brand-700/20 text-sb-brand-600 rounded-full text-xs font-medium">
                    {userData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Account details are read-only. Contact support to update your
              information.
            </p>
          </div>
        </motion.div>
      </main>
    </main>
  );
}
