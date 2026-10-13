"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberAvatar } from "@/components/pools/MemberAvatar";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { formatDate, memberName } from "@/lib/pool-format";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { GroupPoolMember } from "@/lib/groupPoolMembers";
import { GPCard, GPChip } from "../ui";

interface MembersTabProps {
  poolId: string;
  userId: string;
  /** Removal is only allowed while FORMING. */
  canRemove: boolean;
  onChanged: () => void;
}

export function MembersTab({ poolId, userId, canRemove, onChanged }: MembersTabProps) {
  const service = useGroupPoolService();
  const [members, setMembers] = useState<GroupPoolMember[] | null>(null);
  const [removing, setRemoving] = useState<GroupPoolMember | null>(null);
  const [reason, setReason] = useState("");

  const reload = useCallback(() => {
    service.getPoolMembers(poolId).then(setMembers, (err) => {
      toast.error(resolveGroupPoolError(err).message);
      setMembers((prev) => prev ?? []);
    });
  }, [service, poolId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = async () => {
    if (!removing) return;
    const target = removing;
    try {
      await service.removeMember(userId, poolId, target.userId, reason.trim() || undefined);
      track("group_member_removed", { poolId });
      toast.success(`${memberName(target.user)} was removed and refunded`);
    } catch (err) {
      toast.error(resolveGroupPoolError(err).message);
    }
    setRemoving(null);
    setReason("");
    reload();
    onChanged();
  };

  if (members === null) return <Skeleton className="h-48 w-full rounded-[24px] bg-black/5 dark:bg-white/5" />;

  return (
    <GPCard className="p-0 overflow-hidden">
      {members.length === 0 ? (
        <p className="p-5 text-sm text-gray-500 dark:text-gray-400 text-center">No members yet.</p>
      ) : (
        <ul className="divide-y divide-black/[0.05] dark:divide-white/5">
          {members.map((member) => {
            const isModerator = member.role === "MODERATOR";
            return (
              <li key={member.userId} className="flex items-center gap-3 px-5 py-3">
                <MemberAvatar user={member.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C0F14] dark:text-white truncate">{memberName(member.user)}</p>
                  {member.joinedAt && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Joined {formatDate(member.joinedAt)}</p>
                  )}
                </div>
                {isModerator ? (
                  <GPChip tone="primary">Moderator</GPChip>
                ) : (
                  canRemove && (
                    <button
                      onClick={() => setRemoving(member)}
                      className="text-xs font-bold text-red-600 dark:text-red-400 px-2 py-1"
                    >
                      Remove
                    </button>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">
              Remove {removing ? memberName(removing.user) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>They&apos;ll get a full refund, including their joining fee.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            placeholder="Reason (optional)"
            className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep member</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700 text-white">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GPCard>
  );
}
