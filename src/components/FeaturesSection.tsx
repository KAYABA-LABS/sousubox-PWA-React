"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, Eye, LayoutDashboard, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    tag: "Security",
    title: "Bank-Level Security",
    description:
      "Your funds are protected with military-grade encryption and multi-layer authentication protocols.",
    gridArea: "1 / 1 / 2 / 3",
    height: "255px",
  },
  {
    icon: Users,
    tag: "Access",
    title: "Invite-Only Access",
    description:
      "Join an exclusive community of users. Only pre-approved members can create accounts.",
    gridArea: "1 / 3 / 2 / 4",
    height: "285px",
  },
  {
    icon: Lock,
    tag: "Control",
    title: "Controlled Withdrawals",
    description:
      "Withdrawals unlock after your first $100 deposit. Your money, your pace.",
    gridArea: "2 / 1 / 3 / 2",
    height: "255px",
    hideOnMobile: true,
  },
  {
    icon: Eye,
    tag: "Transparency",
    title: "Real-Time Balances",
    description:
      "Watch your money move in real-time. Every transaction, instantly visible.",
    gridArea: "2 / 2 / 3 / 3",
    height: "255px",
  },
  {
    icon: LayoutDashboard,
    tag: "Experience",
    title: "Modern Dashboard",
    description:
      "A beautifully designed interface that makes managing money feel effortless.",
    gridArea: "2 / 3 / 3 / 4",
    height: "235px",
  },
];

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ gridArea: feature.gridArea }}
    >
      <Card className="group relative bg-card border border-border rounded-2xl p-6 md:p-8 transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-600/45 h-auto md:h-full">
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative h-full flex flex-col">
        <div className="mb-4">
          <Icon className="w-8 h-8 text-emerald-600" />
        </div>
        {/* Title */}
        <h3 className="font-semibold text-lg md:text-xl text-foreground mb-3">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
      </Card>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  // Simpler responsive approach:
  // - On md+ use a 3-column, 2-row grid with equal row heights so the bento layout looks consistent.
  // - On mobile fallback, the stacked single-column grid is used (see md:hidden block below).
  const GRID_GAP = 24; // px (matches md:gap-6)

  const gridStyle: React.CSSProperties = {
    width: "100%",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "1fr 1fr", // two equal rows
    gap: `${GRID_GAP}px`,
  };

  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-emerald-600 border px-3.5 py-1 rounded-full bg-emerald-500">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-gray-900/60">
            A complete financial toolkit designed for clarity, security, and
            control.
          </p>
        </motion.div>

        {/* Bento Grid - card layout with fixed container and computed rows (card layout only) */}
        <div
          className="hidden md:grid mx-auto"
          style={gridStyle}
          aria-label="features-bento-grid"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* mobile fallback: simple stacked layout */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {features
            .filter((f) => !f.hideOnMobile)
            .map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
        </div>
      </div>
    </section>
  );
};
