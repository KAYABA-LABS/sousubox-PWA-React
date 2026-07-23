"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

export default function LanguageSettings() {
  const router = useRouter();
  const [selected, setSelected] = useState("en");
  const languages = [
    { code: "en", name: "English (US)", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
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
        <h1 className="text-2xl font-bold text-white mb-6">Language</h1>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`w-full bg-[#151A1F] rounded-xl p-4 flex justify-between items-center transition-colors ${
                selected === lang.code
                  ? "ring-2 ring-[#00E660]"
                  : "hover:bg-[#1A1F25]"
              }`}
            >
              <div className="text-left">
                <h3 className="text-white font-medium">{lang.name}</h3>
                <p className="text-sm text-gray-400">{lang.nativeName}</p>
              </div>
              {selected === lang.code && (
                <Check className="w-5 h-5 text-[#00E660]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
