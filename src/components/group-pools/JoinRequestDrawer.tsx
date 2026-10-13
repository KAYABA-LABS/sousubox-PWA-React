"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import type { GroupPoolPreview } from "@/lib/api";
import { MoneyBreakdown } from "./MoneyBreakdown";
import { ManualOrderList } from "./GroupPoolPreview";
import { GP_DRAWER_CLASS, GPPrimaryButton } from "./ui";

export const NOTE_MAX_LENGTH = 500;

export interface JoinRequestInput {
  acceptPayoutOrder: boolean;
  note: string;
}

interface JoinRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pool: GroupPoolPreview;
  myUserId?: string;
  submitting: boolean;
  /** Inline error from the server (e.g. CONSENT_REQUIRED); highlights the relevant box. */
  errorCode?: string | null;
  errorMessage?: string | null;
  onSubmit: (input: JoinRequestInput) => void;
}

export function canSubmitJoinRequest(consent: boolean, isManual: boolean, acceptOrder: boolean) {
  return consent && (!isManual || acceptOrder);
}

export function JoinRequestDrawer({
  open,
  onOpenChange,
  pool,
  myUserId,
  submitting,
  errorCode,
  errorMessage,
  onSubmit,
}: JoinRequestDrawerProps) {
  const [consent, setConsent] = useState(false);
  const [acceptOrder, setAcceptOrder] = useState(false);
  const [note, setNote] = useState("");

  const isManual = pool.payoutOrderType === "MANUAL";
  const myPosition = pool.manualOrder.find((entry) => entry.user.id === myUserId)?.position ?? null;
  const canSubmit = canSubmitJoinRequest(consent, isManual, acceptOrder);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={GP_DRAWER_CLASS}>
        <div className="overflow-y-auto px-5 pb-8">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle className="text-[#0C0F14] dark:text-white">Review your request</DrawerTitle>
            <DrawerDescription className="text-gray-500 dark:text-gray-400">{pool.name}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4">
            <MoneyBreakdown pool={pool} />

            <section
              className={cn(
                "rounded-2xl border p-4 space-y-3 bg-amber-50 dark:bg-amber-500/10",
                errorCode === "CONSENT_REQUIRED"
                  ? "border-red-400 dark:border-red-500"
                  : "border-amber-200 dark:border-amber-500/20"
              )}
            >
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#0C0F14] dark:text-white">{groupPoolCopy.consent.heading}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{groupPoolCopy.consent.summary}</p>
                  {pool.debtVisibilityNotice && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {pool.debtVisibilityNotice}
                    </p>
                  )}
                </div>
              </div>
              <CheckRow
                id="consent"
                checked={consent}
                onChange={setConsent}
                label={groupPoolCopy.consent.checkbox}
              />
            </section>

            {isManual && (
              <section
                className={cn(
                  "rounded-2xl border p-4 space-y-3",
                  errorCode === "ORDER_ACCEPTANCE_REQUIRED"
                    ? "border-red-400 dark:border-red-500"
                    : "border-black/[0.06] dark:border-white/10"
                )}
              >
                <p className="text-sm font-bold text-[#0C0F14] dark:text-white">Payout order</p>
                <ManualOrderList order={pool.manualOrder} myUserId={myUserId} />
                <CheckRow
                  id="accept-order"
                  checked={acceptOrder}
                  onChange={setAcceptOrder}
                  label={groupPoolCopy.manualOrderCheckbox(myPosition)}
                />
              </section>
            )}

            <section className="space-y-2">
              <label htmlFor="join-note" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Note to the moderator (optional)
              </label>
              <Textarea
                id="join-note"
                value={note}
                maxLength={NOTE_MAX_LENGTH}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Say who you are, e.g. how you know the group"
                className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
              />
              <p className="text-[10px] text-gray-400 text-right">
                {note.length}/{NOTE_MAX_LENGTH}
              </p>
            </section>

            {errorMessage && (
              <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <GPPrimaryButton
              disabled={!canSubmit}
              loading={submitting}
              onClick={() => onSubmit({ acceptPayoutOrder: isManual && acceptOrder, note: note.trim() })}
            >
              Send request
            </GPPrimaryButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CheckRow({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5 h-5 w-5 rounded-md border-[#0D4F3C] dark:border-[#156B53] data-[state=checked]:bg-[#0D4F3C] data-[state=checked]:text-white"
      />
      <label htmlFor={id} className="text-sm font-medium text-[#0C0F14] dark:text-white leading-snug cursor-pointer">
        {label}
      </label>
    </div>
  );
}
