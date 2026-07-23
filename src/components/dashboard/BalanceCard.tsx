import { motion } from "framer-motion";
import { ArrowUp, Plus, Coins, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  available: number;
  onDeposit: () => void;
  onTransfer: () => void;
}

export function BalanceCard({
  available,
  onDeposit,
  onTransfer,
}: BalanceCardProps) {
  return (
    <Card className="px-5 pt-2 pb-4 border-0 bg-transparent shadow-none rounded-none">
      {/* Balance Display */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2">Est. Total Value (USD)</p>
        <div className="flex items-baseline gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white tracking-tight"
          >
            $
            {available.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.h1>
          <span className="text-sm font-medium text-[#00E660]">+2145%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-3">
        <ActionButton
          icon={Plus}
          label="Deposit"
          onClick={onDeposit}
          variant="primary"
        />
        <ActionButton
          icon={ArrowUp}
          label="Send"
          onClick={onTransfer}
          variant="secondary"
        />
        <ActionButton
          icon={Coins}
          label="Earn"
          onClick={() => {}}
          variant="secondary"
        />
        <ActionButton
          icon={MoreHorizontal}
          label="Swap"
          onClick={() => {}}
          variant="secondary"
        />
      </div>
    </Card>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant,
}: ActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 h-auto",
        "rounded-2xl p-4 transition-all duration-200",
        variant === "primary"
          ? "bg-[#0F1419] text-white hover:bg-[#1A1F25]"
          : "bg-[#0F1419]/40 hover:bg-[#0F1419]/60"
      )}
    >
      <Icon
        className={cn(
          "w-6 h-6",
          variant === "primary" ? "text-white" : "text-gray-400"
        )}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          "text-xs font-medium",
          variant === "primary" ? "text-white" : "text-gray-400"
        )}
      >
        {label}
      </span>
    </Button>
  );
}
