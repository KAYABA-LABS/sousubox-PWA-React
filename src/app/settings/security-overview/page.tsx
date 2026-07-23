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
      statusColor: "text-[#00E660]",
      description: "Last changed 30 days ago",
    },
    {
      icon: <Fingerprint className="w-5 h-5" />,
      title: "Biometric Authentication",
      status: "Disabled",
      statusColor: "text-gray-400",
      description: "Enable Face ID or Touch ID",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Two-Factor Authentication",
      status: "Disabled",
      statusColor: "text-gray-400",
      description: "Add extra security layer",
    },
    {
      icon: <Key className="w-5 h-5" />,
      title: "PIN Code",
      status: "Active",
      statusColor: "text-[#00E660]",
      description: "4-digit security code",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Trusted Devices",
      status: "3 devices",
      statusColor: "text-blue-400",
      description: "Manage device access",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">
          Security & Privacy
        </h1>
        <p className="text-gray-400 mb-6">
          Manage your account security settings
        </p>

        <div className="bg-[#00E660]/10 border border-[#00E660]/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00E660] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-1">
                Your account is secure
              </h3>
              <p className="text-sm text-gray-300">
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
              className="bg-[#151A1F] rounded-2xl p-4 hover:bg-[#1A1F25] transition-colors cursor-pointer"
              onClick={() => {
                // Navigation logic based on feature
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-400">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{feature.title}</h3>
                    <span className={`text-xs ${feature.statusColor}`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Active Sessions</h3>
          <p className="text-sm text-gray-400 mb-3">
            You are logged in on 2 devices
          </p>
          <button className="text-[#00E660] text-sm font-medium">
            Manage Sessions →
          </button>
        </div>
      </div>
    </div>
  );
}
