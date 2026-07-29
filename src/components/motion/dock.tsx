"use client";

import React, { createContext, useContext, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, motionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const DockContext = createContext<{
  mouseX: any;
  size: number;
}>({
  mouseX: motionValue(Infinity),
  size: 44,
});

export interface DockProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

export function Dock({ children, className, size = 44 }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(Infinity);
  };

  return (
    <DockContext.Provider value={{ mouseX, size }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex items-end gap-3 p-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-300 hover:bg-white/15",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  "aria-label"?: string;
}

export function DockItem({
  children,
  className,
  onClick,
  active,
  "aria-label": ariaLabel,
}: DockItemProps) {
  const { mouseX, size } = useContext(DockContext);
  const ref = useRef<HTMLButtonElement & HTMLDivElement>(null);

  // macOS-style dock magnification calculation
  const distance = useTransform(mouseX, (val: number) => {
    const el = ref.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2 - (el.parentElement?.getBoundingClientRect().left || 0);
    return val - itemCenter;
  });

  // Scale bounds: standard size up to size * 1.5 when hovered
  const widthTransform = useTransform(distance, [-100, 0, 100], [size, size * 1.5, size]);
  const heightTransform = useTransform(distance, [-100, 0, 100], [size, size * 1.5, size]);

  const widthSpring = useSpring(widthTransform, {
    damping: 15,
    stiffness: 150,
    mass: 0.1,
  });
  const heightSpring = useSpring(heightTransform, {
    damping: 15,
    stiffness: 150,
    mass: 0.1,
  });

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      ref={ref as any}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: widthSpring,
        height: heightSpring,
      }}
      className={cn(
        "relative flex items-center justify-center rounded-2xl transition-colors duration-200 cursor-pointer select-none",
        active
          ? "bg-white/25 text-white"
          : "bg-white/5 hover:bg-white/15 text-white/70 hover:text-white",
        className
      )}
    >
      {/* Gliding Active Pill */}
      {active && (
        <motion.div
          layoutId="active-pill"
          className="absolute -bottom-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
      <div className="flex items-center justify-center w-full h-full scale-[1.1]">
        {children}
      </div>
    </Component>
  );
}

export interface DockSeparatorProps {
  className?: string;
}

export function DockSeparator({ className }: DockSeparatorProps) {
  return (
    <div
      className={cn(
        "w-[1px] h-8 bg-white/20 self-center mx-1",
        className
      )}
    />
  );
}
