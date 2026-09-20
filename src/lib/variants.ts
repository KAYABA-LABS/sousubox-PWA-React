import { tv } from "tailwind-variants";

// ── Button ───────────────────────────────────────────────────────────────────

export const btn = tv({
  base: "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  variants: {
    variant: {
      primary: "bg-[#0D4F3C] hover:bg-[#156B53] text-white focus-visible:ring-[#0D4F3C] dark:focus-visible:ring-[#156B53]",
      secondary: "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[#0C0F14] dark:text-white border border-black/10 dark:border-white/10 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
      destructive: "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500",
      ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white",
      link: "bg-transparent text-[#0D4F3C] dark:text-[#156B53] hover:opacity-80 underline-offset-4 hover:underline p-0 h-auto",
      outline: "bg-transparent border border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
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
  base: "w-full bg-white dark:bg-[#0C0F14] border text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none transition-colors",
  variants: {
    variant: {
      default: "border-gray-200 dark:border-white/10 focus:border-[#0D4F3C]/50 dark:focus:border-[#156B53]/50 focus:ring-2 focus:ring-[#0D4F3C]/20 dark:focus:ring-[#156B53]/20",
      error: "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
      success: "border-[#0D4F3C]/50 dark:border-[#156B53]/50 focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:ring-2 focus:ring-[#0D4F3C]/20 dark:focus:ring-[#156B53]/20",
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
      default: "bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10",
      elevated: "bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20",
      interactive: "bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A1F25] transition-colors",
      outline: "bg-transparent border-gray-200 dark:border-white/10",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Badge ────────────────────────────────────────────────────────────────────

export const badge = tv({
  base: "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
  variants: {
    variant: {
      default: "bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400",
      primary: "bg-[#0D4F3C]/10 dark:bg-[#0D4F3C]/15 text-[#0D4F3C] dark:text-[#156B53]",
      secondary: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      destructive: "bg-red-500/10 text-red-600 dark:text-red-400",
      success: "bg-[#0D4F3C]/10 dark:bg-[#0D4F3C]/15 text-[#0D4F3C] dark:text-[#156B53]",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Tabs ─────────────────────────────────────────────────────────────────────

export const tabsList = tv({
  base: "flex border-b border-black/5 dark:border-white/5",
});

export const tabsTrigger = tv({
  base: "flex-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none",
  variants: {
    variant: {
      default: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
      active: "text-[#0C0F14] dark:text-white border-b-2 border-[#0D4F3C] dark:border-[#156B53]",
    },
  },
  defaultVariants: { variant: "default" },
});

// ── Page ─────────────────────────────────────────────────────────────────────

export const page = tv({
  base: "min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col text-[#0C0F14] dark:text-white",
  variants: {
    padding: {
      none: "",
      default: "pb-32",
      tabs: "pb-24",
    },
  },
  defaultVariants: { padding: "default" },
});

export const pageLoading = tv({
  base: "min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center",
});

// ── Dock ─────────────────────────────────────────────────────────────────────

export const dock = tv({
  base: "bg-white/90 dark:bg-[#1A1D24]/90 backdrop-blur-xl border border-gray-200/60 dark:border-white/5 shadow-[0_4px_16px_rgba(20,60,40,0.12)] dark:shadow-2xl dark:shadow-black/40",
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
