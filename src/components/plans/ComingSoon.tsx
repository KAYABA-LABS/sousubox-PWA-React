import { TrendingUp } from "lucide-react";
import { Card, IconTile } from "@/components/ds";
import { SAVINGS_PRODUCTS } from "@/lib/plans";

/** Shown in place of Plans/Invest while the feature flag is off. */
export function ComingSoon({ eyebrow }: { eyebrow: string }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
      <IconTile icon={TrendingUp} size="lg" />
      <p className="mt-5 text-[14px] font-semibold text-sb-brand-600">{eyebrow}</p>
      <h1 className="mt-2 text-[28px] leading-tight font-bold tracking-[-0.02em] text-sb-ink">Savings plans are coming soon</h1>
      <p className="mt-3 max-w-md text-[15px] text-sb-ink-2">
        We&apos;re putting the finishing touches on plans that earn steady interest on what you save.
      </p>
      <ul className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        {SAVINGS_PRODUCTS.map((product) => (
          <li key={product.planId} className="flex items-center gap-3 rounded-sb-tile border border-sb-line bg-sb-surface-2 p-3 text-left">
            <IconTile icon={product.icon} size="sm" />
            <span className="text-[14px] font-semibold text-sb-ink">{product.name}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
