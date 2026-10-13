"use client";

import { useState } from "react";
import { ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { useGroupPoolService } from "@/services/groupPoolService";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import { GPPrimaryButton } from "./ui";

/**
 * Shown on forming MANUAL pools. The API can't yet say whether *this* member
 * must accept (backend request B3), so a NOTHING_TO_ACCEPT reply simply
 * confirms they're up to date.
 */
export function AcceptOrderBanner({ poolId, userId }: { poolId: string; userId: string }) {
  const service = useGroupPoolService();
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return null;

  const accept = async () => {
    setAccepting(true);
    try {
      await service.acceptOrder(userId, poolId);
      toast.success("Payout order accepted");
      setDone(true);
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.code === "NOTHING_TO_ACCEPT") {
        toast("You're up to date — nothing new to accept.");
        setDone(true);
      } else {
        toast.error(error.message);
      }
    }
    setAccepting(false);
  };

  return (
    <div className="rounded-[24px] bg-[#0D4F3C]/5 dark:bg-[#156B53]/10 border border-[#0D4F3C]/15 dark:border-[#156B53]/25 p-5">
      <div className="flex items-start gap-3">
        <ListOrdered className="w-5 h-5 text-[#0D4F3C] dark:text-emerald-300 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#0C0F14] dark:text-white">The moderator sets the payout order</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            If your position has changed, accept the new order. The pool can&apos;t start until every member has.
          </p>
        </div>
      </div>
      <GPPrimaryButton className="mt-4 h-12" loading={accepting} onClick={accept}>
        Accept payout order
      </GPPrimaryButton>
    </div>
  );
}
