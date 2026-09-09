"use client";

import { tv } from "tailwind-variants";

const statCard = tv({
  base: "bg-white border border-gray-200 rounded-2xl p-4",
  variants: {
    interactive: {
      true: "cursor-pointer hover:border-emerald-200 transition-colors",
    },
  },
});

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ icon, label, value, color = "#0D4F3C", interactive, onClick }: StatCardProps) {
  return (
    <div className={statCard({ interactive })} onClick={onClick}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
