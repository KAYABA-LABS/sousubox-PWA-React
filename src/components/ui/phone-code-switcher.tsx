"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface Country {
  name: string;
  code: string;
  iso: string;
}

export const COUNTRIES: Country[] = [
  { name: "Ghana", code: "+233", iso: "gh" },
  { name: "Nigeria", code: "+234", iso: "ng" },
  { name: "Kenya", code: "+254", iso: "ke" },
  { name: "Tanzania", code: "+255", iso: "tz" },
  { name: "Uganda", code: "+256", iso: "ug" },
  { name: "South Africa", code: "+27", iso: "za" },
  { name: "Senegal", code: "+221", iso: "sn" },
  { name: "Ivory Coast", code: "+225", iso: "ci" },
  { name: "Cameroon", code: "+237", iso: "cm" },
  { name: "Benin", code: "+229", iso: "bj" },
  { name: "Togo", code: "+228", iso: "tg" },
  { name: "Mali", code: "+223", iso: "ml" },
  { name: "Burkina Faso", code: "+226", iso: "bf" },
  { name: "Niger", code: "+227", iso: "ne" },
  { name: "Guinea", code: "+224", iso: "gn" },
  { name: "Rwanda", code: "+250", iso: "rw" },
  { name: "Ethiopia", code: "+251", iso: "et" },
  { name: "Egypt", code: "+20", iso: "eg" },
  { name: "Morocco", code: "+212", iso: "ma" },
  { name: "Tunisia", code: "+216", iso: "tn" },
  { name: "United States", code: "+1", iso: "us" },
  { name: "United Kingdom", code: "+44", iso: "gb" },
  { name: "Canada", code: "+1", iso: "ca" },
];

const getFlagUrl = (iso: string) => `https://flagcdn.com/w80/${iso}.png`;

interface PhoneCodeSwitcherProps {
  value: string;
  onChange: (code: string) => void;
}

export function PhoneCodeSwitcher({ value, onChange }: PhoneCodeSwitcherProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-14 px-3 ${theme.input.bg} border border-gray-200 rounded-xl hover:border-gray-300 transition-colors min-w-[100px]`}
      >
        <img
          src={getFlagUrl(selected.iso)}
          alt={selected.name}
          className="w-6 h-6 rounded-full object-cover"
          loading="eager"
        />
        <span className={`text-sm font-medium ${theme.text.primary}`}>{selected.code}</span>
        <ChevronDown className={`w-4 h-4 ${theme.text.muted} transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filtered.map((country) => (
                <button
                  key={country.code + country.iso}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                    country.code === selected.code && country.iso === selected.iso
                      ? "bg-emerald-50"
                      : ""
                  }`}
                >
                  <img
                    src={getFlagUrl(country.iso)}
                    alt={country.name}
                    className="w-6 h-6 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="text-sm text-gray-900 flex-1 text-left">{country.name}</span>
                  <span className="text-sm text-gray-500 font-medium">{country.code}</span>
                  {country.code === selected.code && country.iso === selected.iso && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
