"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Leaf,
  Lock,
  Target,
  RefreshCw,
  Info,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PLANS: Record<string, {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  rate: number;
  minAmount: number;
  lockPeriod: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ElementType;
  keyFacts: { label: string; value: string }[];
  exampleReturn: { principal: number; months: number; earned: number };
}> = {
  flex: {
    id: "flex",
    name: "Flex Save",
    shortName: "Flex",
    tagline: "Access your money anytime while earning steady growth.",
    description:
      "Earn steady returns while keeping your funds fully accessible. Perfect for building an emergency fund or saving for a near-term goal.",
    rate: 9.8,
    minAmount: 50,
    lockPeriod: "None",
    color: "#009961",
    gradientFrom: "#00B377",
    gradientTo: "#00874E",
    icon: Leaf,
    keyFacts: [
      { label: "Annual Rate", value: "9.8% p.a." },
      { label: "Compounding", value: "Daily" },
      { label: "Withdrawal", value: "Anytime, penalty-free" },
      { label: "Min. Deposit", value: "GH₵ 50" },
      { label: "Interest Paid", value: "Monthly" },
      { label: "Lock Period", value: "None" },
    ],
    exampleReturn: { principal: 1000, months: 12, earned: 98 },
  },
  fixed: {
    id: "fixed",
    name: "Fixed Savings",
    shortName: "Fixed",
    tagline: "Lock your money and earn higher returns.",
    description:
      "Commit to a fixed term and unlock significantly higher returns. Ideal for funds you won't need in the near term.",
    rate: 14.5,
    minAmount: 100,
    lockPeriod: "3 – 24 months",
    color: "#4A80F0",
    gradientFrom: "#5B8FF9",
    gradientTo: "#2C5FD4",
    icon: Lock,
    keyFacts: [
      { label: "Annual Rate", value: "Up to 14.5% p.a." },
      { label: "Compounding", value: "Monthly" },
      { label: "Lock Period", value: "3 – 24 months" },
      { label: "Min. Deposit", value: "GH₵ 100" },
      { label: "Early Exit", value: "Penalty applies" },
      { label: "Interest Paid", value: "At maturity" },
    ],
    exampleReturn: { principal: 1000, months: 12, earned: 145 },
  },
  goal: {
    id: "goal",
    name: "Goal Booster",
    shortName: "Goal",
    tagline: "Save towards a target and stay on track.",
    description:
      "Set a savings target and a deadline. We'll help you automate contributions and hit your goal with smart nudges.",
    rate: 11.0,
    minAmount: 50,
    lockPeriod: "Until target date",
    color: "#F59E0B",
    gradientFrom: "#FBBF24",
    gradientTo: "#D97706",
    icon: Target,
    keyFacts: [
      { label: "Annual Rate", value: "11.0% p.a." },
      { label: "Compounding", value: "Monthly" },
      { label: "Target Date", value: "You choose" },
      { label: "Min. Deposit", value: "GH₵ 50" },
      { label: "Auto Top-up", value: "Optional" },
      { label: "Lock Period", value: "Until goal date" },
    ],
    exampleReturn: { principal: 1000, months: 12, earned: 110 },
  },
  auto: {
    id: "auto",
    name: "Auto Save Plan",
    shortName: "Auto",
    tagline: "Build savings automatically without thinking.",
    description:
      "Set it and forget it. Automated micro-deposits keep your savings growing consistently, every single day.",
    rate: 10.5,
    minAmount: 20,
    lockPeriod: "Flexible",
    color: "#7C3AED",
    gradientFrom: "#8B5CF6",
    gradientTo: "#6D28D9",
    icon: RefreshCw,
    keyFacts: [
      { label: "Annual Rate", value: "10.5% p.a." },
      { label: "Compounding", value: "Daily" },
      { label: "Frequency", value: "Daily / Weekly / Monthly" },
      { label: "Min. Deposit", value: "GH₵ 20" },
      { label: "Pause Anytime", value: "No penalty" },
      { label: "Lock Period", value: "Flexible" },
    ],
    exampleReturn: { principal: 1000, months: 12, earned: 105 },
  },
};

type TimeFilter = "3M" | "6M" | "1Y" | "2Y";

const CHART_DATA: Record<string, Record<TimeFilter, number[]>> = {
  flex: {
    "3M": [28, 34, 30, 42, 46, 44, 55, 58],
    "6M": [20, 27, 32, 38, 35, 44, 48, 53, 56, 54, 61, 66],
    "1Y": [12, 20, 26, 32, 36, 41, 44, 49, 53, 57, 61, 67],
    "2Y": [6, 13, 19, 25, 30, 35, 39, 43, 47, 50, 53, 57, 60, 64, 67, 71],
  },
  fixed: {
    "3M": [22, 30, 27, 40, 47, 45, 58, 65],
    "6M": [14, 23, 29, 37, 34, 45, 50, 56, 61, 59, 68, 75],
    "1Y": [8, 17, 24, 31, 37, 43, 47, 53, 58, 64, 68, 76],
    "2Y": [4, 11, 17, 25, 31, 37, 43, 49, 54, 58, 62, 66, 70, 74, 78, 85],
  },
  goal: {
    "3M": [30, 36, 33, 43, 46, 44, 53, 57],
    "6M": [22, 28, 33, 38, 36, 44, 48, 52, 56, 54, 60, 64],
    "1Y": [14, 22, 28, 34, 38, 43, 47, 51, 54, 58, 62, 66],
    "2Y": [8, 14, 20, 27, 32, 37, 42, 46, 50, 53, 57, 60, 63, 66, 69, 73],
  },
  auto: {
    "3M": [26, 32, 30, 40, 43, 41, 50, 54],
    "6M": [18, 25, 30, 36, 34, 42, 46, 50, 54, 52, 58, 62],
    "1Y": [11, 18, 24, 30, 35, 40, 44, 48, 52, 55, 59, 64],
    "2Y": [5, 11, 17, 23, 29, 34, 39, 43, 47, 50, 54, 57, 60, 63, 66, 70],
  },
};

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function PlanDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "flex";
  const plan = PLANS[planId] || PLANS.flex;
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("3M");

  const Icon = plan.icon;
  const chartData = CHART_DATA[planId]?.[activeFilter] || CHART_DATA.flex["3M"];

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Hero */}
      <div
        className="relative px-5 pt-6 pb-8 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${plan.gradientFrom}, ${plan.gradientTo})` }}
      >
        {/* Decorative rings */}
        <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full border-[44px] border-gray-200" />
        <div className="absolute -right-5 top-8 w-36 h-36 rounded-full border-[28px] border-gray-200" />

        {/* Back button */}
        <Button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center mb-4"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </Button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gray-200 border border-gray-200 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-gray-900" />
        </div>

        {/* Name + tagline */}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{plan.name}</h1>
        <p className="text-base text-gray-900/90 mt-2">{plan.tagline}</p>

        {/* Stats chips */}
        <div className="flex gap-3 mt-6">
          {[
            { label: "Rate", value: `${plan.rate}% p.a.` },
            { label: "Lock Period", value: plan.lockPeriod },
            { label: "Min. Deposit", value: `GH₵ ${plan.minAmount}` },
          ].map((s, i) => (
            <Card
              key={i}
              className="flex-1 bg-gray-100 rounded-2xl p-3 border border-gray-200 shadow-none"
            >
              <p className="text-[10px] text-gray-900/70 font-bold uppercase mb-1">{s.label}</p>
              <p className="text-sm font-extrabold text-gray-900">{s.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 space-y-6 -mt-4">
        {/* Growth Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Growth Over Time</h2>
            <div className="flex gap-1">
              {(["3M", "6M", "1Y", "2Y"] as TimeFilter[]).map((f) => (
                <Button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeFilter === f
                      ? "text-gray-900"
                      : "text-gray-500 border border-gray-200"
                  }`}
                  style={activeFilter === f ? { backgroundColor: plan.color } : {}}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <MiniChart data={chartData} color={plan.color} />
          <div className="flex items-center justify-center mt-2">
            <span className="text-xs font-bold" style={{ color: plan.color }}>
              +{plan.rate}%
            </span>
          </div>
        </motion.div>

        {/* Key Facts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          <h2 className="text-base font-bold text-gray-900 mb-3">Key Facts</h2>
          <div className="divide-y divide-gray-200">
            {plan.keyFacts.map((f, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500">{f.label}</span>
                <span className="text-sm font-semibold text-gray-900">{f.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Example Return */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 border"
          style={{
            backgroundColor: `${plan.color}12`,
            borderColor: `${plan.color}30`,
          }}
        >
          <h2 className="text-base font-bold text-gray-900 mb-4">See it in action</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">You invest</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                GH₵ {plan.exampleReturn.principal.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ChevronRight className="w-5 h-5" style={{ color: plan.color }} />
              <p className="text-[10px] text-gray-500 mt-1">{plan.exampleReturn.months} months</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">You earn</p>
              <p className="text-xl font-bold mt-1" style={{ color: plan.color }}>
                +GH₵ {plan.exampleReturn.earned}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t" style={{ borderColor: `${plan.color}25` }}>
            <Info className="w-3.5 h-3.5 text-gray-500" />
            <p className="text-[11px] text-gray-500">
              Illustration only. Returns may vary. {plan.rate}% p.a.
            </p>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 leading-relaxed"
        >
          {plan.description}
        </motion.p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={() => router.push(`/invest/new/setup?plan=${planId}`)}
          className="w-full py-4 rounded-xl text-gray-900 font-bold text-base transition-colors"
          style={{ backgroundColor: plan.color }}
        >
          Get Started →
        </Button>
      </div>
    </main>
  );
}
