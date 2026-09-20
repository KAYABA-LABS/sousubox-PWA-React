"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, Landmark, Banknote, PiggyBank, PieChart } from "lucide-react";
import { Dock } from "@/components/dashboard/Dock";

const UPCOMING_INSTRUMENTS = [
  { id: "auto", label: "Auto Save Plan", icon: Landmark },
  { id: "vault", label: "Vault Lock Saving", icon: Banknote },
  { id: "flex", label: "Flexed Saving", icon: PiggyBank },
  { id: "target", label: "Goal Savings", icon: PieChart },
];

// Gates the entire /invest section behind a static placeholder for the
// production launch. Intentionally does not render `children`, so none of
// the existing invest pages mount. Remove this file to re-enable the feature.
export default function InvestLayout() {
  const router = useRouter();

  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center px-5 pb-32"
    >
      <div className="w-full max-w-sm bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-[#0D4F3C] dark:text-[#156B53]" />
        </div>

        <h2 className="text-lg font-semibold text-[#0C0F14] dark:text-white mb-2">
          Investments Are Coming Soon
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          We’re putting the finishing touches on Invest. Soon you’ll be able to grow
          your money in Treasury Bills, Money Market Funds, Fixed Deposits, and Unit
          Trusts — right from your Sousubox account.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          {UPCOMING_INSTRUMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] p-4"
              >
                <Icon className="w-5 h-5 text-[#0D4F3C] dark:text-[#156B53]" />
                <span className="text-xs font-medium text-[#0C0F14] dark:text-white text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Dock activeItem="invest" onItemClick={(href) => router.push(href)} />
    </main>
  );
}
