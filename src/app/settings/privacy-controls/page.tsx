"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Users, BarChart, MapPin } from "lucide-react";

export default function PrivacyControls() {
  const router = useRouter();
  const [shareData, setShareData] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [location, setLocation] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);

  const toggles = [
    {
      icon: <BarChart className="w-5 h-5" />,
      title: "Usage Analytics",
      description: "Help us improve by sharing app usage data",
      value: analytics,
      onChange: setAnalytics,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location Services",
      description: "Enable location-based features",
      value: location,
      onChange: setLocation,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Data Sharing",
      description: "Share anonymized data with partners",
      value: shareData,
      onChange: setShareData,
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Marketing Communications",
      description: "Receive personalized offers and updates",
      value: marketing,
      onChange: setMarketing,
    },
    {
      icon: <EyeOff className="w-5 h-5" />,
      title: "Third-Party Cookies",
      description: "Allow third-party tracking cookies",
      value: thirdParty,
      onChange: setThirdParty,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-2">Privacy Controls</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Manage how your data is collected and used
        </p>

        <div className="space-y-3">
          {toggles.map((toggle, index) => (
            <div key={index} className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-gray-500 dark:text-gray-400 mt-1">{toggle.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-[#0C0F14] dark:text-white font-medium mb-1">
                      {toggle.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {toggle.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggle.onChange(!toggle.value)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    toggle.value ? "bg-[#0D4F3C]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      toggle.value ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white dark:bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-[#0C0F14] dark:text-white font-semibold mb-2">Data Download</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Request a copy of all your personal data
          </p>
          <button className="text-[#0D4F3C] dark:text-[#156B53] text-sm font-medium">
            Download My Data →
          </button>
        </div>

        <div className="mt-3 bg-white dark:bg-[#151A1F] rounded-2xl p-4">
          <h3 className="text-[#0C0F14] dark:text-white font-semibold mb-2">
            Right to be Forgotten
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Request deletion of all your data
          </p>
          <button className="text-red-500 text-sm font-medium">
            Delete My Data →
          </button>
        </div>
      </div>
    </div>
  );
}
