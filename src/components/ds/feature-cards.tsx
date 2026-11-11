import type { ReactNode } from "react";
import { Lightbulb, type LucideIcon } from "lucide-react";
import { Card } from "./surfaces";
import { TextLink } from "./controls";

interface HeroCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  corner?: ReactNode;
}

/** Dark green feature card at the top of each right rail (Quick Actions, Account tier, …). */
export function HeroCard({ icon: Icon, eyebrow, title, children, action, corner }: HeroCardProps) {
  return (
    <Card tone="hero" className="p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-[15px] font-semibold text-white">
          <Icon aria-hidden="true" className="size-5 text-sb-gold" strokeWidth={1.75} />
          {eyebrow}
        </p>
        {corner}
      </div>
      <h2 className="mt-4 text-[22px] leading-tight font-bold tracking-[-0.02em] text-white">{title}</h2>
      {children && <div className="mt-3 text-[14px] leading-relaxed text-white/80">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/** Green bar-chart flourish in the corner of Pro Tip cards. */
function TipBars() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-6 bottom-6 flex items-end gap-2">
      <span className="h-9 w-5 rounded-md bg-gradient-to-b from-sb-brand-400 to-sb-brand-600" />
      <span className="h-14 w-5 rounded-md bg-gradient-to-b from-sb-brand-400 to-sb-brand-600" />
      <span className="h-[86px] w-5 rounded-md bg-gradient-to-b from-sb-brand-400 to-sb-brand-700" />
    </span>
  );
}

interface ProTipCardProps {
  children: ReactNode;
  href: string;
  cta: string;
  tall?: boolean;
}

/** Warm "Pro Tip" card with a single call to action. */
export function ProTipCard({ children, href, cta, tall = false }: ProTipCardProps) {
  return (
    <Card tone="warm" className={tall ? "min-h-[250px]" : "min-h-[180px]"}>
      <p className="flex items-center gap-2.5 text-[16px] font-semibold text-sb-ink">
        <Lightbulb aria-hidden="true" className="size-5 text-sb-gold" strokeWidth={1.75} />
        Pro Tip
      </p>
      <p className="mt-3 max-w-[15rem] text-[14px] leading-relaxed text-sb-ink-2">{children}</p>
      <TextLink href={href} className="mt-3 text-[15px]">
        {cta}
      </TextLink>
      <TipBars />
    </Card>
  );
}
