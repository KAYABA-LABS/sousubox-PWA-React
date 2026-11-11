"use client";

import { useState } from "react";
import { Check, Copy, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, ProgressBar } from "@/components/ds";
import type { UserReferral, UserStats } from "@/lib/api";
import { humanizeEnum } from "@/lib/format";

/** Plain-language label for a 0–1000 reputation score. */
function reputationLabel(score: number) {
  if (score >= 800) return "Excellent";
  if (score >= 650) return "Good";
  if (score >= 500) return "Fair";
  return "Building";
}

/** One figure in the reputation stats grid. */
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sb-tile bg-sb-surface-2 px-3 py-2.5">
      <p className="text-[16px] font-bold text-sb-ink tabular">{value}</p>
      <p className="mt-0.5 text-[12px] text-sb-ink-2">{label}</p>
    </div>
  );
}

/** Reputation score from the trust engine, with the stats behind it. */
export function ReputationCard({ stats }: { stats: UserStats }) {
  const score = Math.round(stats.reputationScore ?? 0);
  return (
    <Card>
      <CardHeader icon={Sparkles} title="Reputation" boxedIcon />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="text-[34px] leading-none font-bold tracking-[-0.02em] text-sb-ink tabular">{score}</p>
        <p className="text-[14px] font-semibold text-sb-brand-600">
          {reputationLabel(score)} · {humanizeEnum(stats.reputationTier)}
        </p>
      </div>
      <ProgressBar value={score} max={1000} label="Reputation score out of 1000" className="mt-3" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Reliability" value={`${Math.round(stats.reliabilityScore ?? 0)}%`} />
        <Stat label="Streak" value={`${stats.currentStreak} wks`} />
        <Stat label="Pools completed" value={stats.poolsCompleted} />
        <Stat label="Missed contributions" value={stats.missedContributions} />
      </div>
    </Card>
  );
}

/** Referral code with copy button and referral counts. */
export function InviteCard({ referral }: { referral: UserReferral }) {
  const [copied, setCopied] = useState(false);

  /** Copy the referral code to the clipboard. */
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      toast.success("Referral code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy code");
    }
  };

  return (
    <Card>
      <CardHeader icon={Gift} title="Invite friends" boxedIcon />
      <p className="mt-2 text-[14px] text-sb-ink-2">Share your code and grow your reputation.</p>
      <div className="mt-4 flex items-center justify-between gap-2 rounded-sb-tile border border-dashed border-sb-brand-600/40 bg-sb-surface-2 py-1.5 pr-1.5 pl-4">
        <span className="truncate font-mono text-[16px] font-bold tracking-wider text-sb-ink">{referral.referralCode}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy referral code"
          className="flex size-9 items-center justify-center rounded-lg text-sb-brand-600 hover:bg-sb-tint focus-visible:outline-2 focus-visible:outline-sb-brand-500"
        >
          {copied ? <Check className="size-4" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={1.75} />}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Friends referred" value={referral.referralCount} />
        <Stat label="Referral score" value={referral.referralReputationScore} />
      </div>
    </Card>
  );
}
