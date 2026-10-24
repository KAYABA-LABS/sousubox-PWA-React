"use client";

import { useEffect, useId, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import type { RequiredModeratorDocument } from "@/lib/api";
import { DOCUMENT_ACCEPT, documentMimeType, formatBytes } from "@/lib/moderatorDocuments";
import { moderatorApplicationCopy as copy } from "@/lib/copy/moderatorApplication";
import { cn } from "@/lib/utils";

const PREVIEWABLE = ["image/jpeg", "image/png", "image/webp"];

interface DocumentUploadSlotProps {
  document: RequiredModeratorDocument;
  file: File | null;
  error: string | null;
  disabled?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

/** One required document: help text, a single file picker, preview, replace/remove and its error. */
export function DocumentUploadSlot({ document, file, error, disabled, onPick, onRemove }: DocumentUploadSlotProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const help = copy.documents[document.kind];
  const previewRef = useRef<HTMLImageElement>(null);
  const previewable = !!file && PREVIEWABLE.includes(documentMimeType(file) ?? "");

  // The object URL lives only as long as this file is shown.
  useEffect(() => {
    const img = previewRef.current;
    if (!file || !previewable || !img) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, previewable]);

  const openPicker = () => inputRef.current?.click();
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={error ? `${helpId} ${errorId}` : helpId}
      data-field={document.field}
      className={cn(
        "rounded-2xl border p-4 bg-[#FBF6EF] dark:bg-white/5",
        error ? "border-red-400/70 dark:border-red-500/50" : "border-black/[0.06] dark:border-white/10"
      )}
    >
      <p id={labelId} className="text-sm font-bold text-[#0C0F14] dark:text-white">
        {document.label}
      </p>
      <div id={helpId} className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
        <p>{help?.help}</p>
        {help?.examples && <p className="text-gray-500 dark:text-gray-400">{help.examples}</p>}
        {help?.multiPage && <p className="text-gray-500 dark:text-gray-400">{copy.slot.multiPage}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        data-testid={`file-${document.field}`}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          // Reset so picking the same file again still fires a change.
          e.target.value = "";
          if (picked) onPick(picked);
        }}
      />

      {file ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white dark:bg-[#151A1F] border border-black/[0.06] dark:border-white/10 p-2.5">
          {previewable ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img ref={previewRef} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-black/5" />
          ) : (
            <span className="w-12 h-12 rounded-lg bg-[#0D4F3C]/10 dark:bg-[#156B53]/15 text-[#0D4F3C] dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0C0F14] dark:text-white truncate">{file.name}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            aria-label={`${copy.slot.replace} ${document.label}`}
            className="h-11 px-3 rounded-full text-xs font-bold text-[#0D4F3C] dark:text-emerald-300 hover:bg-[#0D4F3C]/10 disabled:opacity-50"
          >
            {copy.slot.replace}
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`${copy.slot.remove} ${document.label}`}
            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            aria-label={`${copy.slot.upload}: ${document.label}`}
            className="mt-3 w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#0D4F3C]/40 dark:border-emerald-300/30 text-[#0D4F3C] dark:text-emerald-300 text-sm font-bold hover:bg-[#0D4F3C]/5 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {copy.slot.upload}
          </button>
          <p className="mt-1.5 text-[10px] text-gray-400 text-center">{copy.slot.hint}</p>
        </>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
