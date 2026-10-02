import { Home, Users, TrendingUp, User, LucideIcon } from "lucide-react";
import { Dock as MotionDock, DockItem } from "@/components/motion/dock";
import { dock } from "@/lib/variants";

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
      <MotionDock size={48} className={`${dock()} gap-6 px-6`}>
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id || activeItem === item.href;

          return (
            <div key={item.id} className="flex flex-col items-center">
              <DockItem
                aria-label={item.label}
                active={isActive}
                onClick={() => onItemClick(item.href)}
                className={`w-12 h-12 rounded-full transition-colors ${isActive ? "bg-[#0D4F3C]" : ""}`}
              >
                <Icon
                  className={isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-500 dark:text-gray-400"}
                  strokeWidth={isActive ? 2 : 1.75}
                />
              </DockItem>
              <span
                aria-hidden="true"
                onClick={() => onItemClick(item.href)}
                className={`mt-3 text-[10px] leading-none font-medium cursor-pointer select-none ${
                  isActive ? "text-[#0D4F3C] dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </MotionDock>
    </div>
  );
};

