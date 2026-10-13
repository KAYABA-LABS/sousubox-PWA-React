"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import type { EligibilityFailure } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { EligibilityChecklist } from "@/components/group-pools/EligibilityChecklist";
import { GPCard, GPFullPageLoader, GPPageHeader, GPPrimaryButton, GPSectionTitle } from "@/components/group-pools/ui";

const MOTIVATION_MAX_LENGTH = 1000;

function failuresFrom(data: unknown): EligibilityFailure[] | null {
  if (!data || typeof data !== "object") return null;
  const failures = (data as { failures?: unknown }).failures;
  return Array.isArray(failures) ? (failures as EligibilityFailure[]) : null;
}

export default function ModeratorApplyPage() {
  const router = useRouter();
  const { userId } = useDatabaseUserId();
  const service = useGroupPoolService();
  const { details, loaded, refresh } = useModeratorAreaStatus();

  const [motivation, setMotivation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [serverFailures, setServerFailures] = useState<EligibilityFailure[] | null>(null);

  if (!loaded) return <GPFullPageLoader />;

  const failures = serverFailures ?? details?.eligibility?.failures ?? [];
  const closed = details ? !details.applicationsOpen : false;

  const submit = async () => {
    setSubmitting(true);
    setInlineError(null);
    try {
      await service.applyForModerator(userId, motivation.trim() || undefined);
      track("moderator_applied");
      toast.success("Application sent");
      await refresh();
      router.replace("/moderator");
    } catch (err) {
      const error = resolveGroupPoolError(err);
      if (error.code === "NOT_ELIGIBLE") {
        setServerFailures(failuresFrom(error.data) ?? []);
        setInlineError(error.message);
      } else if (error.treatment === "inline") {
        setInlineError(error.message);
      } else {
        toast.error(error.message);
        if (error.refetch) {
          await refresh();
          router.replace("/moderator");
        }
      }
    }
    setSubmitting(false);
  };

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-24 font-sans">
      <GPPageHeader eyebrow="Pool Moderator" title="Apply" onBack={() => router.push("/moderator")} />
      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {(details?.eligibility || serverFailures) && (
          <GPCard>
            <GPSectionTitle>Eligibility</GPSectionTitle>
            <EligibilityChecklist failures={failures} snapshot={details?.eligibility?.snapshot} />
          </GPCard>
        )}

        <GPCard>
          <label htmlFor="motivation" className="block text-xs font-bold uppercase tracking-wide text-[#0C0F14] dark:text-white mb-2">
            Why do you want to moderate? <span className="font-normal normal-case text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="motivation"
            value={motivation}
            maxLength={MOTIVATION_MAX_LENGTH}
            onChange={(e) => setMotivation(e.target.value)}
            rows={5}
            placeholder="Tell us about the group you'd run a pool for."
            className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
          />
          <p className="text-[10px] text-gray-400 text-right mt-1">
            {motivation.length}/{MOTIVATION_MAX_LENGTH}
          </p>
        </GPCard>

        {inlineError && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 px-1">
            {inlineError}
          </p>
        )}

        <GPPrimaryButton disabled={closed || details?.canApply === false} loading={submitting} onClick={submit}>
          {closed ? "Applications aren't open yet" : "Send application"}
        </GPPrimaryButton>
      </div>
    </main>
  );
}
