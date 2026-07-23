"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Wallet, Unlock } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description:
      "Request access with your email. Approved users receive an invitation to complete registration.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Fund Your Account",
    description:
      "Make an initial deposit of $100 to activate full account features and unlock withdrawals.",
  },
  {
    icon: Unlock,
    step: "03",
    title: "Access Everything",
    description:
      "Deposit, transfer, pay, and withdraw with complete control. Your digital account is fully active.",
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-card/30">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#00E660] border px-3.5 py-1 rounded-full bg-[#00E660]/50">
            How It Works
          </span>
          <h2 className="text-5xl text-foreground mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-body-lg text-white/60">
            Three simple steps to your premium digital account.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-linear-to-r from-transparent via-border to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center group"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 -m-2 rounded-3xl transition-all duration-500" />

                {/* Step number */}
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-secondary/50 border-2 border-transparent group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300" />
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#101114] group-hover:bg-[#00E660]/5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-10 h-10 text-[#00E660] group-hover:text-primary transition-colors duration-300" />
                    </motion.div>
                  </div>
                  <motion.span
                    whileHover={{ scale: 1.15 }}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#00E660] group-hover:shadow-lg group-hover:shadow-[#00E660]/50 flex items-center justify-center text-black text-sm font-bold transition-all duration-300"
                  >
                    {step.step.slice(-1)}
                  </motion.span>
                </div>

                {/* Content */}
                <Card className="p-6 border-0 bg-transparent">
                  <h3 className="text-2xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-base text-white/60 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
