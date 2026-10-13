"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { AlertTriangle, Calculator, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { estimatePool } from "@/lib/groupPoolEstimate";
import { DEFAULT_POOL_CONFIG, INTERVAL_OPTIONS, ORDER_TYPES, type PoolConfigValues } from "@/lib/groupPoolForm";
import { formatGhs } from "@/lib/pool-format";

type Form = UseFormReturn<PoolConfigValues>;

/** Live form values. `useWatch` rather than `form.watch()` keeps the React Compiler happy. */
export function usePoolValues(form: Form): PoolConfigValues {
  const watched = useWatch({ control: form.control });
  return { ...DEFAULT_POOL_CONFIG, ...watched } as PoolConfigValues;
}

const inputClass =
  "w-full h-12 px-4 bg-white dark:bg-[#0C0F14] border border-black/10 dark:border-white/10 rounded-xl text-sm text-[#0C0F14] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:ring-2 focus:ring-[#0D4F3C]/10 disabled:opacity-60";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-[#0C0F14] dark:text-white">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-[11px] text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}

function NumberInput({ form, name, id, placeholder, step, disabled }: {
  form: Form;
  name: "contributionAmount" | "maxMembers";
  id: string;
  placeholder: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <input
          id={id}
          type="number"
          inputMode={step ? "decimal" : "numeric"}
          step={step}
          min={0}
          placeholder={placeholder}
          disabled={disabled}
          value={Number.isFinite(field.value) ? field.value : ""}
          onChange={(e) => field.onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
          onBlur={field.onBlur}
          className={inputClass}
        />
      )}
    />
  );
}

export function BasicsFields({ form }: { form: Form }) {
  const { errors } = form.formState;
  return (
    <div className="space-y-4">
      <Field id="pool-name" label="Pool name" error={errors.name?.message}>
        <input id="pool-name" {...form.register("name")} placeholder="e.g. Makola Traders Susu" className={inputClass} />
      </Field>
      <Field id="pool-description" label="Description (optional)" hint="Who the pool is for." error={errors.description?.message}>
        <Textarea
          id="pool-description"
          {...form.register("description")}
          rows={3}
          className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
        />
      </Field>
      <Field id="pool-rules" label="Group rules (optional)" hint="Shown to people before they request to join." error={errors.rulesText?.message}>
        <Textarea
          id="pool-rules"
          {...form.register("rulesText")}
          rows={4}
          className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
        />
      </Field>
    </div>
  );
}

export function EconomicsFields({ form, locked }: { form: Form; locked?: boolean }) {
  const { errors } = form.formState;
  return (
    <div className="space-y-4">
      {locked && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-300">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          Amounts, size and payout settings are locked once the first member is approved. You can still edit the name,
          description and rules.
        </div>
      )}
      <Field id="pool-amount" label="Daily contribution (GH₵)" hint="Each member pays this every day." error={errors.contributionAmount?.message}>
        <NumberInput form={form} name="contributionAmount" id="pool-amount" placeholder="20" step="0.01" disabled={locked} />
      </Field>
      <Field id="pool-members" label="Number of members" hint="Also the number of payouts." error={errors.maxMembers?.message}>
        <NumberInput form={form} name="maxMembers" id="pool-members" placeholder="10" disabled={locked} />
      </Field>

      <Controller
        control={form.control}
        name="payoutIntervalDays"
        render={({ field }) => (
          <fieldset className="space-y-1.5" disabled={locked}>
            <legend className="block text-xs font-bold text-[#0C0F14] dark:text-white mb-1.5">Payout every</legend>
            <div className="flex flex-wrap gap-2">
              {INTERVAL_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  aria-pressed={field.value === option.days}
                  onClick={() => field.onChange(option.days)}
                  className={cn(
                    "px-3.5 py-2 rounded-full text-xs font-bold border transition-colors disabled:opacity-60",
                    field.value === option.days
                      ? "bg-[#0D4F3C] border-[#0D4F3C] text-white"
                      : "bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.payoutIntervalDays && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {errors.payoutIntervalDays.message}
              </p>
            )}
          </fieldset>
        )}
      />

      <Controller
        control={form.control}
        name="payoutOrderType"
        render={({ field }) => (
          <fieldset className="space-y-2" disabled={locked}>
            <legend className="block text-xs font-bold text-[#0C0F14] dark:text-white mb-1.5">Payout order</legend>
            {ORDER_TYPES.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 cursor-pointer",
                  field.value === option.value
                    ? "border-[#0D4F3C] bg-[#0D4F3C]/5 dark:border-[#156B53] dark:bg-[#156B53]/10"
                    : "border-black/10 dark:border-white/10",
                  locked && "cursor-not-allowed opacity-60"
                )}
              >
                <input
                  type="radio"
                  name="payoutOrderType"
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={() => field.onChange(option.value)}
                  className="mt-1 accent-[#0D4F3C]"
                />
                <span>
                  <span className="block text-sm font-semibold text-[#0C0F14] dark:text-white">{option.label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
      />
    </div>
  );
}

export function ParticipateField({ form }: { form: Form }) {
  const estimate = estimatePool(usePoolValues(form));
  return (
    <Controller
      control={form.control}
      name="moderatorParticipates"
      render={({ field }) => (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-black/10 dark:border-white/10 p-4">
          <div>
            <label htmlFor="participates" className="text-sm font-semibold text-[#0C0F14] dark:text-white">
              I&apos;ll also contribute as a member
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              You&apos;ll need your guarantee plus a member&apos;s join amount
              {estimate ? ` (about ${formatGhs(estimate.joinAmount)})` : ""} available.
            </p>
          </div>
          <Switch id="participates" checked={field.value} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  );
}

export function EstimatePanel({ values }: { values: PoolConfigValues }) {
  const estimate = estimatePool(values);
  if (!estimate) {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400 rounded-xl bg-black/[0.03] dark:bg-white/5 p-3">
        Enter the daily amount and number of members to see an estimate.
      </p>
    );
  }
  const rows: [string, string][] = [
    ["Each payout (before fees)", formatGhs(estimate.grossPayoutAmount)],
    ["Member join amount", formatGhs(estimate.joinAmount)],
    ["· Security reserve (refundable)", formatGhs(estimate.securityReserve)],
    ["· Joining fee", formatGhs(estimate.joiningFee)],
    ["Total pool value", formatGhs(estimate.totalPoolValue)],
    ["Your guarantee", "Calculated when you create"],
  ];
  return (
    <div className="rounded-xl bg-[#0D4F3C]/5 dark:bg-[#156B53]/10 border border-[#0D4F3C]/10 dark:border-[#156B53]/20 p-4" data-testid="estimate-panel">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[#0D4F3C] dark:text-emerald-300 mb-2">
        <Calculator className="w-4 h-4" /> Estimate
      </p>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <dt className="text-gray-600 dark:text-gray-300">{label}</dt>
            <dd className="font-semibold text-[#0C0F14] dark:text-white text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
        Estimate: final amounts are confirmed when you create the pool.
      </p>
    </div>
  );
}

export function ConfigErrorsList({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 mb-1">
        <AlertTriangle className="w-4 h-4" /> Please change:
      </p>
      <ul className="list-disc pl-5 space-y-0.5 text-xs text-red-700 dark:text-red-300">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
