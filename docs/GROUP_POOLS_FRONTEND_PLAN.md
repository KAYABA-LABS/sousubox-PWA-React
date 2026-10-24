# SousuBoxx Group Pools — Frontend Plan

> Status: **awaiting owner approval**. No app code has been written.
> Source spec: `GROUP_POOLS_FRONTEND_AGENT_PROMPT.md` (backend verified 2026-10-13).
> Client: this repo — **Next.js 16 App Router PWA** (not Expo/React Native as the spec assumed).

---

## 1. Summary

- **Member join by invite:** a new `/pools/join` page takes a code (typed, pasted, from a link `https://<app>/pools/join?code=…`, or scanned as a QR). It shows the pool preview, then a review drawer for the debt-visibility consent, MANUAL-order acceptance and an optional note, and sends the request. A "My join requests" screen covers cancel and "Top up & complete".
- **Group pool pages:** a new `/pools/group/[id]` page handles FORMING, ACTIVE and PAUSED group pools. It reuses the existing hero card, contribution cards and timeline components, and adds a paused banner, HOLD and UNCOVERED states, a transparency card, swap requests and order acceptance.
- **Debts:** a new `/pools/debts` page shows the total, the per-pool breakdown and Repay. It's linked from the dashboard "Amount owed" tile, the user's own transparency row and the `OUTSTANDING_GROUP_DEBT` sheet.
- **Moderator area:** a "Pool Moderator" row on the Profile page opens `/moderator`, which covers:
  - status, eligibility and the application;
  - the dashboard;
  - the 3-step create wizard;
  - per-pool management (requests, members, invite, order, bond, swaps, edit, extend, cancel);
  - earnings.
- **Template-pool fixes:** handle a nullable `tier`, show a "Group" badge from `origin`, add PAUSED to the Active list, show HOLD and UNCOVERED in the timelines, and handle the new join errors.
- **Cross-cutting:**
  - a central error-code map with three treatments (inline, toast, sheet);
  - a `returnTo` round trip through the deposit flow;
  - the moderator activity ping;
  - a `GH₵` formatting helper;
  - an env feature flag;
  - analytics events, Vitest unit tests and Playwright end-to-end tests.
- **Data layer:** keeps the existing pattern (service hooks plus `useState`, explicit refetch after mutations, refetch on focus, and targeted 30s polling). No new caching library.
- **Delivery:** 4 phases. P1 is foundations plus member join. P2 is the moderator core. P3 is running pools, debt and bond. P4 is order editor, swaps and earnings.

---

## 2. Decisions log

| # | Topic | Question | Owner answer | Resulting rule |
|---|---|---|---|---|
| 1 | Deep links | PWA cannot use `sousubox://`. How do invite links work? | **Web route + QR** | Invite URL = `https://<app-domain>/pools/join?code=XXXXXXXX`. The moderator invite screen shows a QR of that URL, and the existing `/scan` page recognises it. No custom scheme. |
| 2 | IA | Where does "Join with code" live? | **Pools header button + dashboard quick action** | A button next to the Pools title in `src/app/pools/page.tsx` (and in its empty states), plus a 5th `QuickActionButton` "Join pool" in `ClientDashboard`. |
| 3 | IA | Where does the moderator area live? | **Profile entry → `/moderator`** | A row on `src/app/profile/page.tsx` opens the `/moderator/*` routes. The Dock stays at 4 items. |
| 4 | IA | Mixed or separate lists? | **Mixed + "Group" badge** | Group pools appear in the existing Active and Joined tabs. When `template.origin` is group, the "X Tier" line becomes a `Group` badge. |
| 5 | Reuse | Extend `/pools/[id]` or build new? | **New `/pools/group/[id]`** | A separate page that reuses `PoolCycleHeroCard`, `ContributionStatusCard`, `MyContributionStatusCard`, `PoolActivityTabs` and `MemberAvatar`. List cards route by `origin`. |
| 6 | Join flow | Structure | **Page + review drawer** | `/pools/join`: code input → preview (Info/Members/Rules like `PoolDetailModal`) → "Request to join" opens a vaul `Drawer` with consent, order acceptance, note and the money summary. |
| 7 | Join flow | Debt-visibility consent | **Notice + required checkbox** | Amber callout showing `debtVisibilityNotice` with a plain summary, and a required `Checkbox`. Submit stays disabled until it's checked. |
| 8 | Join flow | MANUAL order acceptance | **List + second checkbox** | The preview shows `manualOrder` as a numbered list. The drawer has a second required checkbox and sends `acceptPayoutOrder: true`. |
| 9 | Create | Form structure | **3-step wizard** | 1 Basics → 2 Economics → 3 Review & funds. Uses react-hook-form + zod. The draft is kept in `sessionStorage` so it survives a deposit round trip. |
| 10 | Create | Live estimate | **Partial estimate** | Shows gross payout per cycle, reserve, joining fee, join amount and total pool value, each labelled "Estimate". The bond shows as "Calculated when you create". The pool's returned values replace the estimate after creation. |
| 11 | Create | Policy bounds | **Request endpoint; fall back to `details[]`** | Backend request B1. Until it ships, the client only checks for positive integers and required fields, and shows `INVALID_POOL_CONFIG.details[]` inline. |
| 12 | Create | Interval options | **1, 3, 7, 14, 30 days** | Chips: Daily (1) · Every 3 days · Weekly (7) · Every 2 weeks (14) · Monthly (30). The server stays authoritative. |
| 13 | Funds | Deposit round trip | **`returnTo` param** | A blocking sheet shows the shortfall and links to `/deposit?amount=X&returnTo=…`. `deposit/status` shows "Continue" back to `returnTo`, which auto-calls `completeJoin` or resumes the create wizard. |
| 14 | Paused | Presentation | **Banner + HOLD rows** | Amber banner on `/pools/group/[id]`, a PAUSED badge in the Active list, and an amber "Held" chip in the payout timeline (from `/:poolId/payouts`). |
| 15 | Transparency | Placement | **Separate card** | An always-visible "Group health" card below the hero, with bond coverage and the debts list. |
| 16 | Debt | Where repay lives | First "inside pool page only", then changed to **add `/pools/debts`** after the ended-pool gap was raised | Repay appears on the pool page's own row *and* on `/pools/debts`, so debts from COMPLETED or CANCELLED pools can still be repaid. |
| 17 | Tone | Debt wording | **Neutral and factual** | "Ama K. · GH₵120.00 still to repay · 4 days missed · GH₵40.00 repaid". No red "defaulter" labels. The user's own row is highlighted and has Repay. |
| 18 | Mod dashboard | Bond health colours | **>50% green, 20–50% amber, <20% red** | Coverage = `remaining / (initialAmount + toppedUpTotal)`. DEPLETED or paused is always red with "Top up to resume". |
| 19 | Order editor | Interaction | **Up/down buttons** | A numbered list with ↑/↓ per row, plus "Needs to accept" chips (depends on backend request B3). |
| 20 | Swaps | Interaction | **Two pickers + preview** | Two `Select`s of future cycles showing each recipient, a before/after preview, then Propose. A pending list shows per-member acceptance and Cancel. Members get Accept/Decline cards. |
| 21 | Activity ping | When to call `/moderator/status` | **App open + focus + moderator area** | Called once per session, on `visibilitychange → visible` (at most once an hour), and on each `/moderator` visit. Only when the cached status is `APPROVED`, except on `/moderator`, which always calls it. |
| 22 | Data layer | Caching approach | **Keep existing pattern** | Service hooks plus `useState`, refetch after each mutation, refetch on window focus, and 30s polling only on waiting screens. |
| 23 | Errors | Code → UI mapping | **Central map + 3 treatments** | `src/lib/groupPoolErrors.ts`. `ApiError` is extended to keep `status`, `details` and `data`. |
| 24 | Copy | Language and currency | **English, `GH₵` helper** | `formatGhs()` in `src/lib/pool-format.ts`, date-fns helpers, and strings in `src/lib/copy/groupPools.ts`. Existing screens aren't migrated. |
| 25 | Release | What ships with the feature | **Env flag, analytics, Vitest, Playwright** | `NEXT_PUBLIC_GROUP_POOLS`; a thin `track()` wrapper (provider still open, see §12); Vitest + Testing Library; Playwright with a mocked API. |
| 26 | Phasing | Order of scope | **4 phases** | See §11. |

---

## 3. Current-state findings

**Stack:** Next.js 16.1 (App Router, `reactCompiler`), React 19, Tailwind 4, shadcn/Radix primitives in `src/components/ui/*`, `framer-motion`, `vaul` (Drawer), `sonner` (toasts), react-hook-form + zod, `zustand`, `date-fns`, `lucide-react`, `qrcode` and `jsqr`. Auth is Clerk.

**Navigation**
- File-based routes in `src/app`. The bottom `Dock` (`src/components/dashboard/Dock.tsx`) has Home, Pools, Invest and Profile.
- Pools hub: `src/app/pools/page.tsx` has Active, Joined and Discover tabs via `?tab=`. `/pools/discover` redirects there.
- Pool detail: `src/app/pools/[id]/page.tsx` picks `ActiveView` or `JoinedView` from `?type=`, falling back on the `POOL_NOT_ACTIVE*` codes.
- Discover join: `src/components/PoolDetailModal.tsx` (Dialog with Info/Members/Rules tabs; calls `joinPool`).
- Contribute: `src/app/pools/[id]/contribute/page.tsx` (uses `api.getPoolDetails`). **There are no leave or redeem-debt screens.**
- Auth gating: `src/middleware.ts` protects every non-public route. `src/app/(auth)/signin/page-content.tsx:195` always does `router.push("/dashboard")` and **ignores any return URL**.

**Data layer**
- `src/lib/api.ts`:
  - `apiFetch` goes through the `/api/backend` rewrite (`next.config.ts`) and adds the Clerk bearer token.
  - `resolveUserId()` swaps in the database user id from `user.unsafeMetadata.userId` (`src/components/AuthTokenProvider.tsx`).
  - `ApiError` keeps only `message` and `code`; `details` is folded into the message as JSON, and `status` and `data` are lost.
- Services: `src/services/poolService.ts` (`usePoolService()`), plus kyc, profile, savings and user services. There's no query library; pages hold `useState` and load in `useEffect`.
- The only store is `src/stores/useSavingsStore.ts` (zustand).

**Pool models that assume a tier** (`src/lib/api.ts`): `DiscoverPoolTemplate.tier`, `UserPoolMembership.pool.template.tier`, `ActivePoolListItem.template.tier`, `ActivePoolDetails.tier`, `JoinedPoolTemplate.tier`, `AvailablePoolTemplate.tier`. All are typed `string`, and none have `origin`.

**Places that render the tier:**
- `pools/page.tsx:262, 333, 399`
- `pools/[id]/page.tsx:195, 249`
- `PoolDetailModal.tsx:80`
- `PoolCycleHeroCard.tsx` (`{tier} Tier`)

`ClientDashboard.tsx:339, 506` use `template.name`, which is fine.

**Timelines:**
- `activePoolDerivations.contributionRingStatus` pattern-matches `cycleStatus` and doesn't know `UNCOVERED`.
- `PoolActivityTabs.PayoutTimelineTab` shows only Completed or Upcoming, with no HOLD or FAILED.

**UI system**
- Colours are hard-coded hex values (`#0D4F3C` primary, `#156B53` hover, `#D4A843` gold, `#FBF6EF` light bg, `#0C0F14`/`#151A1F` dark).
- Dark mode uses Tailwind `dark:` (`src/context/ThemeContext.tsx`).
- Cards are `rounded-[24px]` white with soft shadows. Pill tabs come from `TabsTrigger` classes.
- Available primitives: `Drawer`, `Sheet`, `Dialog`, `AlertDialog`, `Checkbox`, `Switch`, `Select`, `RadioGroup`, `Slider`, `Textarea`, `Progress`/`progress-bar`/`progress-ring`, `Skeleton`, `empty-state`, `page-header`, `stat-card`, `Badge`, `Accordion`.
- Currency is inconsistent: "GHS 120" on list cards, "GH₵120.00" in the modal and contribute page. Dates use `toLocaleDateString("en-US")`.

**Cross-cutting**
- Share and clipboard: `src/app/profile/page.tsx:140-163` (referral: `navigator.share`, with clipboard fallback) and `src/app/scan/my-qr/page.tsx`.
- QR: `src/app/scan/page.tsx` decodes with `jsQR` and `JSON.parse`s the payload, so URLs are not handled yet.
- KYC: `kycService.getStatus`. The dashboard disables quick actions unless the status is `VERIFIED`, and `/kyc` is the flow.
- Deposit: `/deposit` → `/deposit/amount?method=` → `/deposit/status?data=`. Status returns to `/dashboard` only. `scan/result` already uses `/deposit?reason=insufficient`.
- Notifications: `src/app/inbox/page.tsx` is a **stub** with an empty array and no API.
- Dashboard: `ClientDashboard.tsx` shows `amountOwedBalance` ("Amount owed") from `getUserCheckingAccount`.
- Not present: i18n, analytics, feature flags and tests.

**States:** loading uses a centred `Loader2`; empty states use the local `EmptyState` cards in `pools/page.tsx`; errors use `toast.error(err.message)` or the full-page "Pool Not Found"; there's no "not eligible" UI.

---

## 4. Screen and component map

| Screen | Route | New / changed | Components (reused → new) | Endpoints |
|---|---|---|---|---|
| Pools hub | `/pools` | Changed | Adds a "Join with code" button; group badge on cards; PAUSED badge; cards route by `origin` | existing lists |
| Dashboard | `/dashboard` | Changed | 5th `QuickActionButton` "Join pool"; "Amount owed" tile → `/pools/debts` when group debt exists | `myDebts` |
| Profile | `/profile` | Changed | Adds a "Pool Moderator" row with a status chip | `moderator/status` |
| Join with code | `/pools/join?code=` | New | `InviteCodeInput` (new: 8-char normaliser, paste, scan button), `GroupPoolPreview` (new, styled like `PoolDetailModal` tabs), `JoinRequestDrawer` (new, on `Drawer`, `Checkbox`, `Textarea`), `ModeratorCard` (new, on `MemberAvatar`), `MoneyBreakdown` (new) | `groupPools/preview`, `groupPools/requests` (POST) |
| My join requests | `/pools/join/requests` | New | `JoinRequestCard` (new; status chip, `use-countdown` for `expiresAt`), `FundsShortfallSheet` | `myRequests`, `requests/:id/cancel`, `requests/:id/completeJoin` |
| Group pool (member view, plus the moderator's own view) | `/pools/group/[id]` | New | FORMING: `GroupPoolHeader`, `RulesCard`, `ManualOrderList` + `AcceptOrderBanner`. ACTIVE/PAUSED: `PausedBanner` (new), `PoolCycleHeroCard` (tier made optional), `ContributionStatusCard`, `MyContributionStatusCard`, `GroupHealthCard` (new: bond coverage + `DebtRow`s), `SwapRequestCard` (new), `PoolActivityTabs` (HOLD/UNCOVERED aware) | `joinedPoolDetails` / `activePoolDetails`, `/:poolId/details`, `/:poolId/payouts`, `transparency`, `swaps`, `swaps/:id/accept|decline`, `order/accept`, contribute (existing) |
| My group debt | `/pools/debts` | New | `DebtSummaryCard`, `DebtRow`, `RepayDrawer` | `myDebts`, `debts/repay` |
| Contribute | `/pools/[id]/contribute` | Unchanged | — | existing (allowed while PAUSED) |
| Deposit | `/deposit*` | Changed | Pass through `amount` and `returnTo`; status page shows "Continue" when `returnTo` is set | existing |
| Scan | `/scan` | Changed | If the decoded text is an invite URL, go to `/pools/join?code=`; otherwise keep the existing JSON behaviour | — |
| Sign-in | `/signin` | Changed | Honour `redirect_url` (same-origin, relative paths only) | — |
| Moderator home | `/moderator` | New | NONE/REJECTED/PENDING/SUSPENDED/REVOKED → `ModeratorStatusCard` + `EligibilityChecklist`; APPROVED → dashboard with `ModeratedPoolCard`s (status, `pendingRequestCount` badge, `BondHealthBar`, invite, deadline) and a "Create pool" CTA | `moderator/status`, `groupPools/moderated` |
| Apply | `/moderator/apply` | New | `EligibilityChecklist` (`snapshot` vs `required`), `Textarea` motivation (≤1000) | `moderator/apply` |
| Create pool | `/moderator/create` (`?step=1..3`) | New | `CreatePoolWizard` (step state; draft in `sessionStorage`), `IntervalChips`, `OrderTypeRadio`, `EstimatePanel`, `ParticipateSwitch`, `ConfigErrorsList` | `groupPools/create` |
| Created | `/moderator/pools/[id]?created=1` | New | `InviteShareCard` (code, copy, share, QR via `qrcode`) | — |
| Manage pool | `/moderator/pools/[id]` | New | Tabs: **Overview** (`InviteShareCard` + regenerate, forming deadline + extend once, cancel `AlertDialog`), **Requests** (`JoinRequestReviewCard` with reputation stats; approve/reject), **Members** (list, remove with reason, FORMING only), **Order** (MANUAL: `OrderEditor`), **Bond** (`BondHealthBar`, `BondTopUpDrawer`), **Swaps** (ACTIVE: `SwapProposer`, pending list) | `/:poolId/details`, `/:poolId/members`, `requests?status=PENDING`, `requests/:id/approve|reject`, `members/:id/remove`, `inviteCode/regenerate`, `extend`, `cancel`, `order` (PUT), `bond/topUp`, `swaps`, `swaps/propose`, `swaps/:id/cancel` |
| Edit pool | `/moderator/pools/[id]/edit` | New | Reuses the wizard fields; economics read-only when `configFrozenAt` is set | `groupPools/:poolId/update` |
| Earnings | `/moderator/earnings` | New | `StatCard`s + per-pool rows | `groupPools/earnings` |

Shared new components go in `src/components/group-pools/`. Shared new helpers: `src/lib/groupPoolErrors.ts`, `src/lib/groupPoolEstimate.ts`, `src/lib/inviteCode.ts`, `src/lib/pool-format.ts` (`formatGhs`, `formatDate`, `poolBadge`).

---

## 5. Navigation and deep-link changes

- **Invite URL:** `https://<app-domain>/pools/join?code=XXXXXXXX`. Moderators share it with `navigator.share`, falling back to the clipboard (same pattern as the profile referral). The QR encodes the same URL.
- **Signed out:**
  - Add `/pools/join` to `isPublicRoute` in `src/middleware.ts`. The page, not the middleware, sends signed-out users to `/signin?redirect_url=/pools/join?code=…`, so the code is never lost.
  - The code is also stored in `sessionStorage` (`pendingInviteCode`) as a backup.
  - Sign-in and sign-up honour `redirect_url`, accepting only relative paths that start with `/`.
- **KYC not verified:** the preview still loads, because the preview endpoint isn't KYC-gated. "Request to join" shows the KYC sheet → `/kyc`, and the code is kept in `sessionStorage` so the user can come back.
- **Scan:** `/scan` detects `…/pools/join?code=` URLs (or a bare 8-character code) before `JSON.parse`.
- **Card routing:** Active and Joined cards go to `/pools/group/[id]` when `template.origin` is group, otherwise to `/pools/[id]` as today. If a group pool id hits `/pools/[id]`, it redirects (best effort via `/:poolId/details.origin`).
- **Deposit `returnTo`:** `/deposit?amount=&returnTo=` is carried through `/deposit/amount` and `/deposit/status`. Only relative paths are allowed. On success, the status page shows "Continue" → `returnTo`.
  - Join: `returnTo=/pools/join/requests?complete=<requestId>`, which auto-calls `completeJoin` once.
  - Create: `returnTo=/moderator/create?step=3&resume=1`.
- **Universal domain:** still undecided (see §12). It's built from one constant, `NEXT_PUBLIC_APP_URL`.
- **Feature flag:** when `NEXT_PUBLIC_GROUP_POOLS !== "true"`, every entry point is hidden, and `/pools/join`, `/pools/group/*`, `/pools/debts` and `/moderator/*` render `notFound()`.

---

## 6. Data layer

### 6.1 `apiFetch` / `ApiError` change
`ApiError` gains `status: number`, `details?: string[]` and `data?: unknown`. The `message` stays the backend message, no longer with JSON appended. Existing callers that display `err.message` keep working; they lose only the appended JSON, which is an improvement.

### 6.2 New service
`src/services/groupPoolService.ts` exports `useGroupPoolService()`, with one method per endpoint in spec §3.3. Each unwraps `data` and throws `ApiError` when `success` is false. The raw calls are added to the `api` object in `src/lib/api.ts` following the existing `resolveUserId()` convention.

### 6.3 Types (added to `src/lib/api.ts`)

```ts
export type PoolOrigin = "TEMPLATE" | "GROUP";            // confirm exact enum values (§12)
export type GroupPoolStatus = "FORMING" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type ModeratorStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "REVOKED";
export type JoinRequestStatus = "PENDING" | "APPROVED" | "AWAITING_FUNDS" | "JOINED" | "REJECTED" | "CANCELLED" | "EXPIRED";
export type PayoutStatus = "PENDING" | "COMPLETED" | "HOLD" | "FAILED";
export type CycleStatus = "PENDING" | "COMPLETED_EARLY" | "COMPLETED_ON_TIME" | "COMPLETED_LATE" | "MISSED" | "UNCOVERED";
export type SwapStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export type BondStatus = "LOCKED" | "DEPLETED" | "RELEASED";
export type PayoutOrderType = "RANDOM" | "SENIORITY" | "MANUAL";

export interface EligibilityFailure { code: string; message: string }

export interface ModeratorStatusResponse {
  status: ModeratorStatus;
  appliedAt: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  maxConcurrentModeratedPools: number;
  applicationsOpen: boolean;
  canApply: boolean;
  eligibility: { eligible: boolean; failures: EligibilityFailure[]; snapshot: Record<string, unknown> } | null;
}

export interface GroupPoolModerator extends PoolMemberRef {
  stats: { reputationScore: number; reputationTier: ReputationTier; poolsModerated: number } | null;
}

export interface MyJoinRequestRef { id: string; status: JoinRequestStatus; createdAt: string; expiresAt: string | null }

export interface GroupPoolPreview {
  id: string; name: string; description: string | null; rulesText: string | null; status: GroupPoolStatus;
  moderator: GroupPoolModerator;
  contributionAmount: number; payoutIntervalDays: number; payoutFrequencyLabel: string;
  grossPayoutAmount: number; payoutAmount: number; managementFeePercent: number;
  totalCycles: number; maxMembers: number; currentMemberCount: number; spotsRemaining: number;
  joinAmount: number; securityReserve: number; joiningFee: number;
  payoutOrderType: PayoutOrderType;
  manualOrder: { position: number; user: PoolMemberRef }[];
  latePenaltyRate: number; contributionLifelines: number;
  bond: { amount: number; totalPoolValue: number; coveragePercent: number; coverageMemberDays: number };
  debtVisibilityNotice: string;
  myRequest: MyJoinRequestRef | null;
}

export interface CreateJoinRequestBody { code: string; debtVisibilityConsent: true; acceptPayoutOrder?: boolean; note?: string }

export interface JoinRequest {
  id: string; poolId: string; userId: string; status: JoinRequestStatus;
  note: string | null; createdAt: string; expiresAt: string | null;
}
export interface MyJoinRequest extends JoinRequest {
  pool: { id: string; name: string; status: GroupPoolStatus; contributionAmount: number; payoutIntervalDays: number; joinAmount: number };
}
export interface PoolJoinRequestForModerator extends JoinRequest {
  user: PoolMemberRef & { createdAt: string; stats: { reputationScore: number; reputationTier: ReputationTier; poolsCompleted: number; poolsDefaulted: number } | null };
}

export interface GroupDebt {
  id: string; poolId: string; creditor: "BOND" | "MODERATOR";
  principal: number; repaid: number; outstanding: number; daysMissed: number;
  pool: { id: string; name: string; status: GroupPoolStatus };
}
export interface MyGroupDebts { totalOutstanding: number; debts: GroupDebt[] }

export interface PoolTransparency {
  poolId: string; name: string; status: GroupPoolStatus; pausedAt: string | null; pauseReason: string | null;
  bond: { total: number; remaining: number; coveragePercent: number; totalPoolValue: number; status: BondStatus };
  uncovered: { days: number; amount: number };
  debts: { name: string; photoUrl: string | null; isMe: boolean; amountOwed: number; daysMissed: number; amountRepaid: number }[];
  payoutTimeline: { cycleNumber: number; recipient: PoolMemberRef | null; isMe: boolean; expectedPayoutDate: string; status: PayoutStatus }[];
}

export interface SwapRequest {
  id: string; cycleA: number; cycleB: number; userA: PoolMemberRef; userB: PoolMemberRef;
  acceptedAAt: string | null; acceptedBAt: string | null; status: SwapStatus; expiresAt: string; proposedBy: string;
}

export interface GroupPoolConfigInput {
  name: string; description?: string; rulesText?: string;
  contributionAmount: number; maxMembers: number; payoutIntervalDays: number;
  payoutOrderType: PayoutOrderType; latePenaltyRate?: number; contributionLifelines?: number;
  moderatorParticipates: boolean;
}

export interface ModeratedPool {
  id: string; name: string; status: GroupPoolStatus; contributionAmount: number; payoutIntervalDays: number;
  maxMembers: number; currentMemberCount: number; currentCycle: number; totalCycles: number;
  formingDeadline: string | null; configFrozenAt: string | null; payoutOrderType: PayoutOrderType;
  bond: { initialAmount: number; toppedUpTotal: number; remaining: number; drawnTotal: number; repaidTotal: number; status: BondStatus };
  inviteCode: string | null; pendingRequestCount: number;
  [key: string]: unknown; // "pool fields" not fully enumerated in spec
}

export interface CreateGroupPoolResult extends ModeratedPool { inviteCode: string; bondAmount: number; totalPoolValue: number }

export interface BondTopUpResult { bond: ModeratedPool["bond"]; resumed: boolean; uncoveredRows: number; releasedPayouts: number }

export interface ModeratorEarnings {
  totalFeeShare: number; totalBondLocked: number; totalOwedToMe: number;
  pools: { poolId: string; name: string; status: GroupPoolStatus; feeShare: number;
    bond: { status: BondStatus; remaining: number; drawnTotal: number; repaidTotal: number } | null; owedToMe: number }[];
}
```

**Changes to existing types:**
- Every `tier: string` becomes `tier: string | null`.
- Add `origin?: PoolOrigin` to the `template` blocks.
- `ActivePoolListItem` gains `status`.
- `ActivePoolDetails` gains `pausedAt` and `pauseReason`.
- `ActivePoolContributionEntry.cycleStatus` becomes `CycleStatus | string`.
- Add `PoolPayout` (from `/:poolId/payouts`) with `payoutStatus: PayoutStatus`.
- Type `getPoolDetails` with the new `/:poolId/details` fields instead of `Record<string, unknown>`.

### 6.4 "Query keys" and refetch after mutations
There's no cache library, so each screen exposes a `reload()` and mutations call the reloads listed below. A tiny `useRefetchOnFocus(reload)` hook adds `visibilitychange`/`focus` refetch.

| Mutation | Refetch afterwards |
|---|---|
| request join | preview (`myRequest`), my requests |
| cancel request | my requests |
| completeJoin | my requests, joined list, checking account |
| order accept | group pool page |
| repay debt | debts, transparency (if on a pool page), checking account |
| swap accept/decline | swaps, group pool page |
| apply | moderator status |
| create | moderated pools, checking account → navigate to the created screen |
| update | pool manage page |
| regenerate code | pool manage overview |
| approve/reject | requests list, members, moderated pools (badge) |
| remove member | members, moderated pools |
| cancel pool / extend | pool manage page, moderated pools |
| set order | order tab |
| bond top-up | bond tab, moderated pools, checking account; if `resumed`, show a toast "Pool resumed — N held payouts released" |
| propose / cancel swap | swaps tab |

### 6.5 Polling
- 30s while the page is visible, on these screens only: my requests (if any are PENDING or AWAITING_FUNDS), moderator Requests tab, swaps lists with a PENDING swap, and a group pool page that is PAUSED.
- Polling stops when the page is hidden.

### 6.6 Moderator activity ping
`src/stores/useModeratorStore.ts` (zustand) holds `{ status, lastPingAt }`. `ModeratorPing`, mounted next to `AuthTokenProvider` in `src/app/layout.tsx`:
- pings once per session if the cached status is APPROVED, or always the first time when status is unknown;
- pings on `visibilitychange → visible` if more than an hour has passed;
- always pings on mount of `/moderator/*`.

---

## 7. State and error handling

### 7.1 Error-code → UI map (`src/lib/groupPoolErrors.ts`)
Treatments: **inline** (under the field or section), **toast** (sonner), **sheet** (a blocking `Drawer` with an action).

| Code(s) | Treatment | Action / copy gist |
|---|---|---|
| `CODE_NOT_FOUND` | inline | "This code isn't valid or the pool is no longer open." |
| HTTP 429 | inline | "Too many tries. Wait a few minutes and try again." The input is disabled for 60s. |
| `CONSENT_REQUIRED`, `ORDER_ACCEPTANCE_REQUIRED` | inline | Highlights the unchecked box (shouldn't normally happen because of client gating). |
| `KYC_REQUIRED` | sheet | "Verify your ID to join" → `/kyc` |
| `OUTSTANDING_DEBT` | sheet | Shows `amountOwedBalance` → existing debt/deposit route (dashboard "Amount owed") |
| `OUTSTANDING_GROUP_DEBT` | sheet | Lists debts from `myDebts` → `/pools/debts` |
| `INSUFFICIENT_FUNDS` (402) | sheet | Shortfall = `joinAmount`/`amountNeeded` − `availableBalance` → `/deposit?amount=&returnTo=` |
| `REQUEST_REJECTED` | inline (blocking) | "The moderator declined your request. You can't request this pool again." |
| `REQUEST_ALREADY_OPEN` | inline | → "View my requests" |
| `ALREADY_MEMBER` | inline | → open the pool |
| `MODERATOR_OWN_POOL` | inline | → open the manage page |
| `MAX_GROUP_POOLS_EXCEEDED`, `MAX_MODERATED_POOLS_EXCEEDED` | sheet | Explain the limit; no action |
| `POOL_FULL`, `POOL_NOT_ACCEPTING`, `POOL_NOT_FORMING`, `REQUEST_NOT_OPEN`, `REQUEST_EXPIRED` | toast + refetch | |
| `ACCOUNT_NOT_ACTIVE` | sheet | Contact support (`/settings/help`) |
| `GROUP_POOL_REQUIRES_REQUEST` | toast | (template join path) "This pool joins by invite." |
| `MODERATOR_CANNOT_LEAVE` | toast | "Cancel the pool instead." Links to manage. |
| `APPLICATIONS_CLOSED`, `GROUP_POOLS_CLOSED` (503) | inline | Hide or disable the CTA; "Not open yet" |
| `NOT_ELIGIBLE` | inline | Render `data.failures` in `EligibilityChecklist` |
| `ALREADY_PENDING`, `ALREADY_APPROVED`, `ALREADY_SUSPENDED`, `ALREADY_REVOKED` | toast + refetch status | |
| `INVALID_POOL_CONFIG` | inline | `details[]` as a list on the wizard step (each message mapped to its field by keyword where possible) |
| `CONFIG_FROZEN` | inline | Economics locked; text fields still editable |
| `NOT_A_MODERATOR`, `NOT_POOL_MODERATOR`, `MODERATOR_NOT_ACTIVE`, `NOT_A_MEMBER` | full-page | Same layout as "Pool Not Found" |
| `CANNOT_REMOVE_MODERATOR`, `NOT_MANUAL_ORDER`, `INVALID_ORDER`, `ALREADY_EXTENDED`, `INVALID_AMOUNT`, `POOL_NOT_RUNNING`, `NOT_BOND_OWNER` | toast | |
| `SWAP_*`, `INVALID_SWAP`, `MEMBER_ALREADY_PAID`, `MODERATOR_CANNOT_ADVANCE`, `POOL_DISPUTED` | toast + refetch | |
| `NO_OUTSTANDING_DEBT`, `NOTHING_TO_ACCEPT` | toast + refetch | |
| unknown | toast | Backend `message`, falling back to "Something went wrong" |

### 7.2 Loading, empty and ineligible states

| Screen | Loading | Empty | Ineligible / special |
|---|---|---|---|
| Join | spinner on Continue; preview `Skeleton` | — | KYC/debt/funds sheets; `myRequest` present → shows its status instead of the Request button |
| My requests | skeleton cards | "No join requests yet" + Join with code | AWAITING_FUNDS card shows a countdown and "Top up & complete" |
| Group pool | full-page `Loader2` (matches existing) | — | `NOT_A_MEMBER` → not-found page |
| Debts | skeleton | "You don't owe any group" | — |
| Moderator home | skeleton | APPROVED with no pools → "Create your first pool" | Status cards for PENDING, REJECTED (re-apply if `canApply`), SUSPENDED, REVOKED; `applicationsOpen=false` → "Applications are closed" |
| Requests tab | skeleton | "No pending requests" | — |
| Earnings | skeleton | "No earnings yet" | — |

---

## 8. Changes to existing template-pool UI

1. **Nullable `tier`:**
   - `pools/page.tsx` (3 places), `pools/[id]/page.tsx` (2), `PoolDetailModal.tsx` (1) and `PoolCycleHeroCard` (make the `tier` prop optional and hide the chip when it's null).
   - Add a `poolBadge(template)` helper returning `"Group"` or `"<tier> Tier"`.
2. **`origin` badge** on Active and Joined cards, plus routing to `/pools/group/[id]`.
3. **PAUSED in the Active list:** use the new `status` field and show an amber "Paused" chip in place of or next to `contributionStatus`.
4. **`UNCOVERED`:** `contributionRingStatus` gains an `"uncovered"` ring (grey/amber dashed). `MemberAvatar` gets that style, and timeline counts become "paid · missed · uncovered".
5. **HOLD and FAILED payouts:** `PayoutTimelineTab` accepts an optional `payoutStatuses: Map<cycle, PayoutStatus>` (from `/:poolId/payouts`) and shows "Held" (amber) and "Not paid" (red) chips.
6. **Join errors on template pools:** `handleJoin` in `pools/page.tsx` goes through `groupPoolErrors`, so `OUTSTANDING_GROUP_DEBT` opens the debt sheet and `GROUP_POOL_REQUIRES_REQUEST` shows a toast.
7. **`ApiError` change** (§6.1). Check every `toast.error(err.message)` caller; behaviour stays the same.
8. **Dashboard:** the "Join pool" quick action, and the "Amount owed" tile linking to `/pools/debts` when `myDebts.totalOutstanding > 0`.

---

## 9. Copy deck (English; `src/lib/copy/groupPools.ts`)

- **Join entry:** "Join with code" · Input hint: "8-character code from your group's moderator"
- **Money summary (drawer):**
  - "To join you'll pay **GH₵{joinAmount}** when the moderator approves you. Nothing is charged now."
  - "• Security reserve GH₵{securityReserve}: refundable. It covers you if you miss a day."
  - "• Joining fee GH₵{joiningFee}: one-time, non-refundable."
  - "You'll contribute GH₵{contributionAmount} every day. Every {payoutIntervalDays} days, one member receives GH₵{payoutAmount}."
- **Consent heading:** "Missed payments are visible to your group"
  - Summary: "If you miss contributions and the moderator's guarantee covers you, other members of this pool will see your name, how much you owe, the days you missed and what you've repaid. Your phone number and email are never shown."
  - Followed by `{debtVisibilityNotice}`.
  - Checkbox: "I understand and agree."
- **MANUAL order checkbox:** "I accept this payout order. I'll receive my payout in position {n}."
- **Request sent:** "Request sent to {moderatorFirstName}. We'll let you know when they respond. Requests expire on {expiresAt}."
- **AWAITING_FUNDS:** "You're approved! Add GH₵{shortfall} to your balance by {deadline} to take your spot. Spots aren't held, so if the pool fills first you'll miss out." Button: "Top up & complete"
- **Rejected:** "The moderator didn't accept your request for this pool."
- **Paused banner:** "Payouts are paused. {pauseReason}. The pool's guarantee has run out, so payouts are on hold until the moderator tops it up or members repay what they owe. Keep contributing daily. Held payouts are paid in order once the pool resumes."
- **Held chip:** "Held, will be paid when the pool resumes"
- **Uncovered:** "Not yet covered"
- **Bond (member-facing):** "Moderator's guarantee: GH₵{remaining} of GH₵{total} left · covers {coveragePercent}% of the pool"
- **Bond (moderator):** "Your guarantee is locked while the pool runs. If a member defaults, it pays their days and they owe that amount back. If it runs out, the pool pauses payouts until you top up."
- **Debt row:** "{name} · GH₵{amountOwed} still to repay · {daysMissed} days missed · GH₵{amountRepaid} repaid"
- **Own debt:** "You owe GH₵{amountOwed} to this pool. Repaying it lets you join new pools and keeps payouts flowing." Button: "Repay"
- **Debt blocker:** "You have unpaid group pool debt (GH₵{total}). Repay it to join another pool."
- **Reserve / lifelines tooltip:** "If you miss a day, it's paid from your reserve plus a {latePenaltyRate}% late fee, using one of your {contributionLifelines} lifelines. When those run out, the moderator's guarantee covers you and you owe it back."
- **Estimate label:** "Estimate: final amounts are confirmed when you create the pool."
- **Participate switch:** "I'll also contribute as a member". Help text: "You'll need your guarantee plus a member's join amount (GH₵{joinAmountEstimate}) available."
- **Remove member:** "Remove {name}? They'll get a full refund, including their joining fee."
- **Cancel pool:** "Cancel this pool? Every member gets a full refund and your guarantee is released. This can't be undone."
- **Regenerate code:** "Create a new code? The current code and link stop working immediately."

---

## 10. Backend requests

| # | Request | Proposed contract | Blocks? |
|---|---|---|---|
| B1 | Public policy read | `GET /groupPools/policy` → `{ contributionAmount:{min,max}, maxMembers:{min,max}, payoutIntervalDays:number[], latePenaltyRate:{min,max,default}, contributionLifelines:{min,max,default}, managementFeePercent, moderatorFeeSharePercent, bondFloor, bondPercent, requestTtlHours, awaitingFundsTtlHours, formingDeadlineDays }` | No. Without it, the client relies on `details[]` and can't show the bond estimate. Also lets the interval chips come from the server. |
| B2 | Economics preview | `POST /groupPools/preview-economics/:userId` (same body as create) → `{ grossPayoutAmount, payoutAmount, securityReserve, joiningFee, joinAmount, totalPoolValue, bondAmount, amountNeeded, availableBalance, errors: string[] }` | No. It would replace the estimate in Decision 10 with exact values. |
| B3 | Members with order state (moderator) | `GET /groupPools/:poolId/members/:userId` → `[{ user, role, joinedAt, manualOrderPosition, orderAcceptedAt, orderAcceptanceRequired }]` | **Blocks** the "Needs to accept" chips in the order editor (P4). Without it the editor works but can't show who still needs to accept. |
| B4 | Group pool member list for members | Expose members (name, photo, role, position) of a FORMING group pool to its members | Partly blocks the FORMING member view's member list (P1/P3). The fallback is counts only. |
| B5 | In-app notifications API | `GET /notifications/:userId?cursor=` and `POST /notifications/:id/read` → `{ id, type, title, body, createdAt, readAt, data:{ poolId?, requestId?, swapId?, route? } }` | No for the group feature; the inbox is a stub today. Needed to show the backend's POOL/PAYOUT notifications at all. |
| B6 | Push / deep-link payloads | Web Push subscription endpoint plus a `route` in notification `data` | No. A future enhancement (`sw.js` already exists). |
| B7 | Origin enum + list extras | Confirm `origin` values and add `moderator{firstName,photoUrl}` to Active and Joined list items for the "by {moderator}" byline | No. Without it the badge just says "Group". |
| B8 | Request deadlines in preview | Return `awaitingFundsExpiresAt` separately from `expiresAt` on requests | No, but it avoids ambiguity in the AWAITING_FUNDS countdown. |
| B9 | Auth on `:userId` | Enforce that the token matches `:userId` (a known backend issue) | Not frontend-blocking; it's a security pre-requisite for launch. |

---

## 11. Implementation phases

Every phase is behind `NEXT_PUBLIC_GROUP_POOLS`. P1 and P2 should be **released together**, since members can't join until moderators can create. P1 can be merged and tested against seeded pools first.

### P1 — Foundations + member join
**Scope:**
- `ApiError` extension; `groupPoolErrors`; `formatGhs`/`poolBadge`/`inviteCode` helpers; types; `groupPoolService`; feature flag; `track()` wrapper.
- Vitest + Playwright setup with an API mock (MSW or Playwright route mocks).
- Template-pool fixes from §8 (1–3, 6, 7).
- `/pools/join` (code, preview, drawer, request); `/pools/join/requests` (cancel, completeJoin, polling).
- Deposit `amount`/`returnTo`; sign-in `redirect_url`; middleware public route; `/scan` URL handling.
- Pools header button and dashboard quick action.

**Acceptance:**
- Lowercase, spaced or dashed codes normalise correctly.
- 429 and `CODE_NOT_FOUND` show inline errors.
- Request stays disabled until consent (and order acceptance for MANUAL) is checked.
- Every join gate opens the right sheet.
- Insufficient funds → deposit → "Continue" → completeJoin succeeds.
- A signed-out invite link survives sign-in.
- Null-tier pools render without "null Tier".

**Tests:**
- Unit: code normaliser, error map, `poolBadge`, `formatGhs`, `returnTo` validator.
- Component: `JoinRequestDrawer` gating.
- E2E: invite link → preview → request; AWAITING_FUNDS → top-up → complete.

### P2 — Moderator core
**Scope:**
- Profile row; `ModeratorPing` + store.
- `/moderator` status/eligibility/apply; dashboard (`ModeratedPoolCard`, bond health colours, pending badges).
- Create wizard (estimate, details[] errors, funds sheet + resume) and the created screen (copy, share, QR).
- Manage page: Overview (regenerate, extend once, cancel), Requests (approve/reject, AWAITING_FUNDS outcome), Members (remove).
- Edit (frozen economics).

**Acceptance:**
- Each status renders its card, and failures show snapshot versus required.
- The wizard keeps its draft through a deposit round trip.
- `INVALID_POOL_CONFIG` messages appear on the right step.
- Approving a short-funded requester shows "Waiting for funds".
- The ping fires on load, on focus (throttled) and in the moderator area.

**Tests:**
- Unit: estimate formulas (spec §3.4 cases incl. 30-day scale = 5), bond-health thresholds, ping throttle.
- E2E: apply (mock approve) → create → share → approve request.

### P3 — Running group pools, debt, bond
**Scope:**
- `/pools/group/[id]` FORMING and ACTIVE/PAUSED views, `PausedBanner`, `GroupHealthCard`, HOLD/FAILED/UNCOVERED in the timelines (§8 items 4–5).
- `/pools/debts` + repay; dashboard "Amount owed" link.
- Moderator Bond tab + top-up (resume toast).

**Acceptance:**
- A PAUSED pool shows the banner, contribute still works, and held payouts show "Held".
- The user's own debt row is highlighted with Repay, and repay updates totals.
- A top-up that resumes the pool shows the released count.

**Tests:**
- Unit: `contributionRingStatus` with UNCOVERED, payout status merge.
- Component: `GroupHealthCard`.
- E2E: paused pool → repay → resumed.

### P4 — MANUAL order, swaps, earnings
**Scope:**
- Order editor (up/down, save, "needs to accept" once B3 ships); member `AcceptOrderBanner`.
- Swap proposer, pending list and cancel; member accept/decline cards.
- `/moderator/earnings`.

**Acceptance:**
- Saving the order shows `changedMembers`, and affected members see the accept banner.
- Swap errors map to toasts.
- A swap accepted by both members updates the payout timeline.

**Tests:**
- Unit: order reordering, swap cycle filtering (future, not current, not already paid).
- E2E: propose swap → both accept.

**Analytics events** (all phases, via `track(name, props)`):
- `group_join_code_submitted`, `group_join_preview_viewed`, `group_join_requested`, `group_join_request_cancelled`, `group_join_completed`
- `group_join_blocked{code}`, `group_debt_repaid`
- `moderator_status_viewed`, `moderator_applied`
- `group_pool_create_step{step}`, `group_pool_created`, `group_invite_shared{channel}`, `group_invite_regenerated`
- `group_request_approved`, `group_request_rejected`, `group_member_removed`, `group_pool_cancelled`, `group_bond_topped_up{resumed}`
- `group_order_saved`, `group_swap_proposed`, `group_swap_responded{accepted}`

No PII is included; only ids and codes.

---

## 12. Risks and open questions

1. **Analytics provider** isn't chosen. `track()` is a no-op (console in dev) until the owner picks one (e.g. PostHog, GA4 or Vercel Analytics).
2. **App domain** for invite links and QR isn't decided. It's built from `NEXT_PUBLIC_APP_URL`.
3. **`origin` enum values** aren't stated in the spec (`TEMPLATE`/`GROUP` assumed); confirm them.
4. **Sign-in redirect change** touches the auth flow and needs a careful open-redirect guard (relative paths only).
5. **ApiError message change** could alter the text in existing toasts slightly (the JSON details are no longer appended).
6. **Dashboard quick-action row** goes from 4 to 5 buttons; check the layout at 320px.
7. **Estimate accuracy:** the bond and net payout depend on hidden policy values (B1/B2), and users may treat estimates as quotes. The labelling mitigates this.
8. **Debt visibility is sensitive:** neutral copy is agreed. Legal or compliance should review the consent text before launch.
9. **No notifications UI:** members learn about approvals, pauses and swaps only by opening the app until B5 ships. Polling on key screens partly mitigates this.
10. **Unauthenticated `:userId` (B9)** is a backend security issue that should be fixed before launch.
11. **Test infrastructure is new to the repo** (Vitest and Playwright); this adds setup time to P1.
12. **Current pool screens are large single files** (`pools/[id]/page.tsx` at 304 lines, `pools/page.tsx` at 491). New group screens will be split into `src/components/group-pools/*` from the start.
