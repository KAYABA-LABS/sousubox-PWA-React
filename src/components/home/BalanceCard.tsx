import Link from "next/link";
import { ArrowUpRight, Plus, Send, Wallet } from "lucide-react";
import { LinkButton, Skeleton } from "@/components/ds";
import type { UserCheckingAccount } from "@/lib/api";
import { formatGHS } from "@/lib/format";

interface BalanceCardProps {
  account: UserCheckingAccount | null;
  isLoading: boolean;
}

/** Round outlined icon action on the balance card. */
function CircleAction({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Send }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
    >
      <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
    </Link>
  );
}

/** One line of the balance breakdown, with a proportional bar. */
function BreakdownRow({ label, amount, total, tone }: { label: string; amount: number; total: number; tone: string }) {
  const pct = total > 0 ? Math.max(2, (amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold text-white tabular">{formatGHS(amount)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${amount > 0 ? pct : 0}%` }} />
      </div>
    </div>
  );
}

/** Dark green account card: available balance, actions and where the money sits. */
export function BalanceCard({ account, isLoading }: BalanceCardProps) {
  const available = Number(account?.availableBalance ?? 0);
  const locked = Number(account?.lockedBalance ?? 0);
  const owed = Number(account?.amountOwedBalance ?? 0);
  const total = available + locked + owed;

  return (
    <section aria-labelledby="balance-label" className="grid gap-8 rounded-sb-hero bg-sb-hero p-6 text-white shadow-sb-pop sm:p-7 md:grid-cols-[1fr_1fr]">
      <div className="flex flex-col">
        <p id="balance-label" className="flex items-center gap-2.5 text-[14px] text-white/85">
          <Wallet aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
          Available balance
        </p>
        {isLoading ? (
          <Skeleton className="mt-4 h-11 w-64 bg-white/10" />
        ) : (
          <p className="mt-3 text-[2.5rem] leading-none font-bold tracking-[-0.03em] tabular sm:text-[2.75rem]">{formatGHS(available)}</p>
        )}
        <p className="mt-3 text-[13px] text-white/65">Ready to save, send or contribute.</p>
        <div className="mt-6 flex items-center gap-3 md:mt-auto">
          <LinkButton href="/deposit" variant="light" icon={Plus} className="h-10 px-4">
            Add money
          </LinkButton>
          <CircleAction href="/withdraw" label="Withdraw" icon={ArrowUpRight} />
          <CircleAction href="/transfer" label="Send money" icon={Send} />
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5 md:border-l md:border-white/10 md:pl-8">
        <p className="text-[14px] text-white/85">Where your money is</p>
        <BreakdownRow label="Available" amount={available} total={total} tone="bg-sb-brand-400" />
        <BreakdownRow label="Locked in pools & plans" amount={locked} total={total} tone="bg-sb-brand-300" />
        <BreakdownRow label="Owed to pools" amount={owed} total={total} tone="bg-sb-gold" />
      </div>
    </section>
  );
}
