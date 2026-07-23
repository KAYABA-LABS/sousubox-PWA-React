"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, ArrowRight, Leaf, Lock, Target, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  { id: "flex", name: "Flex Save", tagline: "Access your money anytime while earning steady growth.", rate: 9.8, minAmount: 50, color: "#009961", gradientFrom: "#00B377", gradientTo: "#00874E", icon: Leaf },
  { id: "fixed", name: "Fixed Savings", tagline: "Lock your money and earn higher returns.", rate: 14.5, minAmount: 100, color: "#4A80F0", gradientFrom: "#5B8FF9", gradientTo: "#2C5FD4", icon: Lock },
  { id: "goal", name: "Goal Booster", tagline: "Save towards a target and stay on track.", rate: 11.0, minAmount: 50, color: "#F59E0B", gradientFrom: "#FBBF24", gradientTo: "#D97706", icon: Target },
  { id: "auto", name: "Auto Save Plan", tagline: "Build savings automatically without thinking.", rate: 10.5, minAmount: 20, color: "#7C3AED", gradientFrom: "#8B5CF6", gradientTo: "#6D28D9", icon: RefreshCw },
];

export default function AllOpportunitiesPage() {
  const router = useRouter();

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">All Opportunities</h1>
        </div>
      </motion.header>

      <div className="flex-1 px-5 space-y-4">
        {PLANS.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => router.push(`/invest/new?plan=${plan.id}`)}
                className="w-full relative rounded-2xl p-5 text-left overflow-hidden h-48 flex flex-col justify-between"
                style={{ background: `linear-gradient(135deg, ${plan.gradientFrom}, ${plan.gradientTo})` }}
              >
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-gray-200" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-200 rounded-lg px-3 py-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-900" />
                    <span className="text-xs font-bold text-gray-900">{plan.rate}% p.a.</span>
                  </div>
                </div>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-sm text-gray-900/80 mt-1">{plan.tagline}</p>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-xs text-gray-900/70">Min. GH₵ {plan.minAmount}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-900" />
                  </div>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
