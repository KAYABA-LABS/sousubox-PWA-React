"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { CheckCircle2, Circle, Crown, LifeBuoy, Pencil, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { Badge, Card, CardHeader, HeroCard, InitialsAvatar, LinkButton, ListRow, Skeleton } from "@/components/ds";
import { AppShell } from "@/components/shell/AppShell";
import { humanizeEnum, initialsOf } from "@/lib/format";
import { InviteCard, ReputationCard } from "./ProfileExtras";
import { maskTail, networkName, useAccountData, type AccountData } from "./useAccountData";

const KYC_LABELS: Record<string, string> = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  UNDER_REVIEW: "In review",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  NOT_SUBMITTED: "Not started",
};

/** "March 2026" from an ISO date. */
function monthYear(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "12 Apr 1994" from an ISO date. */
function longDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Header card: avatar, name, verification and membership summary. */
function ProfileHeader({ data }: { data: AccountData }) {
  const p = data.profile;
  const name = p ? `${p.firstName} ${p.lastName}`.trim() || p.username : null;
  const facts = [
    monthYear(p?.createdAt) && `Member since ${monthYear(p?.createdAt)}`,
    p?.tier && `${humanizeEnum(p.tier)} tier`,
    p?.stats && `${p.stats.poolsJoined} pools joined`,
  ].filter(Boolean);
  return (
    <Card tone="wash" className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <InitialsAvatar initials={initialsOf(p?.firstName, p?.lastName)} size="xl" />
      <div className="min-w-0 flex-1">
        {data.isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em] text-sb-ink">{name ?? "Your profile"}</h1>
            {data.kycStatus === "VERIFIED" ? (
              <Badge tone="success">
                <CheckCircle2 aria-hidden="true" className="size-3.5" /> Verified
              </Badge>
            ) : (
              <Badge tone="warning">Not verified</Badge>
            )}
          </div>
        )}
        {facts.length > 0 && <p className="mt-1.5 text-[15px] text-sb-ink-2">{facts.join(" · ")}</p>}
      </div>
      <LinkButton href="/settings/profile" variant="outline" icon={Pencil} className="self-start sm:self-auto">
        Edit profile
      </LinkButton>
    </Card>
  );
}

/** Card wrapper for a titled group of rows. */
function RowsCard({ icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} boxedIcon className="mb-4" />
      {children}
    </Card>
  );
}

/** Checklist item in the Account health card. */
function HealthItem({ done, label, href }: { done: boolean; label: string; href: string }) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-1.5 text-[15px] hover:underline">
        <Icon aria-hidden="true" className={done ? "size-5 text-sb-brand-600" : "size-5 text-sb-ink-3"} strokeWidth={1.75} />
        <span className={done ? "text-sb-ink-2" : "font-semibold text-sb-ink"}>{label}</span>
        <span className="sr-only">{done ? "(done)" : "(to do)"}</span>
      </Link>
    </li>
  );
}

/** Profile screen: personal details, security, payment methods and account health. */
export function ProfileScreen() {
  const data = useAccountData();
  const { signOut } = useClerk();
  const p = data.profile;
  const verified = data.kycStatus === "VERIFIED";

  const rail = (
    <>
      <HeroCard
        icon={Crown}
        eyebrow="Account tier"
        title={p?.tier ? humanizeEnum(p.tier) : "Standard"}
        action={<LinkButton href="/manage/limits" variant="light" size="lg" trailingArrow className="w-full">See tier benefits</LinkButton>}
      >
        {verified
          ? `Verified identity. You can hold up to ${p?.maxPoolInstruments ?? "—"} pools and ${p?.maxPersonalInstruments ?? "—"} personal plans.`
          : "Verify your identity to raise your limits and join pools."}
      </HeroCard>
      <Card>
        <h2 className="text-sb-section font-semibold text-sb-ink">Account health</h2>
        <ul className="mt-3">
          <HealthItem done={verified} label="Identity verified" href="/kyc" />
          <HealthItem done={data.fundingSources.length > 0} label="Mobile money wallet linked" href="/settings/linked-accounts" />
          <HealthItem done={!!p?.email} label="Email address added" href="/settings/personal" />
          <HealthItem done={!!p?.photoUrl} label="Profile photo set" href="/settings/photo" />
        </ul>
      </Card>
      {data.stats && <ReputationCard stats={data.stats} />}
      {data.referral && <InviteCard referral={data.referral} />}
    </>
  );

  return (
    <AppShell rail={rail}>
      <ProfileHeader data={data} />
      <div className="grid gap-5 md:grid-cols-2">
        <RowsCard icon={UserRound} title="Personal information">
          <ListRow label="Phone" value={p?.phoneNumber ? maskTail(p.phoneNumber) : "—"} href="/settings/change-phone" />
          <ListRow label="Email" value={p?.email ?? "Add email"} href="/settings/personal" />
          <ListRow label="Date of birth" value={longDate(p?.dateOfBirth) ?? "—"} href="/settings/personal" />
        </RowsCard>
        <RowsCard icon={ShieldCheck} title="Security">
          <ListRow label="Transaction PIN" href="/manage/security" />
          <ListRow label="Security overview" href="/settings/security-overview" />
          <ListRow label="Identity check" value={KYC_LABELS[data.kycStatus] ?? "Not started"} href="/kyc" />
        </RowsCard>
        <RowsCard icon={Wallet} title="Payment methods">
          {data.fundingSources.map((source) => (
            <ListRow
              key={`${source.networkId}-${source.phoneNumber}`}
              label={networkName(source.networkId)}
              value={maskTail(source.phoneNumber)}
              trailing={source.active ? <Badge>Default</Badge> : undefined}
              href="/settings/linked-accounts"
            />
          ))}
          <ListRow label="Add a method" value="Add" href="/settings/add-account" />
        </RowsCard>
        <RowsCard icon={LifeBuoy} title="Help & legal">
          <ListRow label="Support" value="Chat with us" href="/settings/contact" />
          <ListRow label="Terms & privacy" value="View" href="/terms" />
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: "/signin" })}
            className="w-full border-t border-sb-line py-3 text-left text-[14px] font-semibold text-sb-danger hover:underline"
          >
            Sign out
          </button>
        </RowsCard>
      </div>
    </AppShell>
  );
}
