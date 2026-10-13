"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { formatGhs } from "@/lib/pool-format";
import { resolveGroupPoolError, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import {
  clearDraft,
  DEFAULT_POOL_CONFIG,
  INTERVAL_OPTIONS,
  ORDER_TYPES,
  poolConfigSchema,
  readDraft,
  saveDraft,
  STEP_FIELDS,
  stepForConfigError,
  stepForField,
  toCreateBody,
  type PoolConfigValues,
  type WizardStep,
} from "@/lib/groupPoolForm";
import { GateSheet } from "@/components/group-pools/GateSheet";
import {
  BasicsFields,
  ConfigErrorsList,
  EconomicsFields,
  EstimatePanel,
  ParticipateField,
  usePoolValues,
} from "@/components/group-pools/PoolConfigFields";
import {
  GPCard,
  GPFullPageLoader,
  GPPageHeader,
  GPPrimaryButton,
  GPSecondaryButton,
  GPSectionTitle,
} from "@/components/group-pools/ui";

const STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: "Basics" },
  { step: 2, label: "Money" },
  { step: 3, label: "Review" },
];

const parseStep = (raw: string | null): WizardStep => (raw === "2" ? 2 : raw === "3" ? 3 : 1);

export default function CreatePoolPage() {
  return (
    <Suspense fallback={<GPFullPageLoader />}>
      <CreatePoolWizard />
    </Suspense>
  );
}

function CreatePoolWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = parseStep(searchParams.get("step"));
  const resumed = searchParams.get("resume") === "1";
  const { userId } = useDatabaseUserId();
  const service = useGroupPoolService();
  const { details, loaded } = useModeratorAreaStatus();

  // The draft survives the deposit round trip. Fields only render client-side (after the status check), so reading storage here can't mismatch SSR.
  const [initialValues] = useState(() => (typeof window === "undefined" ? null : readDraft()) ?? DEFAULT_POOL_CONFIG);
  const form = useForm<PoolConfigValues>({
    resolver: zodResolver(poolConfigSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });
  const [configErrors, setConfigErrors] = useState<{ step: WizardStep | null; message: string }[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [sheetError, setSheetError] = useState<ResolvedGroupPoolError | null>(null);
  const [creating, setCreating] = useState(false);
  const values = usePoolValues(form);
  const draftJson = JSON.stringify(values);
  useEffect(() => {
    saveDraft(JSON.parse(draftJson) as PoolConfigValues);
  }, [draftJson]);



  useEffect(() => {
    track("group_pool_create_step", { step });
  }, [step]);

  useEffect(() => {
    if (loaded && details && details.status !== "APPROVED") router.replace("/moderator");
  }, [loaded, details, router]);

  if (!loaded) return <GPFullPageLoader />;

  const goTo = (next: WizardStep) => router.push(`/moderator/create?step=${next}`);

  const next = async () => {
    if (await form.trigger(STEP_FIELDS[step])) goTo((step + 1) as WizardStep);
  };

  const create = form.handleSubmit(
    async (values) => {
      setCreating(true);
      setConfigErrors([]);
      setInlineError(null);
      try {
        const pool = await service.createPool(userId, toCreateBody(values));
        clearDraft();
        track("group_pool_created", { poolId: pool.id });
        toast.success("Pool created");
        router.replace(`/moderator/pools/${pool.id}?created=1`);
        return;
      } catch (err) {
        const error = resolveGroupPoolError(err);
        if (error.code === "INVALID_POOL_CONFIG") {
          const messages = error.details?.length ? error.details : [error.message];
          const mapped = messages.map((message) => ({ step: stepForConfigError(message), message }));
          setConfigErrors(mapped);
          const first = Math.min(...mapped.map((m) => m.step ?? 3)) as WizardStep;
          if (first !== step) goTo(first);
        } else if (error.treatment === "sheet") {
          setSheetError(error);
        } else if (error.treatment === "page") {
          toast.error(error.message);
          router.replace("/moderator");
        } else if (error.treatment === "inline") {
          setInlineError(error.message);
        } else {
          toast.error(error.message);
        }
      }
      setCreating(false);
    },
    (errors) => {
      // Landed on review with an incomplete draft: send them to the first step with a problem.
      const fields = Object.keys(errors) as (keyof PoolConfigValues)[];
      const first = Math.min(...fields.map(stepForField)) as WizardStep;
      if (first !== step) goTo(first);
    }
  );

  const stepErrors = configErrors.filter((e) => e.step === step || (step === 3 && e.step === null)).map((e) => e.message);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader
        eyebrow={`Step ${step} of 3`}
        title="Create a pool"
        onBack={() => (step === 1 ? router.push("/moderator") : goTo((step - 1) as WizardStep))}
      />

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        <ol className="flex gap-2" aria-label="Progress">
          {STEPS.map((s) => (
            <li key={s.step} className="flex-1">
              <div className={cn("h-1.5 rounded-full", s.step <= step ? "bg-[#0D4F3C] dark:bg-[#156B53]" : "bg-black/10 dark:bg-white/10")} />
              <p
                className={cn(
                  "mt-1 text-[10px] font-semibold uppercase tracking-wider",
                  s.step === step ? "text-[#0C0F14] dark:text-white" : "text-gray-400"
                )}
                aria-current={s.step === step ? "step" : undefined}
              >
                {s.label}
              </p>
            </li>
          ))}
        </ol>

        {resumed && step === 3 && (
          <p className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium p-3">
            Welcome back. Check the details and create your pool.
          </p>
        )}

        <ConfigErrorsList messages={stepErrors} />

        {step === 1 && (
          <GPCard>
            <BasicsFields form={form} />
          </GPCard>
        )}

        {step === 2 && (
          <>
            <GPCard>
              <EconomicsFields form={form} />
            </GPCard>
            <EstimatePanel values={values} />
          </>
        )}

        {step === 3 && (
          <>
            <ReviewCard values={values} onEdit={goTo} />
            <EstimatePanel values={values} />
            <GPCard>
              <ParticipateField form={form} />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your guarantee is locked while the pool runs. If a member defaults, it pays their days and they owe that
                amount back. If it runs out, the pool pauses payouts until you top up.
              </p>
            </GPCard>
            {inlineError && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 px-1">
                {inlineError}
              </p>
            )}
          </>
        )}

        {step < 3 ? (
          <GPPrimaryButton onClick={next}>Continue</GPPrimaryButton>
        ) : (
          <GPPrimaryButton loading={creating} onClick={() => create()}>
            Create pool & lock guarantee
          </GPPrimaryButton>
        )}
        {step > 1 && <GPSecondaryButton onClick={() => goTo((step - 1) as WizardStep)}>Back</GPSecondaryButton>}
      </div>

      <GateSheet
        error={sheetError}
        onClose={() => setSheetError(null)}
        returnTo="/moderator/create?step=3&resume=1"
      />
    </main>
  );
}

function ReviewCard({ values, onEdit }: { values: PoolConfigValues; onEdit: (step: WizardStep) => void }) {
  const interval = INTERVAL_OPTIONS.find((o) => o.days === values.payoutIntervalDays)?.label ?? `Every ${values.payoutIntervalDays} days`;
  const order = ORDER_TYPES.find((o) => o.value === values.payoutOrderType)?.label ?? values.payoutOrderType;
  const sections: { step: WizardStep; title: string; rows: [string, string][] }[] = [
    {
      step: 1,
      title: "Basics",
      rows: [
        ["Name", values.name || "—"],
        ["Description", values.description.trim() || "—"],
        ["Rules", values.rulesText.trim() ? "Added" : "—"],
      ],
    },
    {
      step: 2,
      title: "Money",
      rows: [
        ["Daily contribution", Number.isFinite(values.contributionAmount) ? formatGhs(values.contributionAmount) : "—"],
        ["Members", Number.isFinite(values.maxMembers) ? String(values.maxMembers) : "—"],
        ["Payout", interval],
        ["Order", order],
      ],
    },
  ];
  return (
    <GPCard className="space-y-4">
      {sections.map((section) => (
        <section key={section.step}>
          <div className="flex items-center justify-between mb-2">
            <GPSectionTitle className="mb-0">{section.title}</GPSectionTitle>
            <button onClick={() => onEdit(section.step)} className="text-xs font-bold text-[#0D4F3C] dark:text-emerald-300">
              Edit
            </button>
          </div>
          <dl className="space-y-1">
            {section.rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-[#0C0F14] dark:text-white text-right truncate max-w-[60%]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </GPCard>
  );
}
