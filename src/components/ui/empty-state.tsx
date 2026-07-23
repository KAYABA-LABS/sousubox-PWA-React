"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <div className="text-emerald-600">{icon}</div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="bg-emerald-600 hover:bg-emerald-600/90 text-black font-semibold rounded-xl">
          {action.label}
        </Button>
      )}
    </div>
  );
}
