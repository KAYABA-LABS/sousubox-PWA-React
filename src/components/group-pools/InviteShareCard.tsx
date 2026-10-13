"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
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
import { inviteUrl } from "@/lib/inviteCode";
import { track } from "@/lib/analytics";
import { GPCard, GPSecondaryButton, GPSectionTitle } from "./ui";

interface InviteShareCardProps {
  poolId: string;
  poolName: string;
  code: string;
  onRegenerate?: () => Promise<void>;
}

export function InviteShareCard({ poolId, poolName, code, onRegenerate }: InviteShareCardProps) {
  const url = inviteUrl(code);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 280, margin: 1, color: { dark: "#0C0F14", light: "#FFFFFF" } })
      .then((data) => !cancelled && setQr(data))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(`${what} copied`);
      track("group_invite_shared", { poolId, channel: "copy" });
    } catch {
      toast.error(`Couldn't copy ${what.toLowerCase()}`);
    }
  };

  const share = async () => {
    const text = `Join "${poolName}" on Sousubox with code ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${poolName}`, text, url });
        track("group_invite_shared", { poolId, channel: "share" });
      } catch {
        // dismissed
      }
      return;
    }
    copy(url, "Invite link");
  };

  return (
    <GPCard>
      <GPSectionTitle>Invite members</GPSectionTitle>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#0D4F3C]/30 dark:border-[#156B53]/40 bg-[#FBF6EF] dark:bg-white/5 pl-4 pr-1.5 py-1.5">
        <span className="font-mono text-xl font-bold tracking-[0.25em] text-[#0C0F14] dark:text-white" data-testid="invite-code">
          {code}
        </span>
        <button
          onClick={() => copy(code, "Code")}
          aria-label="Copy invite code"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#0D4F3C] dark:text-emerald-300 hover:bg-[#0D4F3C]/10"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {qr && (
        // eslint-disable-next-line @next/next/no-img-element -- data URL generated on the client
        <img src={qr} alt={`QR code to join ${poolName}`} className="mx-auto mt-4 w-44 h-44 rounded-xl bg-white p-2" />
      )}

      <p className="mt-3 text-[11px] text-center text-gray-500 dark:text-gray-400 break-all">{url}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <GPSecondaryButton onClick={share}>
          <Share2 className="w-4 h-4" /> Share link
        </GPSecondaryButton>
        <GPSecondaryButton onClick={() => copy(url, "Invite link")}>
          <Copy className="w-4 h-4" /> Copy link
        </GPSecondaryButton>
      </div>

      {onRegenerate && (
        <button
          onClick={() => setConfirmRegenerate(true)}
          disabled={regenerating}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} /> Create a new code
        </button>
      )}

      <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
        <AlertDialogContent className="bg-white dark:bg-[#151A1F] border-black/10 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0C0F14] dark:text-white">Create a new code?</AlertDialogTitle>
            <AlertDialogDescription>The current code and link stop working immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep this code</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0D4F3C] hover:bg-[#156B53] text-white"
              onClick={async () => {
                if (!onRegenerate) return;
                setRegenerating(true);
                await onRegenerate();
                setRegenerating(false);
              }}
            >
              Create new code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GPCard>
  );
}
