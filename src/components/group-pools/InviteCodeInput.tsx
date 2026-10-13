"use client";

import { ClipboardPaste, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { extractInviteCode, INVITE_CODE_LENGTH, normalizeInviteCode } from "@/lib/inviteCode";
import { groupPoolCopy } from "@/lib/copy/groupPools";

interface InviteCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onSubmit: () => void;
  onScan?: () => void;
  error?: string | null;
  disabled?: boolean;
  loading?: boolean;
}

export function InviteCodeInput({ value, onChange, onSubmit, onScan, error, disabled, loading }: InviteCodeInputProps) {
  const complete = value.length === INVITE_CODE_LENGTH;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const code = extractInviteCode(text) ?? normalizeInviteCode(text).slice(0, INVITE_CODE_LENGTH);
      if (!code) {
        toast.error("Nothing to paste");
        return;
      }
      onChange(code);
    } catch {
      toast.error("Couldn't read the clipboard. Type the code instead.");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (complete && !disabled && !loading) onSubmit();
      }}
      className="space-y-3"
    >
      <label htmlFor="invite-code" className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
        {groupPoolCopy.codeHint}
      </label>
      <input
        id="invite-code"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="ABCD2345"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(normalizeInviteCode(e.target.value).slice(0, INVITE_CODE_LENGTH))}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          const code = extractInviteCode(text);
          if (code) {
            e.preventDefault();
            onChange(code);
          }
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "invite-code-error" : undefined}
        className={cn(
          "w-full h-16 px-4 text-center font-mono text-2xl font-bold tracking-[0.35em] uppercase bg-white dark:bg-[#151A1F] border rounded-2xl text-[#0C0F14] dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-colors disabled:opacity-50",
          error
            ? "border-red-400 focus:ring-red-400/20"
            : "border-black/10 dark:border-white/10 focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:ring-[#0D4F3C]/10"
        )}
      />
      {error && (
        <p id="invite-code-error" role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePaste}
          disabled={disabled}
          className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0C0F14] dark:text-white disabled:opacity-50"
        >
          <ClipboardPaste className="w-4 h-4" /> Paste
        </button>
        {onScan && (
          <button
            type="button"
            onClick={onScan}
            disabled={disabled}
            className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#0C0F14] dark:text-white disabled:opacity-50"
          >
            <ScanLine className="w-4 h-4" /> Scan QR
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!complete || disabled || loading}
        className="w-full h-14 inline-flex items-center justify-center bg-[#0D4F3C] hover:bg-[#156B53] active:scale-[0.99] text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
      </button>
    </form>
  );
}
