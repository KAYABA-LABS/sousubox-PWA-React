export const lightTheme = {
  // Backgrounds
  bg: {
    primary: "bg-gray-50",
    secondary: "bg-white",
    tertiary: "bg-gray-100",
    elevated: "bg-white",
    overlay: "bg-black/50",
  },

  // Text
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    tertiary: "text-gray-500",
    muted: "text-gray-400",
    inverse: "text-white",
    link: "text-emerald-600",
  },

  // Borders
  border: {
    default: "border-gray-200",
    subtle: "border-gray-100",
    strong: "border-gray-300",
    focus: "border-emerald-600",
  },

  // Accent
  accent: {
    primary: "bg-emerald-600",
    primaryHover: "hover:bg-emerald-700",
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
    primary: "text-emerald-600",
    secondary: "text-gray-500",
    muted: "text-gray-400",
  },

  // Nav
  nav: {
    bg: "bg-white",
    border: "border-gray-200",
    active: "text-emerald-600 bg-emerald-50",
    inactive: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  },

  // Dock
  dock: {
    bg: "bg-white",
    border: "border-gray-200",
    shadow: "shadow-lg shadow-black/5",
    active: "text-emerald-600 bg-emerald-50",
    inactive: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
  },
} as const;

export const darkTheme = {
  bg: {
    primary: "bg-[#0C0F14]",
    secondary: "bg-[#1C2128]",
    tertiary: "bg-[#2C2C2E]",
    elevated: "bg-[#1C2128]",
    overlay: "bg-black/60",
  },
  text: {
    primary: "text-white",
    secondary: "text-gray-400",
    tertiary: "text-gray-500",
    muted: "text-gray-600",
    inverse: "text-gray-900",
    link: "text-emerald-400",
  },
  border: {
    default: "border-white/10",
    subtle: "border-white/5",
    strong: "border-white/20",
    focus: "border-emerald-400",
  },
  accent: {
    primary: "bg-[#00E660]",
    primaryHover: "hover:bg-[#00E660]/90",
    primaryText: "text-[#0C0F14]",
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
    bg: "bg-[#1C2128]",
    border: "border-white/10",
    hover: "hover:border-emerald-400/30",
  },
  input: {
    bg: "bg-[#2C2C2E]",
    border: "border-white/10",
    focus: "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20",
    text: "text-white",
    placeholder: "placeholder:text-gray-500",
  },
  icon: {
    primary: "text-[#00E660]",
    secondary: "text-gray-400",
    muted: "text-gray-600",
  },
  nav: {
    bg: "bg-[#1C2128]",
    border: "border-white/10",
    active: "text-[#00E660] bg-[#00E660]/10",
    inactive: "text-gray-400 hover:text-white hover:bg-white/5",
  },
  dock: {
    bg: "bg-[#1A1D24]",
    border: "border-white/5",
    shadow: "shadow-2xl shadow-black/40",
    active: "text-[#00E660] bg-[#00E660]/10",
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
