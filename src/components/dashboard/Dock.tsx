import React from "react";
import { Home, Users, TrendingUp, User, LucideIcon } from "lucide-react";
import { Dock as MotionDock, DockItem, DockSeparator } from "@/components/motion/dock";

interface DockItemType {
  icon: LucideIcon;
  id: string;
  label: string;
  href: string;
}

interface DockProps {
  activeItem: string;
  onItemClick: (href: string) => void;
}

const dockItems: DockItemType[] = [
  { icon: Home, id: "home", label: "Home", href: "/dashboard" },
  { icon: Users, id: "pools", label: "Pools", href: "/pools" },
  { icon: TrendingUp, id: "invest", label: "Invest", href: "/invest" },
  { icon: User, id: "profile", label: "Profile", href: "/profile" },
];

export const Dock = ({ activeItem, onItemClick }: DockProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <MotionDock size={48} className="bg-white/90 backdrop-blur-xl border border-emerald-950/[0.06] shadow-[0_4px_16px_rgba(20,60,40,0.12),0_16px_40px_rgba(20,60,40,0.10)]">
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id || activeItem === item.href;

          return (
            <React.Fragment key={item.id}>
              {index === 3 && <DockSeparator className="bg-emerald-950/10" />}
              <DockItem
                aria-label={item.label}
                active={isActive}
                onClick={() => onItemClick(item.href)}
                className={`w-12 h-12 rounded-full transition-colors ${isActive ? "bg-emerald-700" : ""}`}
              >
                <Icon
                  className={isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-emerald-950/50"}
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </DockItem>
            </React.Fragment>
          );
        })}
      </MotionDock>
    </div>
  );
};

