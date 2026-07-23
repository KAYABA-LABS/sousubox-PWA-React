import { motion } from "framer-motion";
import { Home, Users, TrendingUp, User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DockItem {
  icon: LucideIcon;
  id: string;
  label: string;
  href: string;
}

interface DockProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

const dockItems: DockItem[] = [
  { icon: Home, id: "home", label: "Home", href: "/dashboard" },
  { icon: Users, id: "pools", label: "Pools", href: "/pools" },
  { icon: TrendingUp, id: "invest", label: "Invest", href: "/invest" },
  { icon: User, id: "profile", label: "Profile", href: "/profile" },
];

export const Dock = ({ activeItem, onItemClick }: DockProps) => {
  return (
    <motion.nav
      role="navigation"
      aria-label="Main navigation"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-1 p-2",
          "bg-white",
          "border border-gray-200",
          "rounded-2xl",
          "shadow-2xl shadow-gray-300/40"
        )}
      >
        {dockItems.map((item) => (
          <DockButton
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => onItemClick(item.href)}
          />
        ))}
      </div>
    </motion.nav>
  );
};

interface DockButtonProps {
  item: DockItem;
  isActive: boolean;
  onClick: () => void;
}

const DockButton = ({ item, isActive, onClick }: DockButtonProps) => {
  const Icon = item.icon;

  return (
    <Button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2",
        "px-4 py-2.5 rounded-xl h-auto",
        "transition-all duration-300",
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
      )}
      aria-label={item.label}
    >
      <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
      {isActive && (
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          className="text-sm font-medium overflow-hidden whitespace-nowrap"
        >
          {item.label}
        </motion.span>
      )}
    </Button>
  );
};
