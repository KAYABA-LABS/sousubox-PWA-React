export const lightTheme = {
  // Backgrounds
  bg: {
    primary: "bg-[#FBF6EF]",
    secondary: "bg-white",
    tertiary: "bg-gray-100",
    elevated: "bg-white",
    overlay: "bg-black/50",
  },

  // Text
  text: {
    primary: "text-[#0C0F14]",
    secondary: "text-gray-600",
    tertiary: "text-gray-500",
    muted: "text-gray-400",
    inverse: "text-white",
    link: "text-[#0D4F3C]",
  },

  // Borders
  border: {
    default: "border-gray-200",
    subtle: "border-gray-100",
    strong: "border-gray-300",
    focus: "border-[#0D4F3C]",
  },

  // Accent
  accent: {
    primary: "bg-[#0D4F3C]",
    primaryHover: "hover:bg-[#156B53]",
    primaryText: "text-white",
    secondary: "bg-gray-100",
    secondaryHover: "hover:bg-gray-200",
    secondaryText: "text-gray-700",
  },

  // Status
  status: {
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    error: "bg-red-50 text-red-500 border-red-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  },

  // Cards
  card: {
    bg: "bg-white",
    border: "border-gray-200",
    hover: "hover:border-emerald-300",
  },

  // Inputs
  input: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    focus: "focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20",
    text: "text-gray-900",
    placeholder: "placeholder:text-gray-400",
  },

  // Icons
  icon: {
    primary: "text-[#0D4F3C]",
    secondary: "text-gray-500",
    muted: "text-gray-400",
  },

  // Nav
  nav: {
    bg: "bg-white",
    border: "border-gray-200",
    active: "text-[#0D4F3C] bg-[#0D4F3C]/10",
    inactive: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  },

  // Dock
  dock: {
    bg: "bg-white",
    border: "border-gray-200",
    shadow: "shadow-lg shadow-black/5",
    active: "text-[#0D4F3C] bg-[#0D4F3C]/10",
    inactive: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
} as const;

export const darkTheme = {
  bg: {
    primary: "bg-[#0C0F14]",
    secondary: "bg-[#151A1F]",
    tertiary: "bg-[#2C2C2E]",
    elevated: "bg-[#151A1F]",
    overlay: "bg-black/60",
  },
  text: {
    primary: "text-white",
    secondary: "text-gray-400",
    tertiary: "text-gray-500",
    muted: "text-gray-600",
    inverse: "text-gray-900",
    link: "text-[#156B53]",
  },
  border: {
    default: "border-white/10",
    subtle: "border-white/5",
    strong: "border-white/20",
    focus: "border-[#156B53]",
  },
  accent: {
    primary: "bg-[#0D4F3C]",
    primaryHover: "hover:bg-[#156B53]",
    primaryText: "text-white",
    secondary: "bg-white/5",
    secondaryHover: "hover:bg-white/10",
    secondaryText: "text-white",
  },
  status: {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  card: {
    bg: "bg-[#151A1F]",
    border: "border-white/10",
    hover: "hover:bg-[#1A1F25]",
  },
  input: {
    bg: "bg-[#0C0F14]",
    border: "border-white/10",
    focus: "focus:border-[#156B53] focus:ring-2 focus:ring-[#156B53]/20",
    text: "text-white",
    placeholder: "placeholder:text-gray-500",
  },
  icon: {
    primary: "text-[#156B53]",
    secondary: "text-gray-400",
    muted: "text-gray-600",
  },
  nav: {
    bg: "bg-[#151A1F]",
    border: "border-white/10",
    active: "text-[#156B53] bg-[#0D4F3C]/15",
    inactive: "text-gray-400 hover:text-white hover:bg-white/5",
  },
  dock: {
    bg: "bg-[#1A1D24]",
    border: "border-white/5",
    shadow: "shadow-2xl shadow-black/40",
    active: "text-[#156B53] bg-[#0D4F3C]/15",
    inactive: "text-gray-400 hover:text-white hover:bg-white/5",
  },
} as const;

export type ThemeMode = "light" | "dark";

export type Theme = {
  bg: { primary: string; secondary: string; tertiary: string; elevated: string; overlay: string };
  text: { primary: string; secondary: string; tertiary: string; muted: string; inverse: string; link: string };
  border: { default: string; subtle: string; strong: string; focus: string };
  accent: { primary: string; primaryHover: string; primaryText: string; secondary: string; secondaryHover: string; secondaryText: string };
  status: { success: string; warning: string; error: string; info: string };
  card: { bg: string; border: string; hover: string };
  input: { bg: string; border: string; focus: string; text: string; placeholder: string };
  icon: { primary: string; secondary: string; muted: string };
  nav: { bg: string; border: string; active: string; inactive: string };
  dock: { bg: string; border: string; shadow: string; active: string; inactive: string };
};
