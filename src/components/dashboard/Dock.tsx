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
      <MotionDock size={48} className="bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id || activeItem === item.href;

          return (
            <React.Fragment key={item.id}>
              {index === 3 && <DockSeparator className="bg-white/10" />}
              <DockItem
                aria-label={item.label}
                active={isActive}
                onClick={() => onItemClick(item.href)}
                className="w-12 h-12"
              >
                <Icon className="w-5 h-5 text-white" strokeWidth={isActive ? 2 : 1.5} />
              </DockItem>
            </React.Fragment>
          );
        })}
      </MotionDock>
    </div>
  );
};

