"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Lock, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useModeratorAreaStatus } from "@/hooks/use-moderator-ping";
import { useModeratorDraft } from "@/hooks/use-moderator-draft";
import { useRefetchOnFocus } from "@/hooks/use-refetch";
import { useGroupPoolService } from "@/services/groupPoolService";
import { track } from "@/lib/analytics";
import { resolveGroupPoolError } from "@/lib/groupPoolErrors";
import {
  documentMimeType,
  mapDocumentErrors,
  MOTIVATION_MAX_LENGTH,
  requiredDocumentsOrDefault,
  sizeBucket,
  validateDocument,
} from "@/lib/moderatorDocuments";
import { moderatorApplicationCopy as copy } from "@/lib/copy/moderatorApplication";
import type { EligibilityFailure, ModeratorDocumentField } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EligibilityChecklist } from "@/components/group-pools/EligibilityChecklist";
import { DocumentUploadSlot } from "@/components/group-pools/DocumentUploadSlot";
import { UploadProgress } from "@/components/group-pools/UploadProgress";
import {
  GPCard,
  GPFullPageLoader,
  GPPageHeader,
  GPPrimaryButton,
  GPSectionTitle,
  GPStickyFooter,
} from "@/components/group-pools/ui";

type FieldErrors = Partial<Record<ModeratorDocumentField, string>>;

/** Codes after which the application state changed for good, so the draft is useless. */
const SETTLED_CODES = ["ALREADY_PENDING", "ALREADY_APPROVED", "ALREADY_SUSPENDED", "ALREADY_REVOKED"];

function failuresFrom(data: unknown): EligibilityFailure[] | null {
  if (!data || typeof data !== "object") return null;
  const failures = (data as { failures?: unknown }).failures;
  return Array.isArray(failures) ? (failures as EligibilityFailure[]) : null;
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

export default function ModeratorApplyPage() {
  const router = useRouter();
  const { userId, ready } = useDatabaseUserId();
  const service = useGroupPoolService();
  const { details, loaded, refresh } = useModeratorAreaStatus();
  useRefetchOnFocus(refresh, loaded);
  const draft = useModeratorDraft(userId, ready);
  const online = useOnline();

  const [progress, setProgress] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [serverFailures, setServerFailures] = useState<EligibilityFailure[] | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const startedRef = useRef(false);
  const restoredTrackedRef = useRef(false);

  const submitting = progress !== null;
  const documents = requiredDocumentsOrDefault(details?.requiredDocuments);
  const fileCount = documents.filter((d) => draft.files[d.field]).length;
  // Without on-device storage, leaving loses the picked files.
  const leaveLosesWork = submitting || (!draft.persistent && fileCount > 0);

  // The form is only for users who can apply; everyone else sees their status.
  useEffect(() => {
    if (loaded && details && !details.canApply && !submitting && !serverFailures) router.replace("/moderator");
  }, [loaded, details, submitting, serverFailures, router]);

  useEffect(() => {
    if (!startedRef.current && details?.canApply) {
      startedRef.current = true;
      track("moderator_apply_started");
    }
  }, [details]);

  useEffect(() => {
    if (draft.restored && !restoredTrackedRef.current) {
      restoredTrackedRef.current = true;
      track("moderator_draft_restored", { count: fileCount });
    }
  }, [draft.restored, fileCount]);

  useEffect(() => {
    if (!leaveLosesWork) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [leaveLosesWork]);

  if (!loaded || !draft.loaded) return <GPFullPageLoader />;

  const failures = serverFailures ?? details?.eligibility?.failures ?? [];
  const closed = details ? !details.applicationsOpen : false;

  const goBack = () => {
    if (leaveLosesWork) setLeaveOpen(true);
    else router.push("/moderator");
  };

  const confirmLeave = () => {
    abortRef.current?.abort();
    router.push("/moderator");
  };

  const pick = (field: ModeratorDocumentField, file: File) => {
    const kind = documents.find((d) => d.field === field)?.kind ?? field;
    const problem = validateDocument(file);
    if (problem) {
      track("moderator_document_rejected_client", { kind, reason: problem });
      setFieldErrors((current) => ({ ...current, [field]: copy.problems[problem] }));
      return;
    }
    track("moderator_document_added", { kind, mime: documentMimeType(file), sizeBucket: sizeBucket(file.size) });
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    draft.setFile(field, file);
  };

  const remove = (field: ModeratorDocumentField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    draft.setFile(field, null);
  };

  const submit = async () => {
    setInlineError(null);
    setGeneralErrors([]);

    const missing = documents.filter((d) => !draft.files[d.field]);
    if (missing.length > 0) {
      setFieldErrors((current) => {
        const next = { ...current };
        for (const d of missing) next[d.field] = copy.slot.missing;
        return next;
      });
      document.querySelector<HTMLButtonElement>(`[data-field="${missing[0].field}"] button`)?.focus();
      return;
    }

    const files = Object.fromEntries(documents.map((d) => [d.field, draft.files[d.field] as File])) as Record<
      ModeratorDocumentField,
      File
    >;
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);
    try {
      await service.applyForModerator(
        userId,
        { motivation: draft.motivation, files },
        { onProgress: setProgress, signal: controller.signal }
      );
      track("moderator_apply_submitted", { hasMotivation: !!draft.motivation.trim() });
      track("moderator_applied");
      toast.success(copy.success);
      await draft.clear();
      await refresh();
      router.replace("/moderator");
      return;
    } catch (err) {
      const error = resolveGroupPoolError(err);
      track("moderator_apply_failed", { code: error.code });
      if (error.code === "ABORTED") {
        // The user chose to leave; nothing to show.
      } else if (error.code === "INVALID_DOCUMENTS") {
        const mapped = mapDocumentErrors(
          error.details,
          documents.map((d) => d.field)
        );
        setFieldErrors(mapped.byField);
        setGeneralErrors(mapped.general);
        setInlineError(error.message);
        const first = documents.find((d) => mapped.byField[d.field]);
        if (first) document.querySelector<HTMLButtonElement>(`[data-field="${first.field}"] button`)?.focus();
      } else if (error.code === "NOT_ELIGIBLE") {
        setServerFailures(failuresFrom(error.data) ?? []);
        setInlineError(error.message);
      } else if (error.treatment === "inline") {
        setInlineError(error.message);
      } else {
        toast.error(error.message);
        if (SETTLED_CODES.includes(error.code)) await draft.clear();
        if (error.refetch) {
          await refresh();
          router.replace("/moderator");
        }
      }
    } finally {
      abortRef.current = null;
    }
    setProgress(null);
  };

  const blocked = closed || details?.canApply === false || (serverFailures?.length ?? 0) > 0;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-56 font-sans">
      <GPPageHeader eyebrow="Pool Moderator" title="Apply" onBack={goBack} />
      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {serverFailures && (
          <GPCard>
            <GPSectionTitle>Eligibility</GPSectionTitle>
            <EligibilityChecklist failures={failures} snapshot={details?.eligibility?.snapshot} />
          </GPCard>
        )}

        {draft.restored && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#D4A843]/10 dark:bg-[#D4A843]/15 border border-[#D4A843]/25 px-4 py-3">
            <p className="text-sm font-medium text-[#8A6A1E] dark:text-[#E2BB5C]">{copy.draftRestored}</p>
            <button
              type="button"
              onClick={() => {
                setFieldErrors({});
                void draft.clear();
              }}
              disabled={submitting}
              className="h-9 px-3 rounded-full text-xs font-bold text-[#8A6A1E] dark:text-[#E2BB5C] hover:bg-[#D4A843]/15"
            >
              {copy.draftClear}
            </button>
          </div>
        )}

        <GPCard>
          <GPSectionTitle className="mb-1">{copy.documentsTitle}</GPSectionTitle>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{copy.intro}</p>
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentUploadSlot
                key={doc.field}
                document={doc}
                file={draft.files[doc.field] ?? null}
                error={fieldErrors[doc.field] ?? null}
                disabled={submitting}
                onPick={(file) => pick(doc.field, file)}
                onRemove={() => remove(doc.field)}
              />
            ))}
          </div>
        </GPCard>

        <GPCard>
          <label htmlFor="motivation" className="block text-xs font-bold uppercase tracking-wide text-[#0C0F14] dark:text-white mb-2">
            {copy.motivationLabel} <span className="font-normal normal-case text-gray-400">(optional)</span>
          </label>
          <Textarea
            id="motivation"
            value={draft.motivation}
            maxLength={MOTIVATION_MAX_LENGTH}
            onChange={(e) => draft.setMotivation(e.target.value)}
            disabled={submitting}
            rows={5}
            placeholder={copy.motivationPlaceholder}
            className="rounded-xl bg-white dark:bg-[#0C0F14] border-black/10 dark:border-white/10 text-[#0C0F14] dark:text-white"
          />
          <p className="text-[10px] text-gray-400 text-right mt-1">
            {draft.motivation.length}/{MOTIVATION_MAX_LENGTH}
          </p>
        </GPCard>

        <div className="flex items-start gap-3 rounded-2xl bg-[#0D4F3C]/6 dark:bg-[#156B53]/10 px-4 py-3">
          <Lock className="w-4 h-4 text-[#0D4F3C] dark:text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {copy.privacy}
            {draft.persistent && ` ${copy.privacyDraft}`}
          </p>
        </div>
      </div>

      <GPStickyFooter>
        {(inlineError || generalErrors.length > 0) && (
          <div role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 px-1 space-y-0.5">
            {inlineError && <p>{inlineError}</p>}
            {generalErrors.map((line) => (
              <p key={line} className="text-xs">
                {line}
              </p>
            ))}
          </div>
        )}
        {!online && !submitting && (
          <p className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 px-1">
            <WifiOff className="w-4 h-4" aria-hidden="true" /> {copy.offline}
          </p>
        )}
        {submitting ? (
          <UploadProgress fraction={progress} />
        ) : (
          <GPPrimaryButton disabled={blocked || !online} onClick={submit}>
            {closed ? "Applications aren't open yet" : copy.submit}
          </GPPrimaryButton>
        )}
      </GPStickyFooter>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">
              {submitting ? copy.leaveSendingTitle : copy.leaveTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>{submitting ? copy.leaveSendingBody : copy.leaveUnsavedBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{submitting ? copy.keepSending : copy.stay}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? copy.stopSending : copy.leaveConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
