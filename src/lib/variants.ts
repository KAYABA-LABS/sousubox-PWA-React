import { tv } from "tailwind-variants";

// ── Button ───────────────────────────────────────────────────────────────────

export const btn = tv({
  base: "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  variants: {
    variant: {
      primary: "bg-[#00E660] hover:bg-[#00E660]/90 text-black focus-visible:ring-[#00E660]",
      secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 focus-visible:ring-white/20",
      destructive: "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500",
      ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
      link: "bg-transparent text-[#00E660] hover:text-[#00E660]/80 underline-offset-4 hover:underline p-0 h-auto",
      outline: "bg-transparent border border-white/10 text-white hover:bg-white/5 focus-visible:ring-white/20",
    },
    size: {
      sm: "h-9 px-3 text-xs rounded-lg",
      md: "h-11 px-4 text-sm rounded-xl",
      lg: "h-14 px-6 text-base rounded-xl",
      icon: "h-10 w-10 rounded-xl",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

// ── Input ────────────────────────────────────────────────────────────────────

export const input = tv({
  base: "w-full bg-[#1C2128] border text-white placeholder:text-gray-500 focus:outline-none transition-colors",
  variants: {
    variant: {
      default: "border-white/10 focus:border-[#00E660]/50 focus:ring-2 focus:ring-[#00E660]/20",
      error: "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
      success: "border-[#00E660]/50 focus:border-[#00E660] focus:ring-2 focus:ring-[#00E660]/20",
    },
    inputSize: {
      sm: "h-9 px-3 text-xs rounded-lg",
      md: "h-11 px-4 text-sm rounded-xl",
      lg: "h-14 px-4 text-base rounded-xl",
    },
  },
  defaultVariants: { variant: "default", inputSize: "md" },
});

// ── Card ─────────────────────────────────────────────────────────────────────

export const card = tv({
  base: "border rounded-2xl",
  variants: {
    variant: {
      default: "bg-[#1C2128] border-white/10",
      elevated: "bg-[#1C2128] border-white/10 shadow-xl shadow-black/20",
      interactive: "bg-[#1C2128] border-white/10 cursor-pointer hover:border-[#00E660]/30 transition-colors",
      outline: "bg-transparent border-white/10",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Badge ────────────────────────────────────────────────────────────────────

export const badge = tv({
  base: "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
  variants: {
    variant: {
      default: "bg-white/5 text-gray-400",
      primary: "bg-[#00E660]/10 text-[#00E660]",
      secondary: "bg-blue-500/10 text-blue-400",
      warning: "bg-yellow-500/10 text-yellow-400",
      destructive: "bg-red-500/10 text-red-400",
      success: "bg-[#00E660]/10 text-[#00E660]",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Tabs ─────────────────────────────────────────────────────────────────────

export const tabsList = tv({
  base: "flex border-b border-white/5",
});

export const tabsTrigger = tv({
  base: "flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
  variants: {
    variant: {
      default: "text-gray-500 hover:text-gray-300",
      active: "text-white border-b-2 border-[#00E660]",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Page ─────────────────────────────────────────────────────────────────────

export const page = tv({
  base: "min-h-screen bg-[#0C0F14] flex flex-col",
  variants: {
    padding: {
      none: "",
      default: "pb-32",
      tabs: "pb-24",
    },
  },
  defaultVariants: { padding: "default" },
});

// ── Section ──────────────────────────────────────────────────────────────────

export const section = tv({
  base: "px-5",
  variants: {
    spacing: {
      none: "",
      sm: "mt-4",
      md: "mt-6",
      lg: "mt-8",
    },
  },
  defaultVariants: { spacing: "md" },
});
