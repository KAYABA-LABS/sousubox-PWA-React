"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { lightTheme, darkTheme, type Theme, type ThemeMode } from "@/lib/theme";

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("sousuchain-theme") as ThemeMode | null;
    const initial = saved ?? "dark";
    setModeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("sousuchain-theme", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  const toggleTheme = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
