"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Shield, CheckCircle2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ManageSecurityPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const [email, setEmail] = useState("");
  const [otpEnabled, setOtpEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!databaseUserId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.emailAddresses?.[0]?.emailAddress || "");
    }
  }, [databaseUserId, isLoaded, user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Security settings saved");
    setIsSaving(false);
  };

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
            <h1 className="text-xl font-semibold text-sb-ink">Security</h1>
            <p className="text-sm text-sb-ink-2">
              Manage your security settings
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">
              Email address
            </h2>
            <div className="bg-sb-surface rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sb-brand-800/10 dark:bg-sb-brand-700/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-sb-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-sb-ink-3">Current email</p>
                  <p className="text-sb-ink font-medium">{email}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-sb-brand-600" />
              </div>
              <Button className="w-full bg-gray-50 dark:bg-sb-canvas hover:bg-gray-100 dark:hover:bg-sb-surface border border-sb-line text-sb-ink py-2.5 rounded-lg transition-colors text-sm font-medium">
                Change email
              </Button>
            </div>
          </div>

          {/* Password */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">Password</h2>
            <div className="bg-sb-surface rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sb-brand-800/10 dark:bg-sb-brand-700/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-sb-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sb-ink font-medium">Password</p>
                  <p className="text-xs text-sb-ink-3">
                    Last changed 30 days ago
                  </p>
                </div>
              </div>
              <Button className="w-full bg-gray-50 dark:bg-sb-canvas hover:bg-gray-100 dark:hover:bg-sb-surface border border-sb-line text-sb-ink py-2.5 rounded-lg transition-colors text-sm font-medium">
                Change password
              </Button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div>
            <h2 className="text-sm font-medium text-sb-ink-2 mb-3">
              Two-factor authentication
            </h2>
            <div className="bg-sb-surface rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sb-brand-800/10 dark:bg-sb-brand-700/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-sb-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sb-ink font-medium">OTP verification</p>
                  <p className="text-xs text-sb-ink-3">
                    {otpEnabled ? "Enabled for all transactions" : "Disabled"}
                  </p>
                </div>
                <Button
                  onClick={() => setOtpEnabled(!otpEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    otpEnabled ? "bg-sb-brand-800" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label="Toggle two-factor authentication"
                  role="switch"
                  aria-checked={otpEnabled}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      otpEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </Button>
              </div>
              <p className="text-xs text-sb-ink-2">
                Adds an extra layer of security by requiring a one-time password
                for sensitive actions
              </p>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              Security tips
            </p>
            <ul className="space-y-1.5 text-xs text-blue-700/80 dark:text-blue-300/80">
              <li>• Use a strong, unique password</li>
              <li>• Enable two-factor authentication</li>
              <li>• Never share your password or OTP codes</li>
              <li>• Review account activity regularly</li>
            </ul>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom CTA */}
      <div className="px-5 pb-8">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-sb-brand-800 hover:bg-sb-brand-700 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save changes</span>
          )}
        </Button>
      </div>
    </main>
  );
}
