"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AccessibilitySettings() {
  const router = useRouter();
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

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
        <h1 className="text-2xl font-bold text-white mb-6">Accessibility</h1>
        <div className="space-y-4">
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-3 block">
              Font Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`py-2 rounded-lg capitalize ${
                    fontSize === size
                      ? "bg-[#00E660] text-black"
                      : "bg-white/5 text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">High Contrast</h3>
              <p className="text-sm text-gray-400">Increase color contrast</p>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                highContrast ? "bg-[#00E660]" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  highContrast ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="bg-[#151A1F] rounded-2xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">Reduce Motion</h3>
              <p className="text-sm text-gray-400">Minimize animations</p>
            </div>
            <button
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                reduceMotion ? "bg-[#00E660]" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  reduceMotion ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
