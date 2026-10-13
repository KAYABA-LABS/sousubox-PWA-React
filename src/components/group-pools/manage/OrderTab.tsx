"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { memberName } from "@/lib/pool-format";
import { initialOrder, moveItem } from "@/lib/groupPoolOrder";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { GroupPoolMember } from "@/lib/groupPoolMembers";
import type { ModeratedPool } from "@/lib/api";
import { GPCard, GPChip, GPPrimaryButton } from "../ui";

interface OrderTabProps {
  pool: ModeratedPool;
  userId: string;
  onChanged: () => void;
}

/** MANUAL payout order editor (plan decision 19). "Needs to accept" chips wait on backend request B3. */
export function OrderTab({ pool, userId, onChanged }: OrderTabProps) {
  const service = useGroupPoolService();
  const [order, setOrder] = useState<GroupPoolMember[] | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      service.getPoolMembers(pool.id),
      // The invite preview is the only place the saved manual order is exposed.
      pool.inviteCode ? service.getPreview(userId, pool.inviteCode).catch(() => null) : Promise.resolve(null),
    ]).then(
      ([members, preview]) => {
        const next = initialOrder(members, preview?.manualOrder);
        setOrder(next);
        setSaved(next.map((m) => m.userId));
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setOrder((prev) => prev ?? []);
      }
    );
  }, [service, pool.id, pool.inviteCode, userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (order === null) return <Skeleton className="h-64 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />;

  const dirty = order.map((m) => m.userId).join() !== saved.join();

  const save = async () => {
    setSaving(true);
    try {
      const result = await service.setOrder(userId, pool.id, order.map((m) => m.userId));
      track("group_order_saved", { poolId: pool.id, changedMembers: result.changedMembers });
      toast.success(
        result.changedMembers > 0
          ? `Order saved. ${result.changedMembers} ${result.changedMembers === 1 ? "member needs" : "members need"} to accept their new position.`
          : "Order saved."
      );
      setSaved(order.map((m) => m.userId));
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
      load();
    }
    setSaving(false);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <GPCard className="p-0 overflow-hidden">
        <p className="px-5 pt-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Members are paid in this order. Anyone whose position changes has to accept it, and the pool can&apos;t start until
          everyone has.
        </p>
        {order.length === 0 ? (
          <p className="p-5 text-sm text-gray-500 dark:text-gray-400 text-center">No members yet.</p>
        ) : (
          <ol className="mt-3 divide-y divide-black/[0.05] dark:divide-white/5" aria-label="Payout order">
            {order.map((member, index) => (
              <li key={member.userId} className="flex items-center gap-3 px-5 py-2.5">
                <span className="w-6 text-center text-sm font-bold text-gray-500 dark:text-gray-400">{index + 1}</span>
                <MemberAvatar user={member.user} size="sm" />
                <span className="flex-1 min-w-0 text-sm font-semibold text-[#0C0F14] dark:text-white truncate">
                  {memberName(member.user)}
                </span>
                {member.role === "MODERATOR" && <GPChip tone="primary">You</GPChip>}
                <div className="flex gap-1">
                  <button
                    onClick={() => setOrder(moveItem(order, index, -1))}
                    disabled={index === 0}
                    aria-label={`Move ${memberName(member.user)} up`}
                    className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOrder(moveItem(order, index, 1))}
                    disabled={index === order.length - 1}
                    aria-label={`Move ${memberName(member.user)} down`}
                    className="w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </GPCard>
      <GPPrimaryButton disabled={!dirty} loading={saving} onClick={save}>
        Save order
      </GPPrimaryButton>
    </div>
  );
}
