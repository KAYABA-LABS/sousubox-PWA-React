"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useGroupPoolService } from "@/services/groupPoolService";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { track } from "@/lib/analytics";
import { formatGhs } from "@/lib/pool-format";
import { depositHref } from "@/lib/safeRedirect";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { RepayGroupDebtResult } from "@/lib/api";
import { GP_DRAWER_CLASS, GPPrimaryButton, GPSecondaryButton } from "./ui";

/** `poolId` undefined = repay all, oldest first. */
export interface RepayTarget {
  poolId?: string;
  label: string;
  outstanding: number;
}

interface RepayDrawerProps {
  target: RepayTarget | null;
  availableBalance: number | null;
  /** Where the deposit flow returns to when the balance is empty. */
  returnTo: string;
  onClose: () => void;
  onRepaid: (result: RepayGroupDebtResult | null) => void;
}

export function RepayDrawer({ target, availableBalance, returnTo, onClose, onRepaid }: RepayDrawerProps) {
  const router = useRouter();
  const service = useGroupPoolService();
  const { userId } = useDatabaseUserId();
  const [repaying, setRepaying] = useState(false);

  const repay = async () => {
    if (!target) return;
    setRepaying(true);
    let result: RepayGroupDebtResult | null = null;
    try {
      result = await service.repayDebt(userId, target.poolId);
      track("group_debt_repaid", { poolId: target.poolId ?? "all" });
      toast.success(
        result.remainingOutstanding > 0
          ? `Repaid ${formatGhs(result.repaid)}. ${formatGhs(result.remainingOutstanding)} still to repay.`
          : `Repaid ${formatGhs(result.repaid)}. You're all clear.`
      );
      onClose();
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.code === "INSUFFICIENT_FUNDS") {
        onClose();
        router.push(depositHref(target.outstanding, returnTo));
      } else {
        toast.error(error.message);
      }
    }
    setRepaying(false);
    onRepaid(result);
  };

  const short = availableBalance !== null && availableBalance < (target?.outstanding ?? 0);

  return (
    <Drawer open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={GP_DRAWER_CLASS}>
        {target && (
          <div className="px-5 pb-8">
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="text-[#0C0F14] dark:text-white">Repay {target.label}</DrawerTitle>
              <DrawerDescription className="text-gray-500 dark:text-gray-400">
                {short
                  ? `We'll use your available balance (${formatGhs(availableBalance)}) towards the ${formatGhs(target.outstanding)} you owe.`
                  : `We'll pay ${formatGhs(target.outstanding)} from your available balance.`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-2 pt-2">
              {availableBalance !== null && availableBalance <= 0 ? (
                <GPPrimaryButton onClick={() => router.push(depositHref(target.outstanding, returnTo))}>Add funds</GPPrimaryButton>
              ) : (
                <GPPrimaryButton loading={repaying} onClick={repay}>
                  Repay now
                </GPPrimaryButton>
              )}
              <GPSecondaryButton disabled={repaying} onClick={onClose}>
                Cancel
              </GPSecondaryButton>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
