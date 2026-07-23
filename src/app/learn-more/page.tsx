"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Eye,
  LayoutDashboard,
  Users,
  CheckCircle2,
  Server,
  Fingerprint,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "Your funds are protected with military-grade 256-bit encryption and multi-layer authentication protocols. We use the same security standards as major financial institutions.",
  },
  {
    icon: Users,
    title: "Exclusive Community",
    description:
      "Join an invite-only platform with pre-approved members. We carefully curate our community to ensure a premium experience for all users.",
  },
  {
    icon: Zap,
    title: "Instant Transactions",
    description:
      "No waiting periods, no delays. Deposit funds instantly and see your balance update in real-time. Move money at the speed of modern finance.",
  },
  {
    icon: Eye,
    title: "Complete Transparency",
    description:
      "Track every transaction with crystal-clear visibility. No hidden fees, no surprises—just straightforward financial management.",
  },
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description:
      "A beautifully designed interface that makes managing money feel effortless. Access everything you need from a single, elegant dashboard.",
  },
  {
    icon: Lock,
    title: "Smart Controls",
    description:
      "Withdrawals unlock after your first $100 deposit, ensuring account security. Deposits are always instant and unrestricted.",
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit Encryption",
    description: "All data encrypted at rest and in transit",
  },
  {
    icon: Fingerprint,
    title: "Two-Factor Authentication",
    description: "Email OTP verification for secure access",
  },
  {
    icon: Server,
    title: "99.99% Uptime",
    description: "Enterprise-grade infrastructure",
  },
  {
    icon: CheckCircle2,
    title: "Zero Breaches",
    description: "Perfect security record since launch",
  },
];

export default function LearnMorePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#00E660] border px-3.5 py-1 rounded-full bg-[#00E660]/50">
              Premium Digital Banking
            </span>
            <h1 className="text-3xl md:text-5xl text-foreground mb-6">
              Modern Banking,{" "}
              <span className="text-gradient-green">Reimagined</span>
            </h1>
            <p className="text-sm md:text-base text-white/60 mb-8">
              Vaulta combines bank-level security with exceptional design to
              give you complete control over your finances. No hidden fees, no
              complexity—just a premium digital account built for the modern
              world.
            </p>
            <Link href="/signup">
              <Button
                variant="hero"
                size="xl"
                className="bg-[#00E660] text-black font-semibold rounded-2xl"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative py-24 md:py-32">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#00E660] border px-3.5 py-1 rounded-full bg-[#00E660]/50">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl text-foreground mb-4">
              Why Choose Vaulta?
            </h2>
            <p className="text-sm md:text-base text-white/60">
              Everything you need for modern financial management, all in one
              place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-card border border-border rounded-2xl p-6 md:p-8 transition-all duration-300 hover:bg-[#00E660]/10 hover:border-[#00E660]/45"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg md:text-xl text-foreground mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Highlight */}
      <section className="relative py-24 md:py-32 bg-card/30 overflow-hidden">
        {/* Radial background */}
        <div className="absolute right-8 top-200 w-120 h-150 md:right-30 md:top-1/2 transform md:-translate-y-1/2 md:w-200 md:h-200 rounded-full bg-[#00E660]/8 blur-3xl -z-10 pointer-events-none" />

        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#00E660] border px-3.5 py-1 rounded-full bg-[#00E660]/50">
              Security
            </span>
            <h2 className="text-3xl md:text-5xl text-foreground mb-4">
              Security You Can Trust
            </h2>
            <p className="text-sm md:text-base text-white/60">
              Built on enterprise-grade infrastructure with multiple layers of
              protection.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#101114]/80 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00E660]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#00E660]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 md:py-32">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#00E660] border px-3.5 py-1 rounded-full bg-[#00E660]/50">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl text-foreground mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-sm md:text-base text-white/60">
              Three simple steps to activate your premium digital account.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Request Access",
                  description:
                    "Enter your email to request an invitation. Approved users receive instant access to complete registration.",
                },
                {
                  step: "02",
                  title: "Activate Your Account",
                  description:
                    "Make an initial deposit of $100 to unlock full features, including withdrawals. This ensures account security and commitment.",
                },
                {
                  step: "03",
                  title: "Start Managing",
                  description:
                    "Access your dashboard to deposit, transfer, pay, and withdraw. Full control over your funds, available 24/7.",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="relative shrink-0 w-16 h-16">
                    <div className="absolute inset-0 rounded-2xl bg-secondary/50 border-2 border-transparent group-hover:border-primary/30 group-hover:bg-primary/10 transition-all duration-300" />
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-[#101114] group-hover:bg-[#00E660]/5">
                      <span className="text-2xl font-bold text-[#00E660]">
                        {step.step}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-base text-white/60">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto text-center"
          >
            <div className="absolute inset-0 bg-[#00E660]/10 blur-3xl rounded-3xl" />
            <div className="relative bg-[#101114] border border-border rounded-3xl p-8 md:p-16">
              <h2 className="text-3xl md:text-5xl text-foreground mb-4">
                Ready to Experience Premium Banking?
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto mb-8">
                Join the waitlist and discover a better way to manage your
                finances.
              </p>
              <Link href="/signup">
                <Button
                  variant="hero"
                  size="xl"
                  className="bg-[#00E660] text-black font-semibold rounded-2xl"
                >
                  Create Your Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required · Invite-only access
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
