"use client";

import { FileText } from "lucide-react";
import type { ModeratorDocumentSummary, RequiredModeratorDocument } from "@/lib/api";
import { formatBytes, requiredDocumentsOrDefault } from "@/lib/moderatorDocuments";
import { formatDate } from "@/lib/pool-format";

interface SubmittedDocumentsListProps {
  documents: ModeratorDocumentSummary[];
  requiredDocuments?: RequiredModeratorDocument[];
}

/** The documents on a submitted application. Names and sizes only; applicants can't open them. */
export function SubmittedDocumentsList({ documents, requiredDocuments }: SubmittedDocumentsListProps) {
  const labels = new Map(requiredDocumentsOrDefault(requiredDocuments).map((d) => [d.kind, d.label]));

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.kind} className="flex items-start gap-3 rounded-xl bg-[#FBF6EF] dark:bg-white/5 px-3 py-2.5">
          <FileText className="w-5 h-5 text-[#0D4F3C] dark:text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">{labels.get(doc.kind) ?? doc.kind}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {doc.originalName} · {formatBytes(doc.bytes)} · {formatDate(doc.uploadedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
