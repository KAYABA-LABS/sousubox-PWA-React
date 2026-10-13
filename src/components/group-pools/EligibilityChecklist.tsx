"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { checkForRow, ELIGIBILITY_CHECKS, failureFor, snapshotRows } from "@/lib/moderatorEligibility";
import type { EligibilityFailure } from "@/lib/api";

interface EligibilityChecklistProps {
  failures: EligibilityFailure[];
  snapshot?: Record<string, unknown> | null;
}

export function EligibilityChecklist({ failures, snapshot }: EligibilityChecklistProps) {
  const rows = snapshotRows(snapshot);
  const rowsByCheck = new Map<string, typeof rows>();
  const unmatched: typeof rows = [];
  for (const row of rows) {
    const code = checkForRow(row);
    if (code) rowsByCheck.set(code, [...(rowsByCheck.get(code) ?? []), row]);
    else unmatched.push(row);
  }
  // Failures with codes we don't know still need to be shown.
  const unknownFailures = failures.filter((f) => !ELIGIBILITY_CHECKS.some((c) => c.code === f.code));

  return (
    <ul className="space-y-2" aria-label="Eligibility">
      {ELIGIBILITY_CHECKS.map((check) => {
        const failure = failureFor(failures, check.code);
        const detail = rowsByCheck.get(check.code) ?? [];
        return (
          <li key={check.code} className="flex items-start gap-3 rounded-xl bg-[#FBF6EF] dark:bg-white/5 px-3 py-2.5">
            {failure ? (
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-label="Not met" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-label="Met" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0C0F14] dark:text-white">{check.label}</p>
              {failure && <p className="text-xs text-gray-600 dark:text-gray-300">{failure.message}</p>}
              {detail.map((row) => (
                <p key={row.key} className="text-[11px] text-gray-500 dark:text-gray-400">
                  You: {row.value}
                  {row.required !== null && ` · Needed: ${row.required}`}
                </p>
              ))}
            </div>
          </li>
        );
      })}
      {unknownFailures.map((failure) => (
        <li key={failure.code} className="flex items-start gap-3 rounded-xl bg-[#FBF6EF] dark:bg-white/5 px-3 py-2.5">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-label="Not met" />
          <p className="text-sm text-[#0C0F14] dark:text-white">{failure.message}</p>
        </li>
      ))}
      {unmatched.length > 0 && (
        <li className="px-3 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {unmatched.map((row) => (
            <span key={row.key} className="block">
              {row.label}: {row.value}
              {row.required !== null && ` (needed: ${row.required})`}
            </span>
          ))}
        </li>
      )}
    </ul>
  );
}
