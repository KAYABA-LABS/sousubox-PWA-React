"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Security", href: "#security" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#00E660] flex items-center justify-center">
            <span className="text-black font-bold text-lg">V</span>
          </div>
          <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            Vaulta
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm font-medium cursor-pointer text-white/60 hover:text-[#00E660] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex cursor-pointer hover:text-[#00E660] transition-colors"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="default"
              size="sm"
              className="px-4 py-3 cursor-pointer bg-[#00E660] text-black font-semibold rounded-xl"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};
