"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RippleGrid from "./ui/RippleGrid";
import {
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen lg:min-h-[120vh] flex items-center justify-center lg:overflow-visible pt-16">
      {/* RippleGrid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <RippleGrid
          enableRainbow={false}
          gridColor="#ffffff"
          rippleIntensity={0.05}
          gridSize={10}
          gridThickness={15}
          fadeDistance={1000}
          vignetteStrength={0.3}
          glowIntensity={0.2}
          opacity={0.8}
          gridRotation={0}
          mouseInteraction={true}
          mouseInteractionRadius={1.2}
        />
      </div>

      {/* Hero glow effect */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-emerald-200 bg-emerald-50 text-sm font-medium text-muted-foreground">
              <Shield className="w-4 h-4 text-emerald-600 mr-1.5" />
              Invite-Only Access
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-8xl md:text-display text-foreground mb-6"
          >
            Your Premium{" "}
            <span className="bg-linear-to-r from-[#00E660] to-[#00cc55] bg-clip-text text-transparent">
              Digital Account
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-body-lg text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            A modern, secure space to manage your funds with clarity and
            confidence. Bank-level security meets exceptional design.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <Button
                variant="hero"
                size="xl"
                className="w-full sm:w-auto cursor-pointer group border bg-emerald-600 text-black font-semibold rounded-2xl"
              >
                Create Account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button
                variant="hero-outline"
                size="xl"
                className="w-full sm:w-auto cursor-pointer border border-white/20 rounded-2xl"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Instant Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
              <span>Real-Time Balances</span>
            </div>
          </motion.div>

          {/* Product Mockup - Commented out for cleaner hero section */}
          {/* 
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-16 md:mt-20 relative"
          >
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-3xl" />

              <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Available Balance
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-foreground">
                      $24,850.00
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {["Deposit", "Transfer", "Pay", "Withdraw"].map((action) => (
                    <button
                      key={action}
                      className="bg-secondary/30 border border-border rounded-xl p-4 text-center hover:bg-primary/10 hover:border-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {action}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    Recent Activity
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Direct Deposit",
                        amount: "+$2,500.00",
                        date: "Today",
                      },
                      {
                        name: "Transfer to Savings",
                        amount: "-$500.00",
                        date: "Yesterday",
                      },
                      {
                        name: "Subscription Payment",
                        amount: "-$12.99",
                        date: "Dec 28",
                      },
                    ].map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            tx.amount.startsWith("+")
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {tx.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          */}
        </div>
      </div>
    </section>
  );
};
