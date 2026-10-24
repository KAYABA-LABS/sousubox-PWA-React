# Moderator Application — Frontend Plan

> Scope: the "Become a Pool Moderator" application only: status, eligibility, the form with three document uploads, and post-submission states.
> Status: **approved and implemented (S1–S7). S0, the Vercel body-limit check, is still pending** and must run on a Vercel preview before release.
> Backend facts come from the backend brief (checked 2026-10-15). Client facts come from this repo at `a4d39f2` (MVP-prod-1).

---

## 1. Summary

- **Platform correction:** the brief targets Expo / React Native, but this client is a **Next.js 16 PWA**. File picking uses `<input type="file">`, and files are browser `File` objects appended to `FormData` (not `{ uri, name, type }`). Everything else in the brief still applies.
- **Most of the area already exists** (group pools P1–P4): the Profile → `/moderator` entry, the status screen for every status, `EligibilityChecklist`, the activity ping and a JSON-only `/moderator/apply`. This work **extends** those screens instead of adding new ones.
- **Apply form:** one scrolling page. It has three upload slots driven by `requiredDocuments`, each with a single "Upload file" button (gallery or files, PDF or image, no camera capture), the optional motivation, a privacy notice, and a sticky Submit with a real upload progress bar.
- **Files are sent as originals** (no compression). The client mirrors the server rules (6 MIME types, ≤ 10 MB, not empty, all three required) and validates as soon as a file is picked.
- **Transport:** stays on the `/api/backend` rewrite. A new XHR-based `apiUpload` helper adds upload progress. Step 0 checks that the hosting proxy accepts up to ~30 MB bodies.
- **Draft:** picked files and the motivation are kept in **IndexedDB**, scoped to the user, and survive reloads. They're cleared on successful submit, on sign-out, when the user changes, and after 14 days.
- **Errors:** `INVALID_DOCUMENTS.details[]` is mapped to the matching slot using the `field:` prefix. Other codes use the existing `groupPoolErrors` map. Picked files are never lost on failure.
- **Status screens:** PENDING adds a "What you sent" list built from `documents[]`. REJECTED says all three documents must be uploaded again. The checklist stays as it is.

---

## 2. Decisions log

| # | Topic | Question | Owner answer | Resulting rule |
|---|---|---|---|---|
| 1 | Platform | Expo pickers / `{uri,name,type}`? | *From repo:* Next.js PWA | Use `<input type="file">` and `File`, and never set `Content-Type` (`apiFetch` already skips it for `FormData`). |
| 2 | Entry point | Where, and shown to ineligible users? | *Already decided* (group pools plan, decision 3) | The `ModeratorProfileRow` on `/profile` opens `/moderator` for everyone. Ineligible users see the checklist. No change. |
| 3 | Form shape | Single page vs stepper | **Extend single page** | `/moderator/apply` order: eligibility (only if the server returns failures) → 3 document slots → motivation → privacy notice → sticky Submit. |
| 4 | Pickers | Camera / gallery / files | **One button per slot; gallery or files only; no camera** | One hidden `<input type="file" accept=…>` per slot, with **no `capture` attribute**. Button label: "Upload file". |
| 5 | Image processing | Compress / convert HEIC? | **Send originals** | No resize or re-encode. Over 10 MB is rejected on the client with a hint to use a smaller scan or a PDF. |
| 6 | Transport | Proxy, progress, direct? | **Proxy + XHR progress** | New `apiUpload()` uses `XMLHttpRequest` through `/api/backend` and reports `upload.onprogress`. Step 0 verifies the host body limit (see §10, R1). |
| 7 | Draft | What survives leaving the page? | **Persist files in IndexedDB** | `moderatorDraft` IndexedDB store keyed by backend `userId`, holding the 3 file blobs and the motivation. Cleared on successful submit, sign-out, user change, a non-applyable status, or after 14 days. Falls back to memory if IndexedDB is unavailable. |
| 8 | Copy | Reference-letter guidance | **Examples + letter basics** | See §7. |
| 9 | Checklist | Add fix-it actions? | **Keep as-is** | `EligibilityChecklist` is unchanged. Only the TS type of `snapshot` is tightened. |
| 10 | Backend | Which GAPs to request | **View own submitted docs** | Only B1 in §8 is filed. Withdraw, push/deep link and server draft are recorded as not requested. |
| 11 | Refresh | When to call status | *Already decided* (group pools plan, decision 21) | `useModeratorAreaStatus` pings on every `/moderator*` visit. Add `useRefetchOnFocus` on `/moderator` and `/moderator/apply` so an admin decision (an in-app notification only) shows up when the user returns. |
| 12 | Release | Analytics / tests / flag | *Already decided* (group pools plan, decision 25) | Existing `track()`, Vitest + Testing Library, Playwright with `mockApi`, behind `NEXT_PUBLIC_GROUP_POOLS`. |
| 13 | Hosting | Where is production hosted? | **Vercel** | R1 is a real risk. S0 must run on a Vercel preview deployment, not only locally. |
| 14 | Copy | Which business document? | **Business incorporation certificate** | Slot copy says "Certificate of incorporation". Ask the backend to align its `requiredDocuments` label (B2). |
| 15 | Copy | Utility bill recency | **Issued in the last 3 months** | Help text says so. The client can't check the date; the admin does. |
| 16 | Tests | IndexedDB test approach | **Add `fake-indexeddb` (dev only)** | Tests exercise the real IndexedDB code path instead of a mock adapter. It's test-only and never ships to users. |
| 17 | Copy | Review time on PENDING | **None** | PENDING stays open-ended and promises no time frame. |
| 18 | Navigation | How users reach the form | *From repo* | Profile → "Pool Moderator" row (the last card on the page) → `/moderator` → "Apply to become a moderator" → `/moderator/apply`. The form has no other entry point, and it redirects to `/moderator` unless `canApply`. |

**Defaults I chose (not asked; change any you disagree with):**
- **Submit is blocking:** a progress bar and the form disabled while sending. Leaving mid-upload triggers a `beforeunload` prompt, and in-app back shows a confirm dialog. If the tab is backgrounded the XHR keeps going. If it's killed, the IndexedDB draft is still there.
- **Offline:** when `navigator.onLine === false`, Submit is disabled with "You're offline. Your files are saved on this device." On reconnect it re-enables. There's no automatic background retry.
- **Validation timing:** each file is checked when it's picked (per slot). Required slots are checked on Submit. The motivation counter is live and capped at 1000 by `maxLength`.

---

## 3. Current-state findings

| Area | Finding | Path |
|---|---|---|
| Routing | Next.js App Router. Moderator area under `/moderator/*`, gated by the feature flag in its layout. | [src/app/moderator/layout.tsx](../src/app/moderator/layout.tsx) |
| Entry point | `ModeratorProfileRow` with a status chip from the cached store. | [src/components/group-pools/ModeratorProfileRow.tsx](../src/components/group-pools/ModeratorProfileRow.tsx), [src/app/profile/page.tsx](../src/app/profile/page.tsx) |
| Status screen | `ModeratorStatusView` handles NONE/PENDING/REJECTED/SUSPENDED/REVOKED, the closed state and the "Contact support" link (→ `/settings/help`). APPROVED shows the dashboard. | [src/app/moderator/page.tsx](../src/app/moderator/page.tsx) |
| Apply form | Checklist + `Textarea` (1000 max, counter) + `GPPrimaryButton`. Sends **JSON** `{ motivation }`. Handles `NOT_ELIGIBLE` and refetch codes. | [src/app/moderator/apply/page.tsx](../src/app/moderator/apply/page.tsx) |
| API client | `apiFetch` (fetch). `userId` is a path param via `resolveUserId()`. `ApiError { code, status, details, data }`. Already skips `Content-Type` for `FormData`. No progress support. | [src/lib/api.ts:25-80](../src/lib/api.ts#L25-L80) |
| Moderator API | `getModeratorStatus`, `applyForModerator(userId, motivation)` (JSON). | [src/lib/api.ts:913-920](../src/lib/api.ts#L913-L920) |
| Types | `ModeratorStatusResponse` lacks `documents` and `requiredDocuments`. `snapshot` is `Record<string, unknown>`. | [src/lib/api.ts:440-449](../src/lib/api.ts#L440-L449) |
| Service | `useGroupPoolService().applyForModerator` → `unwrap()`. | [src/services/groupPoolService.ts:69](../src/services/groupPoolService.ts#L69) |
| Status cache + ping | zustand `useModeratorStore` (persists `ownerId` and `status`), plus `useModeratorPing` / `useModeratorAreaStatus`. | [src/stores/useModeratorStore.ts](../src/stores/useModeratorStore.ts), [src/hooks/use-moderator-ping.ts](../src/hooks/use-moderator-ping.ts) |
| **Existing upload code to reuse** | Profile photo: hidden `<input type="file" accept="image/*">` + button, `File` type and size checks (10 MB), object-URL preview revoked on change, `FormData.append("photo", blob, filename)`. | [src/app/settings/photo/page.tsx](../src/app/settings/photo/page.tsx), [src/lib/api.ts:813](../src/lib/api.ts#L813) |
| KYC | Hosted verification session, with no document upload code. Status values NOT_SUBMITTED/PENDING/UNDER_REVIEW/VERIFIED/REJECTED/EXPIRED. | [src/app/kyc/page.tsx](../src/app/kyc/page.tsx) |
| Camera | `src/lib/camera.ts` (getUserMedia, used by the scanner). **Not used here** (decision 4). | [src/lib/camera.ts](../src/lib/camera.ts) |
| Errors | Central code map with inline, toast, sheet and page treatments. Has APPLICATIONS_CLOSED, NOT_ELIGIBLE and ALREADY_*, but **no `INVALID_DOCUMENTS`**. | [src/lib/groupPoolErrors.ts](../src/lib/groupPoolErrors.ts) |
| Eligibility | `EligibilityChecklist` + `moderatorEligibility.ts` (keyword-matches snapshot keys). | [src/components/group-pools/EligibilityChecklist.tsx](../src/components/group-pools/EligibilityChecklist.tsx), [src/lib/moderatorEligibility.ts](../src/lib/moderatorEligibility.ts) |
| UI kit | `GPCard`, `GPSectionTitle`, `GPPrimaryButton/Secondary` (`loading`), `GPChip`, `GPPageHeader`, `GPStickyFooter`, `GPFullPageMessage`. shadcn `progress`, `alert-dialog`, `drawer`, `textarea`. lucide icons. `sonner` toasts. | [src/components/group-pools/ui.tsx](../src/components/group-pools/ui.tsx), [src/components/ui/](../src/components/ui/) |
| Theme | Cream `#FBF6EF` / ink `#0C0F14`, green `#0D4F3C` / `#156B53`, gold `#D4A843`, cards `#151A1F` (dark). Rounded 24px cards, 10px uppercase section titles. | — |
| Copy | Group-pool strings live in `src/lib/copy/groupPools.ts`. Plain English, second person, short sentences. | [src/lib/copy/groupPools.ts](../src/lib/copy/groupPools.ts) |
| Proxy | `next.config.ts` rewrites `/api/backend/:path*` → `NEXT_PUBLIC_API_URL`. The middleware matcher excludes `api/backend`. `public/sw.js` ignores non-GET requests. | [next.config.ts](../next.config.ts), [src/middleware.ts:68-71](../src/middleware.ts#L68-L71), [public/sw.js:30](../public/sw.js#L30) |
| Sign-out | `useClerk().signOut()` is called in Settings and Close account. These are where the draft gets cleared. | [src/app/settings/page.tsx:141](../src/app/settings/page.tsx#L141), [src/app/settings/close/page.tsx:23](../src/app/settings/close/page.tsx#L23) |
| Tests | Vitest unit tests in `src/lib/__tests__`, component tests in `src/components/group-pools/__tests__`. `e2e/moderator.spec.ts` asserts the **JSON** apply body, so it must be updated. | [e2e/moderator.spec.ts:49-66](../e2e/moderator.spec.ts#L49-L66), [e2e/mockApi.ts](../e2e/mockApi.ts) |
| Not installed | No IndexedDB wrapper, no image libraries. The native IndexedDB API is enough. | — |

---

## 4. Screen and component map

| Screen / component | Route | New / changed | What changes | Reuses | Endpoints |
|---|---|---|---|---|---|
| Profile row | `/profile` | Unchanged | — | — | (cached status) |
| Moderator home: status view | `/moderator` | Changed | PENDING: add `SubmittedDocumentsList` and a "What happens next" line. REJECTED: add "You'll need to upload all three documents again." Closed: unchanged. Add `useRefetchOnFocus`. | `GPCard`, `EligibilityChecklist` | `GET /moderator/status/:userId` |
| Apply | `/moderator/apply` | **Changed (major)** | Redirect to `/moderator` unless `canApply`. 3 × `DocumentUploadSlot` from `requiredDocuments`, then motivation, `PrivacyNotice`, `GPStickyFooter` with Submit + `UploadProgress`. Draft restore banner. Leave guard. | `GPCard`, `Textarea`, `GPPrimaryButton`, `GPStickyFooter`, `Progress`, `AlertDialog` | `GET /moderator/status`, `POST /moderator/apply/:userId` (multipart) |
| `DocumentUploadSlot` | — | New | Label (from `requiredDocuments[].label`), help and examples (client copy by `kind`), empty state → "Upload file". Filled state → thumbnail (image) or file icon (PDF/HEIC), name, size, "Replace", "Remove". Error line (client or server). `aria-describedby` links the help and error. | photo-page input pattern | — |
| `SubmittedDocumentsList` | — | New | Rows: kind label · original name · size · uploaded date. No link (no URL is returned). | `GPCard` | (from status) |
| `UploadProgress` | — | New | Determinate `Progress` + "Sending… 42%". "Finishing up…" once bytes are sent but there's no response yet. | `ui/progress` | — |
| `PrivacyNotice` | — | New | Lock icon + text (§7). | — | — |

New files: `src/components/group-pools/DocumentUploadSlot.tsx`, `SubmittedDocumentsList.tsx`, `UploadProgress.tsx`, `src/lib/moderatorDocuments.ts`, `src/lib/moderatorDraft.ts`, `src/hooks/use-moderator-draft.ts`, `src/lib/copy/moderatorApplication.ts`.

---

## 5. Data layer

### 5.1 Types (`src/lib/api.ts`)

```ts
export type ModeratorDocumentKind = "BUSINESS_REGISTRATION" | "PROOF_OF_ADDRESS" | "REFERENCE_LETTER";
export type ModeratorDocumentField = "businessRegistration" | "proofOfAddress" | "referenceLetter";

export interface ModeratorDocumentSummary {
  kind: ModeratorDocumentKind; originalName: string; mimeType: string; bytes: number; uploadedAt: string;
}
export interface RequiredModeratorDocument { kind: ModeratorDocumentKind; field: ModeratorDocumentField; label: string }

// `type` (not `interface`) so it stays assignable to the checklist's Record<string, unknown> prop.
export type ModeratorEligibilitySnapshot = {
  kycStatus: string; amountOwedBalance: number; groupDebtOutstanding: number;
  reputationScore: number; accountAgeDays: number; completedPools: number;
  required: { minReputation: number; minAccountAgeDays: number; minCompletedPools: number };
};

export interface ModeratorStatusResponse {
  status: ModeratorStatus;
  appliedAt: string | null; decidedAt: string | null; decisionReason: string | null;
  documents: ModeratorDocumentSummary[];              // new
  requiredDocuments: RequiredModeratorDocument[];     // new
  maxConcurrentModeratedPools?: number;               // now optional (APPROVED only)
  applicationsOpen: boolean; canApply: boolean;
  eligibility: { eligible: boolean; failures: EligibilityFailure[]; snapshot: ModeratorEligibilitySnapshot } | null;
}

export interface ModeratorApplication {
  motivation?: string;
  files: Record<ModeratorDocumentField, File>;
}
```

`/moderator/page.tsx` already guards `maxPools > 0`. It passes `details.maxConcurrentModeratedPools ?? 0`.

### 5.2 Upload transport (`src/lib/api.ts`)

```ts
/** Multipart POST with upload progress. XHR because fetch has no upload progress. */
export async function apiUpload<T>(
  path: string,
  form: FormData,
  opts: { onProgress?: (fraction: number) => void; signal?: AbortSignal } = {}
): Promise<T>
```
- Same `API_BASE` and bearer token as `apiFetch`. No `Content-Type` header.
- Non-2xx: parse JSON if possible and throw `ApiError(message, body.error, { status, details, data })`, the same as `apiFetch`.
- A non-JSON 413 throws `ApiError("…", "PAYLOAD_TOO_LARGE", { status: 413 })`.
- A network error or abort throws `ApiError("…", "NETWORK", { status: 0 })`.

### 5.3 API + service

```ts
// api.ts — replaces the JSON version
applyForModerator: (userId: string, app: ModeratorApplication, opts?: UploadOpts) =>
  apiUpload<GroupEnvelope<ModeratorStatusResponse>>(`/moderator/apply/${resolveUserId(userId)}`,
    buildModeratorApplicationForm(app), opts),
```
`buildModeratorApplicationForm` (in `moderatorDocuments.ts`):
- appends `motivation` only if the trimmed value is non-empty;
- appends each file under its `field` with `form.append(field, withMimeType(file), file.name)`.

`withMimeType` re-wraps a `File` whose `type` is empty or generic (some Android pickers do this for HEIC) as `new File([file], name, { type })`, inferring the type from the extension, so the server's MIME check passes.

The service passes `opts` through `unwrap()`. The apply page is the only caller.

### 5.4 Draft store (`src/lib/moderatorDraft.ts` + `useModeratorDraft`)
- Database `sousubox`, object store `moderatorDraft`, key = backend `userId`.
- Value `{ motivation, files: Partial<Record<field, { blob: Blob; name: string; type: string; size: number }>>, updatedAt }`.
- Written on each pick, remove, or motivation change (debounced 500 ms).
- Read on apply mount. If anything is restored, show a banner: "We kept the files you picked earlier." with a "Clear" action.
- **Cleared when:** submit succeeds; status isn't NONE or REJECTED on load; `updatedAt` is older than 14 days; sign-out (`clearAllModeratorDrafts()` before `signOut()` in both sign-out sites); or the store's `claim(ownerId)` detects a different user.
- If `indexedDB` is missing or throws (private mode, quota), fall back to in-memory state silently and drop the "saved on this device" line from the privacy notice.

### 5.5 Query / invalidation
No query library; the existing pattern stays.
- **On submit success:** `useModeratorStore.setStatus(response.data)` if the response has the full status, otherwise `refresh()`. Then clear the draft and `router.replace("/moderator")`.
- **On `ALREADY_*` or `APPLICATIONS_CLOSED`:** `refresh()`, then go to `/moderator`.
- `/moderator` and `/moderator/apply` refetch on focus.

### 5.6 Fallback for `requiredDocuments`
If the array is missing or empty (an older backend), use the constant `DEFAULT_REQUIRED_DOCUMENTS` in `moderatorDocuments.ts` (same three entries). Slots always render in kind order. Labels come from the server; help text and examples come from client copy keyed by `kind`.

---

## 6. Validation and error mapping

### 6.1 Client rules (mirror the server)
| Rule | When | Slot message |
|---|---|---|
| MIME in `application/pdf, image/jpeg, image/png, image/webp, image/heic, image/heif` (falling back to extension: `.pdf .jpg .jpeg .png .webp .heic .heif`) | on pick | "This file type isn't supported. Use a PDF, JPG, PNG, WebP or HEIC file." |
| `size > 0` | on pick | "This file is empty. Pick another one." |
| `size ≤ 10 × 1024 × 1024` | on pick | "This file is over 10 MB. Try a smaller scan or save it as a PDF." |
| Exactly one file per slot | input has no `multiple`; picking again replaces | — |
| All 3 present | on Submit; focus the first empty slot | "Add this document to continue." |
| Motivation ≤ 1000 | live (`maxLength`) + counter | — |

Input `accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"`. An invalid pick isn't stored: the slot keeps its previous file and shows the error.

### 6.2 Server error → UI
| `error` | UI |
|---|---|
| `INVALID_DOCUMENTS` (400) | `details[]` is split on the first `": "`. The prefix is matched against `requiredDocuments[].field` → error under that slot. Unmatched lines (unexpected fields, etc.) → a list above Submit. Files are kept. **Add to `groupPoolErrors`:** `rule("inline", "Some documents need fixing.")`. |
| `NOT_ELIGIBLE` (403) | Existing behaviour: checklist from `data.failures` / `data.snapshot` + inline message. Files kept. Submit disabled. |
| `APPLICATIONS_CLOSED` (503) | **Change** to `refetch: true`: toast, `refresh()`, go to `/moderator` (closed state). Draft kept. |
| `ALREADY_PENDING` / `ALREADY_APPROVED` (409) | Existing: toast + refetch → `/moderator`. Clear the draft. |
| `ALREADY_SUSPENDED` / `ALREADY_REVOKED` (403) | Existing: toast + refetch → `/moderator` (support state). Clear the draft. |
| `PAYLOAD_TOO_LARGE` (413 from the proxy, client-made) | Inline: "Your files are too large to send together. Try smaller scans or PDFs." |
| `NETWORK` (client-made) | Inline + "Try again": "Couldn't send your application. Your files are still here, so try again." |
| `RATE_LIMITED` (429) | Existing inline rule. |
| anything else | Toast with the backend message. Files kept. Retrying is safe (the server deletes partial uploads). |

---

## 7. Copy deck (`src/lib/copy/moderatorApplication.ts`)

**Entry and status (existing; unchanged unless noted)**
- Profile row: "Pool Moderator" + chip (Apply / In review / Active / Not approved / Suspended / Revoked).
- NONE: "Run a pool for your group". Button: "Apply to become a moderator".
- Closed: "Applications aren't open yet."
- **PENDING (changed):** "Application under review" · "You applied on {date}. We'll let you know in your inbox once it's decided." Section "What you sent": rows `{label} · {originalName} · {size}`. Footer: "An admin checks each document. If something's missing they'll tell you why, and you can apply again."
- **REJECTED (changed):** "Application not approved" · `{decisionReason}`. Note: "If you apply again you'll need to upload all three documents again." Button: "Apply again".
- SUSPENDED: "Moderator role suspended" · `{decisionReason}` · "Contact support".
- REVOKED: "Moderator role revoked" · `{decisionReason}` · "Contact support".
- APPROVED: existing dashboard (out of scope).

**Apply page**
- Header eyebrow "Pool Moderator", title "Apply".
- Intro: "Upload three documents so we can confirm who you are and where you live. PDF or photo, up to 10 MB each."
- Section title: "Your documents".

| Kind | Label fallback (server label wins) | Help | Examples |
|---|---|---|---|
| BUSINESS_REGISTRATION | Certificate of incorporation | Your business's certificate of incorporation from the Office of the Registrar of Companies. Make sure the whole certificate is visible and readable. | — |
| PROOF_OF_ADDRESS | Proof of address | A utility bill issued in the last 3 months, showing your name and house address. | e.g. ECG electricity bill, Ghana Water bill |
| REFERENCE_LETTER | Reference letter | A signed letter from a civil servant who knows you, such as a teacher, nurse, police officer or district assembly officer. If possible it should be on official letterhead and include their name, position, staff ID and phone number, and be signed and dated. | — |

- Slot empty: "Upload file" · hint "PDF, JPG, PNG, WebP or HEIC · max 10 MB".
- Slot filled: `{name}` · `{size}` · "Replace" · "Remove".
- Multi-page hint (under the address and letter slots): "More than one page? Upload it as a single PDF."
- Motivation label: "Why do you want to moderate? (optional)". Placeholder: "Tell us about the group you'd run a pool for."
- **Privacy notice:** "Only SousuBoxx admins reviewing your application can see these documents. They're stored privately and never shown to pool members. Until you send them, the files you pick are saved on this device only."
- Draft banner: "We kept the files you picked earlier." · "Clear".
- Submit: "Send application" · in progress: "Sending… {n}%", then "Finishing up…".
- Leave guard: "Leave this page? Your files stay saved on this device." / "Stop sending? Your application won't be submitted." (mid-upload).
- Offline: "You're offline. Your files are saved on this device."
- Success toast: "Application sent".

---

## 8. Backend requests

| # | Request | Proposed contract | Blocks? |
|---|---|---|---|
| B1 | **Applicant can view their own submitted documents** | `GET /moderator/documents/:userId/:kind` → `{ success, data: { url, expiresAt } }`. A short-lived signed URL (≤ 5 min) for the applicant's own latest document of that `kind`. 404 `DOCUMENT_NOT_FOUND`; 403 when the caller isn't that user. Alternatively, add an optional `url` + `urlExpiresAt` to each `documents[]` item in `/moderator/status`. | No. Without it, PENDING shows names and sizes only. With it, each row gets a "View" link. |
| B2 | **Align the business document label** | Change the `BUSINESS_REGISTRATION` entry in `requiredDocuments[].label` (and any admin-dashboard wording) to "Certificate of incorporation". The `kind` and `field` stay the same. | No. Server labels override client copy, so until this ships the slot shows the backend's wording above the client help text. |
| — | Upload progress endpoint | Not needed: the XHR gives progress. | — |
| — | Server draft | Not requested (decision 7 uses an IndexedDB draft). | — |
| — | Withdraw PENDING / push + deep link | Not requested (decision 10). Decisions arrive as in-app inbox notifications, and refetch on focus picks them up. | — |

---

## 9. Implementation steps

**S0 — Proxy body-limit spike (do first)**
- Send a 3 × 9.5 MB multipart POST through `/api/backend` on the deployed environment (and `next start` locally) to a test or echo endpoint, or to `/moderator/apply` with a test user.
- *Acceptance:* the result is recorded in this doc. If the host rejects bodies over ~4.5 MB, stop and ask the owner to choose between direct-to-backend (CORS) and client-side compression before S4.

**S1 — Types and document helpers**
- Update `api.ts` types (§5.1).
- Add `src/lib/moderatorDocuments.ts`: `ACCEPTED_MIME`, `MAX_DOCUMENT_BYTES`, `DEFAULT_REQUIRED_DOCUMENTS`, `validateDocument(file)`, `inferMimeType(name)`, `withMimeType(file)`, `buildModeratorApplicationForm(app)`, `mapDocumentErrors(details, fields)`.
- Add `INVALID_DOCUMENTS` to `groupPoolErrors`, and set `refetch` on `APPLICATIONS_CLOSED`.
- *Tests (Vitest):* type and size and empty-file validation, including empty `file.type` with a `.heic` name; FormData contains exactly the 3 fields plus optional trimmed motivation; `details[]` mapping, including unmatched lines and messages that contain `": "`.

**S2 — Upload transport**
- Add `apiUpload` and the new `applyForModerator`, and update the service.
- *Tests:* a mocked `XMLHttpRequest` covering progress callbacks, 201 → data, 400 with `details` → `ApiError.details`, non-JSON 413 → `PAYLOAD_TOO_LARGE`, `onerror` → `NETWORK`, abort.

**S3 — Draft persistence**
- Add `moderatorDraft.ts` (native IndexedDB, promise-wrapped) and `useModeratorDraft(userId)`. Clear on sign-out at both sites and on user change.
- *Tests:* use `fake-indexeddb` (new dev dependency, decision 16), imported per test file via `fake-indexeddb/auto`. Cover save, restore, 14-day expiry, per-user isolation, fallback when `indexedDB` throws.

**S4 — Apply page and components**
- Build `DocumentUploadSlot`, `UploadProgress` and `PrivacyNotice`, and rewrite `/moderator/apply` per §4, §6 and §7.
- Redirect to `/moderator` when `!canApply`. Add the leave guard and offline state. Revoke object URLs. Guard against double submit.
- *Acceptance:*
  - each slot accepts only valid files;
  - Submit stays disabled until all 3 are present;
  - progress goes from 0 to 100;
  - after a failed submit, the files and motivation are still there;
  - after a reload, the draft is restored;
  - success lands on PENDING with the 3 documents listed.
- *Component tests:* empty, filled (image and PDF), client error, server error and replace/remove states for a slot; a page submit that's disabled until complete; `INVALID_DOCUMENTS` lands on the right slot; `NOT_ELIGIBLE` shows the checklist.

**S5 — Status screen updates**
- PENDING: `SubmittedDocumentsList`. REJECTED: the re-upload note. Refetch on focus on `/moderator` and `/moderator/apply`.
- *Tests:* one render per status (NONE, closed, PENDING with docs, REJECTED with reason, SUSPENDED, REVOKED, APPROVED handoff).

**S6 — Analytics** (ids and codes only, never file names)
- `moderator_apply_started`;
- `moderator_document_added { kind, mime, sizeBucket }`;
- `moderator_document_rejected_client { kind, reason }`;
- `moderator_draft_restored { count }`;
- `moderator_apply_submitted { hasMotivation }`;
- `moderator_applied` (existing);
- `moderator_apply_failed { code }`.

**S7 — E2E (Playwright)**
- Update `e2e/moderator.spec.ts`: `setInputFiles` on the 3 slots (small PDF/PNG buffers), submit, then assert that the multipart body contains the 3 field names and the motivation. Extend `mockApi` to expose the raw `postDataBuffer()` and `content-type`.
- Add specs for:
  - `INVALID_DOCUMENTS` on `proofOfAddress` (error on that slot, other files kept);
  - restoring the draft after a reload;
  - the `NONE` → closed state;
  - REJECTED → Apply again with empty slots.

**Accessibility (applies to all steps):**
- each slot is a labelled group, and the file button names the document ("Upload proof of address");
- errors use `role="alert"` and are linked through `aria-describedby`;
- progress uses `aria-valuenow`;
- focus moves to the first slot with an error after Submit;
- touch targets are ≥ 44 px, and the layout works in both themes.

---

## 10. Risks and open questions

**Risks**
- **R1 — Proxy body limit.** The rewrite proxies uploads of up to ~30 MB, and production is on Vercel (decision 13), whose function request bodies are capped at 4.5 MB. It isn't confirmed whether that cap applies to external rewrites, which is what S0 tests on a preview deployment. If it does apply, the likely fix is posting directly to the backend URL (backend adds CORS for the app origin), keeping originals (decision 5).
- **R2 — Sensitive documents in IndexedDB** (decision 7). Identity documents stay on shared or lost phones until they're cleared. Mitigations: 14-day expiry, clearing on sign-out and user change, and saying so in the privacy notice. Clerk session expiry doesn't clear IndexedDB.
- **R3 — "No camera" can't be fully enforced on iOS.** Safari's file sheet always offers "Take Photo". Leaving out `capture` only stops the camera opening directly on Android.
- **R4 — HEIC preview.** Only Safari renders HEIC, so other browsers show a file icon instead of a thumbnail. The upload still works.
- **R5 — Empty or generic MIME types** from some Android pickers. `withMimeType` handles them. A wrong extension would still fail on the server and come back as `INVALID_DOCUMENTS`.
- **R6 — Large uploads on mobile data.** Originals can mean a slow upload of up to 30 MB. There's a progress bar, but no resume: a failure re-sends all three files.
- **R7 — The response shape on 201** is described only as "the profile". If it isn't the full status shape, the client falls back to `refresh()`.

**Open questions:** none. Q1–Q5 were answered and recorded as decisions 13–17.
