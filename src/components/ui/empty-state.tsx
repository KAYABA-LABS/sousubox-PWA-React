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
      <div className="w-16 h-16 rounded-full bg-sb-brand-800/10 flex items-center justify-center mb-4">
        <div className="text-sb-brand-600">{icon}</div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="bg-sb-brand-800 hover:bg-sb-brand-700 text-white font-semibold rounded-xl">
          {action.label}
        </Button>
      )}
    </div>
  );
}
