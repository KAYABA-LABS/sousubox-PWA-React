"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Lock,
  Server,
  Key,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit Encryption",
    description:
      "Military-grade encryption for all data at rest and in transit.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Auth",
    description:
      "Secure access with fingerprint and facial recognition support.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on enterprise-grade servers with 99.99% uptime.",
  },
  {
    icon: Key,
    title: "2FA Protection",
    description: "Two-factor authentication with email OTP verification.",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime" },
  { value: "<100ms", label: "Response Time" },
  { value: "0", label: "Security Breaches" },
  { value: "24/7", label: "Monitoring" },
];

export const SecuritySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="security" className="relative py-24 md:py-32 overflow-hidden">
      {/* Radial background */}
      <div className="absolute right-8 top-200 w-120 h-150 md:right-30 md:top-1/2 transform md:-translate-y-1/2 md:w-200 md:h-200 rounded-full bg-[#0D4F3C]/8 dark:bg-[#156B53]/8 blur-3xl -z-10 pointer-events-none" />
      <div className="container mx-auto relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left - Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-140"
          >
            <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#0D4F3C] dark:border-[#156B53] border px-3.5 py-1 rounded-full bg-[#0D4F3C]/50 dark:bg-[#156B53]/50">
              Security
            </span>
            <h2 className="text-3xl sm:text-5xl text-foreground mb-6">
              Your Trust is Our{" "}
              <span className="text-gradient-green">Foundation</span>
            </h2>
            <p className="text-sm md:text-base text-white/60 mb-8 max-w-lg">
              Built on enterprise-grade infrastructure with multiple layers of
              security. Your funds and data are protected by the same technology
              used by leading financial institutions.
            </p>

            {/* Security features */}
            <div className="grid sm:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  >
                    <Card className="flex items-start gap-3 p-4 rounded-xl bg-[#101114]/80 hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#0D4F3C] dark:text-[#156B53]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right - Shield visual + stats */}
          <div className="flex items-start justify-center">
            {/* Card */}
            <Card className="relative bg-[#101114] border border-border rounded-2xl p-8 md:p-8 w-full max-w-105">
              {/* Shield icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-[#0D4F3C]/10 dark:bg-[#156B53]/10 flex items-center justify-center">
                    <Shield className="w-12 h-12 text-[#0D4F3C] dark:text-[#156B53]" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0D4F3C] flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold text-[#0D4F3C] dark:text-[#156B53] mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-3 mt-8 pt-6 border-t border-border">
                {["SOC 2", "GDPR", "PCI DSS"].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 rounded-full bg-white/8 text-xs font-medium text-muted-foreground"
                  >
                    {badge} Compliant
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
