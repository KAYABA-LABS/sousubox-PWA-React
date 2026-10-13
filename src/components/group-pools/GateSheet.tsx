"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, Ban, LifeBuoy, Loader2, Wallet } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useGroupPoolService } from "@/services/groupPoolService";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { errorDataNumber, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import { formatGhs } from "@/lib/pool-format";
import { depositHref } from "@/lib/safeRedirect";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { MyGroupDebts } from "@/lib/api";
import { GP_DRAWER_CLASS, GPPrimaryButton, GPSecondaryButton } from "./ui";

/** Amount still needed for an INSUFFICIENT_FUNDS error, or null when unknown. */
export function fundsShortfall(error: Pick<ResolvedGroupPoolError, "data">, fallbackNeeded?: number) {
  const needed = errorDataNumber(error, "amountNeeded") ?? errorDataNumber(error, "joinAmount") ?? fallbackNeeded ?? null;
  if (needed === null) return null;
  const available = errorDataNumber(error, "availableBalance") ?? 0;
  return Math.max(0, needed - available);
}

interface GateSheetProps {
  error: ResolvedGroupPoolError | null;
  onClose: () => void;
  /** Used for the shortfall when the error payload lacks amounts. */
  joinAmount?: number;
  /** Where the deposit flow's "Continue" should bring the user back to. */
  returnTo?: string;
}

/** The blocking sheet for `sheet`-treatment errors (plan §7.1). */
export function GateSheet({ error, onClose, joinAmount, returnTo }: GateSheetProps) {
  const router = useRouter();
  const open = !!error?.sheet;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <DrawerContent className={GP_DRAWER_CLASS}>
        {error?.sheet === "KYC_REQUIRED" && (
          <SheetBody
            icon={<BadgeCheck className="w-6 h-6" />}
            title="Verify your ID to join"
            description="Group pools are open to verified members only. It takes a few minutes."
          >
            <GPPrimaryButton onClick={() => go("/kyc")}>Verify my ID</GPPrimaryButton>
            <GPSecondaryButton onClick={onClose}>Not now</GPSecondaryButton>
          </SheetBody>
        )}

        {error?.sheet === "OUTSTANDING_DEBT" && (
          <SheetBody
            icon={<Wallet className="w-6 h-6" />}
            title="Clear your balance first"
            description={
              errorDataNumber(error, "amountOwedBalance") !== null
                ? `You owe ${formatGhs(errorDataNumber(error, "amountOwedBalance"))} from missed payments. Add funds to clear it, then try again.`
                : "You have an unpaid balance from missed payments. Add funds to clear it, then try again."
            }
          >
            <GPPrimaryButton onClick={() => go(depositHref(errorDataNumber(error, "amountOwedBalance"), returnTo))}>
              Add funds
            </GPPrimaryButton>
            <GPSecondaryButton onClick={onClose}>Close</GPSecondaryButton>
          </SheetBody>
        )}

        {error?.sheet === "OUTSTANDING_GROUP_DEBT" && <GroupDebtBody onClose={onClose} onRepay={() => go("/pools/debts")} />}

        {error?.sheet === "INSUFFICIENT_FUNDS" && (
          <InsufficientFundsBody
            shortfall={fundsShortfall(error, joinAmount)}
            onDeposit={(amount) => go(depositHref(amount, returnTo))}
            onClose={onClose}
          />
        )}

        {error?.sheet === "LIMIT" && (
          <SheetBody icon={<Ban className="w-6 h-6" />} title="Limit reached" description={error.message}>
            <GPSecondaryButton onClick={onClose}>OK</GPSecondaryButton>
          </SheetBody>
        )}

        {error?.sheet === "ACCOUNT_NOT_ACTIVE" && (
          <SheetBody icon={<LifeBuoy className="w-6 h-6" />} title="Account not active" description={error.message}>
            <GPPrimaryButton onClick={() => go("/settings/help")}>Contact support</GPPrimaryButton>
            <GPSecondaryButton onClick={onClose}>Close</GPSecondaryButton>
          </SheetBody>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function SheetBody({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 pb-8">
      <DrawerHeader className="px-0 text-left">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2">
          {icon}
        </div>
        <DrawerTitle className="text-[#0C0F14] dark:text-white">{title}</DrawerTitle>
        <DrawerDescription className="text-gray-500 dark:text-gray-400">{description}</DrawerDescription>
      </DrawerHeader>
      <div className="space-y-2 pt-2">{children}</div>
    </div>
  );
}

function InsufficientFundsBody({
  shortfall,
  onDeposit,
  onClose,
}: {
  shortfall: number | null;
  onDeposit: (amount: number | null) => void;
  onClose: () => void;
}) {
  return (
    <SheetBody
      icon={<Wallet className="w-6 h-6" />}
      title="Add funds to continue"
      description={
        shortfall !== null && shortfall > 0
          ? `You need ${formatGhs(shortfall)} more in your balance. Add it and you'll come straight back here.`
          : "Your balance is too low for this. Add funds and you'll come straight back here."
      }
    >
      <GPPrimaryButton onClick={() => onDeposit(shortfall)}>
        {shortfall ? `Add ${formatGhs(shortfall)}` : "Add funds"}
      </GPPrimaryButton>
      <GPSecondaryButton onClick={onClose}>Not now</GPSecondaryButton>
    </SheetBody>
  );
}

function GroupDebtBody({ onClose, onRepay }: { onClose: () => void; onRepay: () => void }) {
  const service = useGroupPoolService();
  const { userId, ready } = useDatabaseUserId();
  const [debts, setDebts] = useState<MyGroupDebts | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    service
      .getMyDebts(userId)
      .then((result) => !cancelled && setDebts(result))
      .catch(() => !cancelled && setDebts({ totalOutstanding: 0, debts: [] }));
    return () => {
      cancelled = true;
    };
  }, [service, userId, ready]);

  return (
    <SheetBody
      icon={<AlertTriangle className="w-6 h-6" />}
      title="Repay your group debt first"
      description={
        debts && debts.totalOutstanding > 0
          ? groupPoolCopy.debtBlocker(debts.totalOutstanding)
          : "You have unpaid group pool debt. Repay it to join another pool."
      }
    >
      {debts === null ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
        </div>
      ) : (
        debts.debts.length > 0 && (
          <ul className="mb-2 divide-y divide-black/[0.06] dark:divide-white/10 rounded-2xl border border-black/[0.06] dark:border-white/10">
            {debts.debts.map((debt) => (
              <li key={debt.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-[#0C0F14] dark:text-white font-medium truncate pr-2">{debt.pool.name}</span>
                <span className="font-bold text-[#0C0F14] dark:text-white shrink-0">{formatGhs(debt.outstanding)}</span>
              </li>
            ))}
          </ul>
        )
      )}
      <GPPrimaryButton onClick={onRepay}>Go to my debts</GPPrimaryButton>
      <GPSecondaryButton onClick={onClose}>Close</GPSecondaryButton>
    </SheetBody>
  );
}
