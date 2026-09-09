"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "How do I get access to Vaulta?",
    answer:
      "Vaulta is currently invite-only. You can request access by entering your email on our signup page. If your name is on our pre-approved list, you'll receive an invitation to complete your registration.",
  },
  {
    question: "Why is there a $100 deposit requirement?",
    answer:
      "The $100 initial deposit activates your full account features and unlocks withdrawals. This helps ensure account security and demonstrates commitment to using the platform. You can deposit this amount in any way that's convenient for you.",
  },
  {
    question: "When can I withdraw my funds?",
    answer:
      "Withdrawals are unlocked once you've made a cumulative deposit of $100 or more. Before this threshold, deposits are always allowed, but withdrawals remain restricted. This is designed to protect your account and ensure full activation.",
  },
  {
    question: "How secure is my money with Vaulta?",
    answer:
      "Your funds are protected with 256-bit encryption, the same security standard used by major banks. We use two-factor authentication, secure infrastructure with 99.99% uptime, and continuous 24/7 monitoring. We've never had a security breach.",
  },
  {
    question: "What can I do with my Vaulta account?",
    answer:
      "Once activated, you can deposit funds, transfer to other accounts, make payments, and withdraw to external accounts. You'll have a real-time dashboard showing your balances, pending transactions, and complete activity history.",
  },
  {
    question: "Are there any fees?",
    answer:
      "We believe in transparent pricing. There are no hidden fees, no monthly maintenance charges, and no minimum balance requirements. Specific transaction fees, if any, are clearly displayed before you confirm any action.",
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="faq"
      className="relative py-24 md:py-32 bg-card/30 overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-medium text-primary mb-4 uppercase tracking-wider border-emerald-600 border px-3.5 py-1 rounded-full bg-emerald-500">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-5xl text-foreground mb-4">Questions? Answered.</h2>
          <p className="text-sm md:text-base text-gray-900/60">
            Everything you need to know about getting started with Vaulta.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-0 p-0"
              >
                <Card className="bg-card/80 border border-border rounded-xl px-6 data-[state=open]:border-emerald-200 data-[state=open]:shadow-lg data-[state=open]:shadow-[#0D4F3C]/10 transition-all">
                  <AccordionTrigger className="text-left text-foreground cursor-pointer hover:text-emerald-600 hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-900/60 pb-5">
                    {faq.answer}
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
