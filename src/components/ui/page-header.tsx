"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, onBack, action, className }: PageHeaderProps) {
  return (
    <header role="banner" className={`px-5 pt-6 pb-4 ${className || ""}`}>
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
