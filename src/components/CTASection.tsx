"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Strategic radial gradient effects with #00E660 */}
      {/* <div className="absolute top-[-5%] left-[25%] w-[700px] h-[700px] rounded-full bg-emerald-600/14 blur-[115px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[20%] w-[650px] h-[650px] rounded-full bg-emerald-50 blur-[105px] pointer-events-none" />
      <div className="absolute top-[50%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-600/6 blur-[95px] pointer-events-none" /> */}

      <div className="absolute -right-2 md:right-60 top-1/2 transform -translate-y-1/2 w-180 md:w-260 h-76 md:h-100 rounded-full bg-emerald-50 blur-3xl -z-10 pointer-events-none" />

      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow */}
          {/* <div className="absolute inset-0 bg-emerald-50 blur-3xl rounded-3xl animate-pulse" /> */}

          {/* Card */}
          <Card className="relative bg-white/80 border border-border rounded-3xl p-8 md:p-16 text-center shadow-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl text-foreground mb-4"
            >
              Ready to Take Control?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm md:text-bas8 text-gray-900/60 max-w-xl mx-auto mb-8"
            >
              Join the waitlist for your premium digital account. Limited spots
              available.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="hero"
                size="xl"
                className="w-full sm:w-auto cursor-pointer group font-semibold bg-emerald-600 hover:bg-emerald-600/90 text-black"
              >
                Request Access
                <ArrowRight className="w-4 h-4 font-semibold transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              No credit card required · Cancel anytime
            </motion.p>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
