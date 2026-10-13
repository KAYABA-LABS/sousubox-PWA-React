"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, ListChecks, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useDatabaseUserId } from "@/hooks/use-database-user-id";
import { useCountdown } from "@/hooks/use-countdown";
import { useGroupPoolService } from "@/services/groupPoolService";
import { useKycService } from "@/services/kycService";
import { isDevMode } from "@/lib/dev";
import { track } from "@/lib/analytics";
import { groupPoolCopy } from "@/lib/copy/groupPools";
import { formatDateTime } from "@/lib/pool-format";
import { isValidInviteCode, normalizeInviteCode } from "@/lib/inviteCode";
import { clearPendingInviteCode, readPendingInviteCode, savePendingInviteCode } from "@/lib/pendingInvite";
import { RATE_LIMITED, resolveGroupPoolError, syntheticError, type ResolvedGroupPoolError } from "@/lib/groupPoolErrors";
import type { GroupPoolPreview as GroupPoolPreviewData, JoinRequest } from "@/lib/api";
import { InviteCodeInput } from "@/components/group-pools/InviteCodeInput";
import { GroupPoolPreview } from "@/components/group-pools/GroupPoolPreview";
import { JoinRequestDrawer, type JoinRequestInput } from "@/components/group-pools/JoinRequestDrawer";
import { GateSheet } from "@/components/group-pools/GateSheet";
import {
  GPCard,
  GPFullPageLoader,
  GPPageHeader,
  GPPrimaryButton,
  GPSecondaryButton,
  GPStickyFooter,
} from "@/components/group-pools/ui";

const RATE_LIMIT_SECONDS = 60;
/** Inline errors that replace the Request button with a message (and maybe a link). */
const BLOCKING_INLINE = new Set(["REQUEST_REJECTED", "REQUEST_ALREADY_OPEN", "ALREADY_MEMBER", "MODERATOR_OWN_POOL"]);
const DRAWER_INLINE = new Set(["CONSENT_REQUIRED", "ORDER_ACCEPTANCE_REQUIRED"]);

export default function JoinPoolPage() {
  return (
    <Suspense fallback={<GPFullPageLoader />}>
      <JoinPoolContent />
    </Suspense>
  );
}

function JoinPoolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, ready, isLoaded, isSignedIn } = useDatabaseUserId();
  const service = useGroupPoolService();
  const kycService = useKycService();

  const codeParam = normalizeInviteCode(searchParams.get("code") ?? "");
  const activeCode = isValidInviteCode(codeParam) ? codeParam : null;
  const joinPath = activeCode ? `/pools/join?code=${activeCode}` : "/pools/join";

  const [codeInput, setCodeInput] = useState(codeParam);
  const [codeError, setCodeError] = useState<string | null>(null);
  const rateLimit = useCountdown(RATE_LIMIT_SECONDS);

  const [preview, setPreview] = useState<GroupPoolPreviewData | null>(null);
  // The preview reloads whenever the code or this token changes; `loadedKey` marks the finished load.
  const [reloadToken, setReloadToken] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const previewKey = activeCode ? `${activeCode}#${reloadToken}` : null;
  const isLoadingPreview = ready && previewKey !== null && loadedKey !== previewKey;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCheckingKyc, setIsCheckingKyc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerError, setDrawerError] = useState<ResolvedGroupPoolError | null>(null);
  const [blockingError, setBlockingError] = useState<ResolvedGroupPoolError | null>(null);
  const [sheetError, setSheetError] = useState<ResolvedGroupPoolError | null>(null);
  const [sentRequest, setSentRequest] = useState<JoinRequest | null>(null);

  // Signed-out visitors (e.g. from a shared link) sign in first and come back here.
  useEffect(() => {
    if (!isLoaded || isSignedIn || isDevMode()) return;
    if (activeCode) savePendingInviteCode(activeCode);
    router.replace(`/signin?redirect_url=${encodeURIComponent(joinPath)}`);
  }, [isLoaded, isSignedIn, activeCode, joinPath, router]);

  // No code in the URL: fall back to one saved before a sign-in/KYC detour.
  useEffect(() => {
    if (codeParam) return;
    const saved = readPendingInviteCode();
    if (saved && isValidInviteCode(saved)) router.replace(`/pools/join?code=${normalizeInviteCode(saved)}`);
  }, [codeParam, router]);

  const startRateLimit = rateLimit.start;
  useEffect(() => {
    if (!ready || !activeCode || !previewKey) return;
    let cancelled = false;
    service.getPreview(userId, activeCode).then(
      (result) => {
        if (cancelled) return;
        setPreview(result);
        setCodeInput(activeCode);
        setCodeError(null);
        setLoadedKey(previewKey);
        track("group_join_preview_viewed", { poolId: result.id });
      },
      (err) => {
        if (cancelled) return;
        const error = resolveGroupPoolError(err);
        setPreview(null);
        setCodeInput(activeCode);
        setLoadedKey(previewKey);
        if (error.code === RATE_LIMITED) startRateLimit();
        if (error.treatment === "inline") setCodeError(error.message);
        else toast.error(error.message);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [ready, activeCode, previewKey, service, userId, startRateLimit]);

  const refreshPreview = () => setReloadToken((token) => token + 1);

  const submitCode = () => {
    const code = normalizeInviteCode(codeInput);
    track("group_join_code_submitted");
    setBlockingError(null);
    setSentRequest(null);
    setCodeError(null);
    if (code === activeCode) refreshPreview();
    else router.replace(`/pools/join?code=${code}`);
  };

  const openRequestDrawer = async () => {
    setIsCheckingKyc(true);
    try {
      const kyc = await kycService.getStatus(userId);
      if (kyc.status !== "VERIFIED") {
        if (activeCode) savePendingInviteCode(activeCode);
        setSheetError(syntheticError("KYC_REQUIRED"));
        track("group_join_blocked", { code: "KYC_REQUIRED" });
        setIsCheckingKyc(false);
        return;
      }
    } catch {
      // let the server's KYC gate decide
    }
    setIsCheckingKyc(false);
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const submitRequest = async ({ acceptPayoutOrder, note }: JoinRequestInput) => {
    if (!activeCode || !preview) return;
    setSubmitting(true);
    setDrawerError(null);
    try {
      const request = await service.requestToJoin(userId, {
        code: activeCode,
        debtVisibilityConsent: true,
        ...(acceptPayoutOrder ? { acceptPayoutOrder: true } : {}),
        ...(note ? { note } : {}),
      });
      track("group_join_requested", { poolId: preview.id });
      clearPendingInviteCode();
      setDrawerOpen(false);
      setSentRequest(request);
      setPreview((prev) =>
        prev && request
          ? { ...prev, myRequest: { id: request.id, status: request.status, createdAt: request.createdAt, expiresAt: request.expiresAt } }
          : prev
      );
    } catch (err) {
      const error = resolveGroupPoolError(err);
      track("group_join_blocked", { code: error.code });
      if (DRAWER_INLINE.has(error.code)) {
        setDrawerError(error);
      } else if (error.treatment === "sheet") {
        setDrawerOpen(false);
        setSheetError(error);
      } else if (BLOCKING_INLINE.has(error.code) || error.treatment === "inline") {
        setDrawerOpen(false);
        setBlockingError(error);
      } else {
        toast.error(error.message);
        if (error.refetch) {
          setDrawerOpen(false);
          refreshPreview();
        }
      }
    }
    setSubmitting(false);
  };

  if (!isLoaded || (!isSignedIn && !isDevMode())) return <GPFullPageLoader />;

  const header = (
    <GPPageHeader
      eyebrow="Group pools"
      title={groupPoolCopy.joinWithCode}
      onBack={() => router.push("/pools")}
      right={
        <button
          onClick={() => router.push("/pools/join/requests")}
          className="h-10 px-3 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0C0F14] dark:text-white"
        >
          <ListChecks className="w-4 h-4" /> My requests
        </button>
      }
    />
  );

  const showPreview = !!preview && !!activeCode && !isLoadingPreview;

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col pb-48 font-sans">
      {header}

      <div className="flex-1 px-5 max-w-xl mx-auto w-full space-y-4">
        {!showPreview && (
          <GPCard>
            <InviteCodeInput
              value={codeInput}
              onChange={(value) => {
                setCodeInput(value);
                setCodeError(null);
              }}
              onSubmit={submitCode}
              onScan={() => router.push("/scan")}
              error={
                rateLimit.isRunning
                  ? `Too many tries. Try again in ${rateLimit.secondsLeft}s.`
                  : codeError
              }
              disabled={rateLimit.isRunning}
              loading={isLoadingPreview}
            />
          </GPCard>
        )}

        {showPreview && (
          <>
            {sentRequest && (
              <GPCard className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-[#0C0F14] dark:text-white">
                    {groupPoolCopy.requestSent(
                      preview.moderator.firstName || preview.moderator.username,
                      formatDateTime(sentRequest.expiresAt)
                    )}
                  </p>
                </div>
              </GPCard>
            )}
            <GroupPoolPreview pool={preview} myUserId={userId} />
            <button
              onClick={() => {
                setPreview(null);
                setSentRequest(null);
                setBlockingError(null);
                setCodeInput("");
                router.replace("/pools/join");
              }}
              className="w-full text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2"
            >
              Use a different code
            </button>
          </>
        )}
      </div>

      {showPreview && (
        <GPStickyFooter>
          <JoinFooter
            pool={preview}
            blockingError={blockingError}
            checkingKyc={isCheckingKyc}
            onRequest={openRequestDrawer}
            onViewRequests={() => router.push("/pools/join/requests")}
            onOpenPool={() => router.push(`/pools/${preview.id}?type=joined`)}
          />
        </GPStickyFooter>
      )}

      {preview && (
        <JoinRequestDrawer
          key={preview.id}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          pool={preview}
          myUserId={userId}
          submitting={submitting}
          errorCode={drawerError?.code}
          errorMessage={drawerError?.message}
          onSubmit={submitRequest}
        />
      )}

      <GateSheet
        error={sheetError}
        onClose={() => setSheetError(null)}
        joinAmount={preview?.joinAmount}
        returnTo={joinPath}
      />
    </main>
  );
}

function JoinFooter({
  pool,
  blockingError,
  checkingKyc,
  onRequest,
  onViewRequests,
  onOpenPool,
}: {
  pool: GroupPoolPreviewData;
  blockingError: ResolvedGroupPoolError | null;
  checkingKyc: boolean;
  onRequest: () => void;
  onViewRequests: () => void;
  onOpenPool: () => void;
}) {
  const request = pool.myRequest;
  const code = blockingError?.code ?? (request?.status === "REJECTED" ? "REQUEST_REJECTED" : null);

  if (code) {
    const message = code === "REQUEST_REJECTED" ? groupPoolCopy.rejected : blockingError?.message;
    return (
      <>
        <FooterNotice icon={<XCircle className="w-4 h-4" />} text={message ?? ""} />
        {code === "REQUEST_ALREADY_OPEN" && <GPSecondaryButton onClick={onViewRequests}>View my requests</GPSecondaryButton>}
        {code === "ALREADY_MEMBER" && <GPSecondaryButton onClick={onOpenPool}>Open the pool</GPSecondaryButton>}
      </>
    );
  }

  if (request?.status === "PENDING") {
    return (
      <>
        <FooterNotice
          icon={<Clock className="w-4 h-4" />}
          text={`Request pending · expires ${formatDateTime(request.expiresAt)}`}
        />
        <GPSecondaryButton onClick={onViewRequests}>View my requests</GPSecondaryButton>
      </>
    );
  }

  if (request?.status === "AWAITING_FUNDS") {
    return (
      <>
        <FooterNotice icon={<CheckCircle2 className="w-4 h-4" />} text="You're approved! Top up to take your spot." />
        <GPPrimaryButton onClick={onViewRequests}>{groupPoolCopy.topUpAndComplete}</GPPrimaryButton>
      </>
    );
  }

  if (request?.status === "JOINED" || request?.status === "APPROVED") {
    return <GPPrimaryButton onClick={onOpenPool}>Open the pool</GPPrimaryButton>;
  }

  if (pool.spotsRemaining <= 0) {
    return <GPPrimaryButton disabled>Pool is full</GPPrimaryButton>;
  }

  return (
    <GPPrimaryButton onClick={onRequest} loading={checkingKyc}>
      Request to join
    </GPPrimaryButton>
  );
}

function FooterNotice({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300 px-1">
      {icon}
      <span>{text}</span>
    </div>
  );
}
