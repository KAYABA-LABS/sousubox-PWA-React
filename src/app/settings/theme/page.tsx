"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Monitor, Check } from "lucide-react";

export default function ThemeSettings() {
  const router = useRouter();
  const [selected, setSelected] = useState("dark");
  const themes = [
    { id: "light", name: "Light", icon: <Sun className="w-5 h-5" /> },
    { id: "dark", name: "Dark", icon: <Moon className="w-5 h-5" /> },
    { id: "system", name: "System", icon: <Monitor className="w-5 h-5" /> },
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
        <h1 className="text-2xl font-bold text-white mb-6">App Theme</h1>
        <div className="space-y-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelected(theme.id)}
              className={`w-full bg-[#151A1F] rounded-xl p-4 flex justify-between items-center transition-colors ${
                selected === theme.id
                  ? "ring-2 ring-[#00E660]"
                  : "hover:bg-[#1A1F25]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-400">{theme.icon}</div>
                <h3 className="text-white font-medium">{theme.name}</h3>
              </div>
              {selected === theme.id && (
                <Check className="w-5 h-5 text-[#00E660]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
