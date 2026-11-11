"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Shield,
  Key,
  Fingerprint,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export default function SecurityOverview() {
  const router = useRouter();

  const securityFeatures = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Password",
      status: "Strong",
      statusColor: "text-sb-brand-600",
      description: "Last changed 30 days ago",
    },
    {
      icon: <Fingerprint className="w-5 h-5" />,
      title: "Biometric Authentication",
      status: "Disabled",
      statusColor: "text-sb-ink-2",
      description: "Enable Face ID or Touch ID",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Two-Factor Authentication",
      status: "Disabled",
      statusColor: "text-sb-ink-2",
      description: "Add extra security layer",
    },
    {
      icon: <Key className="w-5 h-5" />,
      title: "PIN Code",
      status: "Active",
      statusColor: "text-sb-brand-600",
      description: "4-digit security code",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Trusted Devices",
      status: "3 devices",
      statusColor: "text-blue-600 dark:text-blue-400",
      description: "Manage device access",
    },
  ];

  return (
    <div className="min-h-screen bg-sb-canvas p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-sb-ink-2 hover:text-sb-ink dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <h1 className="text-2xl font-bold text-sb-ink mb-2">
          Security & Privacy
        </h1>
        <p className="text-sb-ink-2 mb-6">
          Manage your account security settings
        </p>

        <div className="bg-sb-brand-800/10 dark:bg-sb-brand-700/10 border border-sb-brand-600/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-sb-brand-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sb-ink font-semibold mb-1">
                Your account is secure
              </h3>
              <p className="text-sm text-sb-ink-2">
                We recommend enabling two-factor authentication for extra
                protection.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-sb-surface rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-sb-surface-2 transition-colors cursor-pointer"
              onClick={() => {
                // Navigation logic based on feature
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-sb-ink-2">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sb-ink font-medium">{feature.title}</h3>
                    <span className={`text-xs ${feature.statusColor}`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-sm text-sb-ink-2">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-sb-surface rounded-2xl p-4">
          <h3 className="text-sb-ink font-semibold mb-2">Active Sessions</h3>
          <p className="text-sm text-sb-ink-2 mb-3">
            You are logged in on 2 devices
          </p>
          <button className="text-sb-brand-600 text-sm font-medium">
            Manage Sessions →
          </button>
        </div>
      </div>
    </div>
  );
}
