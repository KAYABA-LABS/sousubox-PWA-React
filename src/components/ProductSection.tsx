"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";

export const ProductSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Subtle radial background accents */}
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-[#0D4F3C] dark:border-[#156B53] border px-3.5 py-1 rounded-full bg-[#0D4F3C]/50 dark:bg-[#156B53]/50">
            Product
          </span>
          <h2 className="text-3xl md:text-5xl text-foreground mb-4">
            Designed for Clarity
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-white/60">
            Every detail crafted to give you complete visibility and control
            over your finances.
          </p>
        </motion.div>

        {/* Product showcase */}
        <div className="space-y-24">
          {/* Feature 1 - Balance Clarity */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 lg:order-1">
              <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider text-[#0D4F3C] dark:text-[#156B53]">
                Balance View
              </span>
              <h3 className="text-2xl md:text-3xl text-foreground mb-4 text-white">
                Know Your Numbers
              </h3>
              <p className="text-sm md:text-base text-white/60 mb-6">
                See your available and pending balances at a glance. No
                confusion, no hidden amounts—just clear, real-time visibility
                into your funds.
              </p>
              <ul className="space-y-3 text-sm md:text-base">
                {[
                  "Available balance prominently displayed",
                  "Pending transactions clearly separated",
                  "USD as primary currency",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D4F3C]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-3xl" />
              <Card className="relative bg-[#101114] border border-white/20 rounded-2xl p-8">
              {/* Local radial background covering this feature block */}
                <div className="absolute top-20 right-25 md:right-40 md:top-0 md:-translate-x-1/2 translate-y-1 md:-translate-y-1 w-60 h-15 md:w-40 md:h-40 rounded-full bg-[#0D4F3C] blur-[140px] pointer-events-none -z-10" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Available</span>
                    <span className="text-2xl font-bold text-foreground">
                      $24,850.00
                    </span>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">Pending</span>
                    <span className="text-xl font-medium text-white/80">
                      $500.00
                    </span>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      Account Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D4F3C] dark:text-[#156B53]">
                      <div className="w-2 h-2 rounded-full bg-[#0D4F3C] animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Feature 2 - Transaction Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <Card className="relative bg-[#101114] border border-white/20 rounded-2xl p-8">
              {/* Local radial background covering this feature block */}
              <div className="absolute right-35 top-25 w-35 h-50 md:right-40 md:top-0 md:-translate-x-10 md:translate-y-20 md:w-50 md:h-50 rounded-full bg-[#0D4F3C] blur-[140px] pointer-events-none -z-10" />
              <div className="relative rounded-2xl p-2">
                <p className="text-sm font-medium text-foreground mb-4">
                  Activity
                </p>
                <div className="space-y-4">
                  {[
                    {
                      name: "Direct Deposit",
                      type: "Payroll",
                      amount: "+$2,500.00",
                      status: "Completed",
                    },
                    {
                      name: "Transfer",
                      type: "To Savings",
                      amount: "-$500.00",
                      status: "Pending",
                    },
                    {
                      name: "Payment",
                      type: "Subscription",
                      amount: "-$12.99",
                      status: "Completed",
                    },
                    {
                      name: "Deposit",
                      type: "Manual",
                      amount: "+$100.00",
                      status: "Completed",
                    },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/15 hover:bg-secondary/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {tx.name}
                        </p>
                        <p className="text-xs text-white/60">{tx.type}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            tx.amount.startsWith("+")
                              ? "text-[#0D4F3C] dark:text-[#156B53]"
                              : "text-white"
                          }`}
                        >
                          {tx.amount}
                        </p>
                        <p
                          className={`text-xs ${
                            tx.status === "Pending"
                              ? "text-yellow-500"
                              : "text-white/60"
                          }`}
                        >
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <div>
              <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider text-[#0D4F3C] dark:text-[#156B53]">
                Transactions
              </span>
              <h3 className="text-2xl md:text-3xl text-white mb-4">Track Every Movement</h3>
              <p className="text-sm md:text-base text-white/60 mb-6">
                Every deposit, transfer, and payment is logged and visible in
                real-time. Search, filter, and understand exactly where your
                money goes.
              </p>
              <ul className="space-y-3 text-sm md:text-base">
                {[
                  "Real-time transaction updates",
                  "Clear status indicators",
                  "Searchable history",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D4F3C]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
