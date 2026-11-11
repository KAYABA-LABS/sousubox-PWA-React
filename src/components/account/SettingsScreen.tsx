"use client";

import type { ReactNode } from "react";
import { Bell, CreditCard, EyeOff, FileText, Gauge, LifeBuoy, Lock, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, HeroCard, LinkButton, ListRow, PageHeading, ProTipCard, Toggle } from "@/components/ds";
import { AppShell } from "@/components/shell/AppShell";
import { useTheme } from "@/context/ThemeContext";
import { maskTail, networkName, useAccountData } from "./useAccountData";

/** Titled settings group. */
function SettingsCard({ icon, title, children }: { icon: typeof Bell; title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} boxedIcon className="mb-4" />
      {children}
    </Card>
  );
}

/** Settings screen: notifications, preferences, privacy, security and limits. */
export function SettingsScreen() {
  const { mode, setMode } = useTheme();
  const { fundingSources } = useAccountData();
  const topUp = fundingSources.find((s) => s.active) ?? fundingSources[0];

  const rail = (
    <>
      <HeroCard
        icon={LifeBuoy}
        eyebrow="Need a hand?"
        title="We're here 7 days a week"
        action={<LinkButton href="/settings/contact" variant="light" size="lg" trailingArrow className="w-full">Start a chat</LinkButton>}
      >
        Chat with our team about pools, payouts or your account.
      </HeroCard>
      <ProTipCard href="/settings/push" cta="Turn on">
        Turn on contribution reminders so you never miss a pool payment.
      </ProTipCard>
    </>
  );

  return (
    <AppShell rail={rail}>
      <PageHeading eyebrow="Settings" title="Make sousubox work for you." />
      <div className="grid items-start gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <SettingsCard icon={Bell} title="Notifications">
            <ListRow label="Push notifications" href="/settings/push" />
            <ListRow label="Email notifications" href="/settings/email-notif" />
            <ListRow label="SMS alerts" href="/settings/sms" />
            <ListRow label="Quiet hours" href="/settings/quiet-hours" />
          </SettingsCard>
          <SettingsCard icon={EyeOff} title="Privacy">
            <ListRow label="Privacy controls" href="/settings/privacy-controls" />
            <ListRow label="Data usage" href="/settings/data-usage" />
            <ListRow label="Download my data" href="/settings/download-data" />
          </SettingsCard>
          <SettingsCard icon={Gauge} title="Limits">
            <ListRow label="Spending limits" href="/settings/spending-limits" />
            <ListRow label="Transfer limits" href="/settings/transfer-limits" />
            <ListRow label="ATM limits" href="/settings/atm-limits" />
          </SettingsCard>
          <SettingsCard icon={CreditCard} title="Cards & merchants">
            <ListRow label="Virtual cards" href="/settings/virtual-cards" />
            <ListRow label="Physical card" href="/settings/physical-card" />
            <ListRow label="Blocked merchants" href="/settings/blocked-merchants" />
            <ListRow label="Merchant categories" href="/settings/merchant-categories" />
          </SettingsCard>
        </div>
        <div className="flex flex-col gap-5">
          <SettingsCard icon={SlidersHorizontal} title="Preferences">
            <ListRow label="Currency" value="GHS (₵)" href="/settings/currency" />
            <ListRow label="Language" value="English" href="/settings/language" />
            <ListRow
              label="Dark mode"
              trailing={<Toggle label="Dark mode" checked={mode === "dark"} onChange={(on) => setMode(on ? "dark" : "light")} />}
            />
            <ListRow
              label="Default top-up source"
              value={topUp ? `${networkName(topUp.networkId)} ${maskTail(topUp.phoneNumber)}` : "Add one"}
              href="/settings/linked-accounts"
            />
          </SettingsCard>
          <SettingsCard icon={Lock} title="Security">
            <ListRow label="Security overview" href="/settings/security-overview" />
            <ListRow label="Change phone number" href="/settings/change-phone" />
            <ListRow label="Freeze account" href="/settings/freeze" />
          </SettingsCard>
          <SettingsCard icon={FileText} title="Documents & help">
            <ListRow label="Statements" href="/settings/statements" />
            <ListRow label="Tax documents" href="/settings/tax-docs" />
            <ListRow label="Agreements" href="/settings/agreements" />
            <ListRow label="Privacy policy" href="/privacy" />
            <ListRow label="Help centre" href="/settings/help" />
            <ListRow label="Report a problem" href="/settings/report" />
            <ListRow label="Accessibility" href="/settings/accessibility" />
            <ListRow label="About sousubox" href="/settings/about" />
          </SettingsCard>
          <Card tone="danger" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-sb-danger">Close account</h2>
              <p className="mt-1 text-[14px] text-sb-ink-2">Leave all pools and withdraw your balance first.</p>
            </div>
            <LinkButton href="/settings/close" variant="dangerOutline" size="sm" className="self-start sm:self-auto">
              Close account
            </LinkButton>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
