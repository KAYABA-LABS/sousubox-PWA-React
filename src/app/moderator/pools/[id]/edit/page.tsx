"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useGroupPoolService } from "@/services/groupPoolService";
import { resolveGroupPoolError, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import { poolConfigSchema, toUpdateBody, type PoolConfigValues } from "@/lib/groupPoolForm";
import type { ModeratedPool } from "@/lib/api";
import { GateSheet } from "@/components/group-pools/GateSheet";
import {
  BasicsFields,
  ConfigErrorsList,
  EconomicsFields,
  EstimatePanel,
  usePoolValues,
} from "@/components/group-pools/PoolConfigFields";
import {
  GPCard,
  GPFullPageLoader,
  GPFullPageMessage,
  GPPageHeader,
  GPPrimaryButton,
  GPSectionTitle,
} from "@/components/group-pools/ui";

interface Loaded {
  pool: ModeratedPool;
  initial: PoolConfigValues;
}

export default function EditPoolPage() {
  const router = useRouter();
  const poolId = useParams().id as string;
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();
  useModeratorAreaStatus();
  const [loaded, setLoaded] = useState<Loaded | null | undefined>(undefined);

  const load = useCallback(() => {
    if (!ready) return;
    Promise.all([service.getModeratedPools(userId), service.getPoolDetails(poolId).catch(() => null)]).then(
      ([pools, details]) => {
        const pool = pools.find((p) => p.id === poolId);
        if (!pool) return setLoaded(null);
        setLoaded({
          pool,
          initial: {
            name: pool.name,
            description: (details?.description as string | null | undefined) ?? "",
            rulesText: (details?.rulesText as string | null | undefined) ?? "",
            contributionAmount: pool.contributionAmount,
            maxMembers: pool.maxMembers,
            payoutIntervalDays: pool.payoutIntervalDays,
            payoutOrderType: pool.payoutOrderType,
            // Not editable after creation; kept only to satisfy the schema.
            moderatorParticipates: false,
          },
        });
      },
      (err) => {
        toast.error(resolveGroupPoolError(err).message);
        setLoaded(null);
      }
    );
  }, [ready, service, userId, poolId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loaded === undefined) return <GPFullPageLoader />;
  if (!loaded) {
    return (
      <GPFullPageMessage
        title="Pool Not Found"
        message="This pool doesn't exist or you don't moderate it."
        actionLabel="Back to my pools"
        onAction={() => router.push("/moderator")}
      />
    );
  }
  if (loaded.pool.status !== "FORMING") {
    return (
      <GPFullPageMessage
        title="Can't edit this pool"
        message="Pools can only be edited before they start."
        actionLabel="Back to pool"
        onAction={() => router.push(`/moderator/pools/${poolId}`)}
      />
    );
  }

  return <EditPoolForm pool={loaded.pool} initial={loaded.initial} userId={userId} />;
}

function EditPoolForm({ pool, initial, userId }: { pool: ModeratedPool; initial: PoolConfigValues; userId: string }) {
  const router = useRouter();
  const service = useGroupPoolService();
  const form = useForm<PoolConfigValues>({ resolver: zodResolver(poolConfigSchema), defaultValues: initial, mode: "onTouched" });
  const [locked, setLocked] = useState(!!pool.configFrozenAt);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sheetError, setSheetError] = useState<ResolvedGroupPoolError | null>(null);
  const values = usePoolValues(form);
  const backToPool = () => router.push(`/moderator/pools/${pool.id}`);

  const save = form.handleSubmit(async (values) => {
    const body = toUpdateBody(initial, values, locked);
    if (Object.keys(body).length === 0) {
      toast("Nothing to save");
      return;
    }
    setSaving(true);
    setErrors([]);
    try {
      await service.updatePool(userId, pool.id, body);
      toast.success("Pool updated");
      backToPool();
      return;
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.code === "CONFIG_FROZEN") {
        setLocked(true);
        // Economics froze since the page loaded: put them back and keep the text edits.
        form.reset({
          ...values,
          contributionAmount: initial.contributionAmount,
          maxMembers: initial.maxMembers,
          payoutIntervalDays: initial.payoutIntervalDays,
          payoutOrderType: initial.payoutOrderType,
        });
        setErrors([error.message]);
      } else if (error.code === "INVALID_POOL_CONFIG") {
        setErrors(error.details?.length ? error.details : [error.message]);
      } else if (error.treatment === "sheet") {
        setSheetError(error);
      } else {
        toast.error(error.message);
        if (error.code === "POOL_NOT_FORMING") backToPool();
      }
    }
    setSaving(false);
  });

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader eyebrow="Edit pool" title={pool.name} onBack={backToPool} />
      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        <ConfigErrorsList messages={errors} />
        <GPCard>
          <GPSectionTitle>Basics</GPSectionTitle>
          <BasicsFields form={form} />
        </GPCard>
        <GPCard>
          <GPSectionTitle>Money</GPSectionTitle>
          <EconomicsFields form={form} locked={locked} />
        </GPCard>
        {!locked && <EstimatePanel values={values} />}
        <GPPrimaryButton loading={saving} onClick={() => save()}>
          Save changes
        </GPPrimaryButton>
      </div>
      <GateSheet error={sheetError} onClose={() => setSheetError(null)} returnTo={`/moderator/pools/${pool.id}/edit`} />
    </main>
  );
}
