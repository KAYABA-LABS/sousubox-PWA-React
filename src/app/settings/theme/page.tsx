"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeMode } from "@/lib/theme";

export default function ThemeSettings() {
  const router = useRouter();
  const { mode, setMode } = useTheme();
  const themes: { id: ThemeMode; name: string; icon: typeof Sun }[] = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
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
        <h1 className="text-2xl font-bold text-sb-ink mb-6">App Theme</h1>
        <div className="space-y-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.id}
                onClick={() => setMode(theme.id)}
                className={`w-full bg-sb-surface rounded-xl p-4 flex justify-between items-center transition-colors ${
                  mode === theme.id
                    ? "ring-2 ring-sb-brand-600"
                    : "hover:bg-gray-50 dark:hover:bg-sb-surface-2"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sb-ink-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sb-ink font-medium">{theme.name}</h3>
                </div>
                {mode === theme.id && (
                  <Check className="w-5 h-5 text-sb-brand-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
