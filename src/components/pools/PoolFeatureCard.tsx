import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, UsersRound } from "lucide-react";
import { Badge } from "@/components/ds";
import type { DiscoverPool } from "@/lib/api";
import { formatCompactGHS, humanizeEnum } from "@/lib/format";
import { cn } from "@/lib/utils";

type Emblem = "photo" | "crown" | "people";

/** Circular emblem on the left of a featured pool card. */
function PoolEmblem({ emblem }: { emblem: Emblem }) {
  return (
    <span aria-hidden="true" className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-sb-tint p-1.5">
      {emblem === "photo" ? (
        <Image src="/images/circle-group.png" alt="" width={76} height={76} className="size-[76px] rounded-full border-[3px] border-white object-cover" />
      ) : (
        <span
          className={cn(
            "flex size-[76px] items-center justify-center rounded-full border-[3px] border-white",
            emblem === "crown" ? "bg-sb-brand-950 text-sb-gold" : "bg-sb-tint-2 text-sb-brand-600"
          )}
        >
          {emblem === "crown" ? <Crown className="size-8" strokeWidth={1.75} /> : <UsersRound className="size-8" strokeWidth={1.6} />}
        </span>
      )}
    </span>
  );
}

interface PoolFeatureCardProps {
  pool: DiscoverPool;
  emblem: Emblem;
  /** When set, the card opens the pool in place instead of linking to Pools. */
  onSelect?: (pool: DiscoverPool) => void;
}

/** Large tappable card for a joinable pool ("Popular Pools", "Popular to join"). */
export function PoolFeatureCard({ pool, emblem, onSelect }: PoolFeatureCardProps) {
  const name = pool.template?.name ?? "Savings pool";
  const perCycle = `${formatCompactGHS(pool.contributionAmount)} ${humanizeEnum(pool.frequency).toLowerCase()}`;
  const open = pool.spotsRemaining > 0;
  const cardClass =
    "group flex w-full items-center gap-5 rounded-sb-card border border-sb-line bg-sb-wash p-4 pr-5 text-left shadow-sb-card transition-shadow hover:shadow-sb-pop focus-visible:outline-2 focus-visible:outline-sb-brand-500";
  const body = (
    <>
      <PoolEmblem emblem={emblem} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold text-sb-ink">{name}</span>
        <span className="mt-1 block truncate text-[14px] text-sb-ink-2">
          {pool.currentMemberCount} members <span aria-hidden="true">•</span> {perCycle}
        </span>
        <Badge tone={open ? "success" : "neutral"} className="mt-2.5">
          {open ? `${pool.spotsRemaining} spots left` : "Full"}
        </Badge>
      </span>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sb-ink shadow-sb-card transition-transform group-hover:translate-x-0.5 dark:bg-sb-surface-2"
      >
        <ArrowRight className="size-5" strokeWidth={1.75} />
      </span>
    </>
  );
  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(pool)} className={cardClass}>
        {body}
      </button>
    );
  }
  return (
    <Link href={`/pools?tab=discover&pool=${pool.id}`} className={cardClass}>
      {body}
    </Link>
  );
}
