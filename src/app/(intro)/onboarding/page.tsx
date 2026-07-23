"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, TrendingUp, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    icon: Wallet,
    title: "Save & Grow",
    description: "Start saving with as little as GH₵20. Watch your money grow with competitive interest rates.",
    color: "#00E660",
  },
  {
    icon: Users,
    title: "Susu Pools",
    description: "Join savings pools with friends and community. Contribute together, take turns receiving the payout.",
    color: "#4A80F0",
  },
  {
    icon: TrendingUp,
    title: "Invest Smart",
    description: "Choose from Flex Save, Fixed Savings, Goal Booster, or Auto Save plans that fit your lifestyle.",
    color: "#F59E0B",
  },
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "Your identity is verified with bank-level security. Your money is safe with us.",
    color: "#7C3AED",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("sousuchain_onboarded", "true");
      router.push("/signup");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("sousuchain_onboarded", "true");
    router.push("/signup");
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-gray-400 hover:text-white"
        >
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <div
              className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center"
              style={{ backgroundColor: `${slide.color}20` }}
            >
              <Icon className="w-12 h-12" style={{ color: slide.color }} />
            </div>

            {/* Text */}
            <h1 className="text-3xl font-extrabold text-white mb-4">
              {slide.title}
            </h1>
            <p className="text-base text-gray-400 max-w-sm mx-auto leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8" : "w-2"
            }`}
            style={{
              backgroundColor: i === currentSlide ? slide.color : "#2C2C2E",
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="px-5 pb-8 space-y-3">
        <Button
          variant="hero"
          size="xl"
          onClick={handleNext}
          className="w-full text-white font-bold"
          style={{ backgroundColor: slide.color }}
        >
          {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
