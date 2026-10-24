# SousuBoxx Group Pools — Frontend Discovery & Planning Prompt

> **Audience:** the coding agent working in the SousuBoxx **Expo / React Native client** repository. You have **no access** to the backend repository. Everything you need to know about the backend is in this document.
>
> **What you are asked to do:** discovery, decision questions, and a written plan. **Do not write or change any app code in this task.** Implementation starts only after the owner approves your report.
>
> **Provenance:** the backend facts here were checked against the Express/Prisma source on 2026-10-13, after the Group Pool feature was built (all four PRD phases).
>
> **Labels:**
> - **VERIFIED:** confirmed in backend source.
> - **GAP:** something the backend does not provide. Do not invent it; raise it as a question or list it in the report.
> - **ASSUMPTION:** a default you may propose, which the owner must confirm.

---

## 0. Your workflow (follow in order)

### Step 1 — Explore the client codebase (read-only)
Before asking anything, build an accurate picture of the existing app. At minimum, find and note:

1. **Navigation:** the router (Expo Router / React Navigation), tab structure, stacks, modals, and where the existing **pool** screens live (browse/discover, pool details, joined/forming, active pool, contribute, leave, redeem debt).
2. **Data layer:** the API client (fetch/axios), base URL config, how `userId` is obtained and passed (the backend takes it as a **path parameter**, see §3.1), query/caching library (React Query, SWR, Redux, Zustand…), and error handling and toast patterns.
3. **Existing pool types/models:** how the client models a pool today (fields like `template.name`, `template.tier`, `joinAmount`, `payoutFrequencyLabel`), and every place that reads `template.*`, `tier`, or assumes a pool always has a tier.
4. **UI system:** design tokens, theme (light/dark), typography, the component library (buttons, cards, lists, bottom sheets, form inputs, steppers, badges, progress bars, empty states, skeletons), icon set, currency formatting (GH₵), and date formatting.
5. **Cross-cutting:** deep linking config (scheme `sousubox://`, any universal-link domain), push/in-app notification screen, KYC gating UI, a balance/top-up (deposit) flow, share sheet usage, clipboard usage, analytics, and i18n.
6. **States:** how loading, empty, error, and "not eligible" states are shown today.

Keep a short inventory. You will cite real file paths in your questions and report.

### Step 2 — Ask the owner decision questions
- Ask in **batches of 3–6 questions**, grouped by topic (see §6 for the topics you must cover).
- **Every question must be grounded in what you found.** Name the existing screen or component you'd extend or reuse, and offer 2–4 concrete options. Mark one **(Recommended)** and give the trade-off in one line.
- Don't ask what the codebase or this document already answers. Don't ask about backend behaviour; it is fixed and documented here. If something here conflicts with what you found in the client, ask about the conflict.
- Wait for answers before asking the next batch. Keep a running list of decisions.

### Step 3 — Write the report, then stop
Produce the report described in §7 and save it as `docs/GROUP_POOLS_FRONTEND_PLAN.md` in the client repo. Then **stop and ask for approval**. Do not implement anything until the owner approves.

---

## 1. Feature summary (what the owner built)

SousuBoxx already has **template pools**: system-generated rotating-savings pools that users browse by tier and join instantly. The new **group pools** are created by an approved user called a **Pool Moderator** for a group of people they invite.

Group pools run on the same savings engine as template pools:
- Every member contributes **daily** (`contributionAmount` is a per-day amount).
- One member receives the pot every `payoutIntervalDays` days, which is one **cycle**.
- `totalCycles = maxMembers`.

What is different about group pools (VERIFIED):

| Aspect | Template pool | Group pool |
|---|---|---|
| Discovery | Browse list by tier | **Invite code or link only.** Never in browse. |
| Joining | Instant | **Request → moderator approves → charged on approval** |
| Who can join | Tier-gated | KYC VERIFIED and no outstanding debt; **no tier** |
| Default backstop | Platform treasury | **The moderator's bond** (a guarantee deposit locked at creation) |
| Bond runs out | n/a | Pool is **PAUSED**: contributions continue, **payouts are held** |
| Payout order | RANDOM / SENIORITY | RANDOM / SENIORITY / **MANUAL** (+ consented swaps while active) |
| Debt visibility | Private | **Members can see each debtor's name, amount owed, days missed and amount repaid.** Consent is required at join. Phone and email are never shown. |
| Fees | Platform | Platform; the moderator gets a share of the management fee |

### 1.1 Roles
- **Member:** joins via code, contributes, may default.
- **Moderator:** applies for the role (an admin approves), creates pools, approves join requests, sets a MANUAL order, proposes swaps, tops up the bond, and sees earnings. A moderator may or may not also be a contributing member of their own pool.
- **Admin:** acts in a separate admin dashboard. **Out of scope** for this client (see §5.4).

### 1.2 Lifecycles (VERIFIED enums)
- **Moderator status:** `NONE` (no profile) → `PENDING` → `APPROVED` → `SUSPENDED` / `REVOKED`. `PENDING` can also go to `REJECTED`, after which the user may apply again.
- **Pool status:** `FORMING` → `ACTIVE` ⇄ `PAUSED` → `COMPLETED`. `FORMING` can also go to `CANCELLED`. An admin can settle a `PAUSED` pool, which ends as `CANCELLED`.
- **Join request status:**
  - `PENDING` → `JOINED`, or → `REJECTED` (**final, cannot request again**), or → `CANCELLED` (by the user), or → `EXPIRED`.
  - `PENDING` → `AWAITING_FUNDS` → `JOINED` or `EXPIRED`.
  - `APPROVED` exists in the enum but the API currently moves straight to `JOINED` or `AWAITING_FUNDS`.
- **Payout status:** `PENDING`, `COMPLETED`, `HOLD` (held while paused; paid later), `FAILED` (pool settled before it was paid).
- **Daily contribution `cycleStatus`:** `PENDING`, `COMPLETED_EARLY`, `COMPLETED_ON_TIME`, `COMPLETED_LATE`, `MISSED`, **`UNCOVERED` (new)**. `UNCOVERED` is a defaulted member's day that the bond couldn't cover; it is filled later.
- **Swap status:** `PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CANCELLED`.
- **Bond status:** `LOCKED`, `DEPLETED` (pool paused), `RELEASED`.
- **Member role** in a pool: `MEMBER` or `MODERATOR`.

### 1.3 Money rules the UI must explain (VERIFIED)
- **Join amount** = `securityReserve` (refundable collateral) + `joiningFee` (small, non-refundable). It is **charged when the moderator approves**, not at request time.
  - The balance is checked at request time only.
  - If the balance is short at approval, the request becomes `AWAITING_FUNDS`, **without holding a seat**, and the user has a limited time to top up.
- **Reserve and lifelines scale with the payout interval:** `ceil(payoutIntervalDays / 7)` × base. A 30-day pool's reserve is 15× the daily amount instead of 3×. Show the user the actual `securityReserve` and `contributionLifelines` the API returns; don't recompute them.
- **Missed days:**
  1. They are settled at the payout date.
  2. Each missed day is first covered from the member's own reserve, which also uses a lifeline, plus a late penalty of `latePenaltyRate`.
  3. When the reserve or lifelines run out, the member is `DEFAULTED`. From then on the bond pays their days, and that amount becomes their **debt**.
- **Repaying group debt:** direct repay, or automatically from deposits. Platform debt is swept first, then group debts oldest first. A member who clears a running pool's debt goes back to active in that pool.
- **Outstanding group debt blocks joining any new pool**, template pools included (`OUTSTANDING_GROUP_DEBT`).
- **Paused pool:**
  - Members keep paying daily. Payouts become `HOLD`.
  - When the moderator tops up the bond, or debtors repay enough, the pool resumes and held payouts are paid in cycle order.
  - If it stays paused too long, an admin may close it and settle pro-rata, refunding members their net position.
- **Removals and cancellations before activation refund everything,** including the joining fee. A member who *leaves voluntarily* keeps the existing rule: reserve refunded, fee not.

---

## 2. Constraints

- **Payment and contribution flows are unchanged:** contributing, deposits and leaving a forming pool use the **existing** endpoints and screens.
- **Policy-driven limits:** bounds such as the daily amount range, member range, allowed payout intervals, penalty and lifeline ranges, and timers come from an admin-set policy. **GAP:** there is **no public endpoint to read the policy.** The create form can only learn the bounds from validation errors (`details[]`), unless the owner adds an endpoint. Raise this as a decision.
- **Server is authoritative for economics.** **GAP:** there is no "preview economics" endpoint. If you show a live preview while the moderator fills the form, it must be a client-side estimate using the formulas in §3.4, labelled as an estimate. The created pool's returned values are the truth.
- **Deep link format** (PRD): `sousubox://pool/join?code=XXXXXXXX`, plus a universal-link equivalent (**GAP:** the domain isn't decided).
- **Invite codes:** 8 characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I). Input should accept lowercase, spaces and dashes; the server normalizes them. Lookups are **rate-limited**: 20 per 15 minutes per user and 60 per IP, with HTTP 429 on excess.

---

## 3. API reference (VERIFIED)

### 3.1 Conventions
- **Base path:** `/api/v1`.
- **Identity:** the acting user's id is the **`:userId` path segment**, as in all existing pool routes. (The backend doesn't yet enforce auth on it. That's a known backend issue, not yours; follow the existing client convention.)
- **Envelope:** `{ success: boolean, data?, message?, error?: CODE, details?: string[] }`.
- **Status codes:** `404` not found · `403` not allowed or not eligible · `409` state conflict · `402` insufficient funds · `429` rate limited · `503` feature closed (no policy configured yet) · `400` validation or anything else.
- **Errors:** always branch on `error` (the code), never on `message`. `message` is user-presentable, but you may want your own copy.
- **Money:** plain numbers in GHS. Dates are ISO strings.

### 3.2 Changes to existing endpoints you already call
| Endpoint | Change |
|---|---|
| `GET /getUserAvailablePoolsList/:userId` | Never returns group pools. Each item's `template` block now also has `origin` and `name`, and `tier` **may be `null`**. |
| `GET /:poolId/availablePoolDetails/:userId` | Returns `POOL_NOT_FOUND` for group pools. `joinAmount`, `securityReserve` and `joiningFee` are unchanged in shape. |
| `POST /joinPool/:userId/:poolId` | On a group pool it returns `error: GROUP_POOL_REQUIRES_REQUEST`. New eligibility error: `OUTSTANDING_GROUP_DEBT`. |
| `GET /getUserJoinedPoolsList/:userId`, `GET /:poolId/joinedPoolDetails/:userId` | Include FORMING **group** pools the user has joined. `template.tier` is `null` for them; use `template.name` and `template.origin`. |
| `GET /getUserActivePoolList/:userId` | Now includes **PAUSED** pools. Each item has a new `status` field. |
| `GET /:poolId/activePoolDetails/:userId` | Works for `ACTIVE` **and `PAUSED`**. New fields `pausedAt` and `pauseReason`. `tier` may be `null`. `contributionTimeline[].cycleStatus` may be `UNCOVERED`. `payoutTimeline[].completed` is false for held payouts; use `/:poolId/payouts` for `payoutStatus: HOLD`. |
| `GET /:poolId/details` | New fields: `origin`, `name`, `description`, `rulesText`, `moderatorId`, `joinAmount`, `securityReserve`, `joiningFee`, `managementFeePercent`, `latePenaltyRate`, `contributionLifelines`, `pausedAt`, `pauseReason`. |
| `GET /:poolId/payouts` | `payoutStatus` may be `HOLD` or `FAILED`. |
| `POST /:userId/:poolId/contribute` | Allowed while the pool is `PAUSED`. |
| `DELETE /leave/:userId/:poolId` | The moderator of a group pool gets `MODERATOR_CANNOT_LEAVE`; they must cancel instead. |

### 3.3 New endpoints

**Moderator role**

| Method & path | Body / query | `data` on success | Notable `error` codes |
|---|---|---|---|
| `GET /moderator/status/:userId` | – | `{ status: NONE\|PENDING\|APPROVED\|REJECTED\|SUSPENDED\|REVOKED, appliedAt, decidedAt, decisionReason, maxConcurrentModeratedPools, applicationsOpen, canApply, eligibility: { eligible, failures: [{code, message}], snapshot } \| null }` | – |
| `POST /moderator/apply/:userId` | `{ motivation?: string }` (≤1000 chars) | the profile (status `PENDING`) | `APPLICATIONS_CLOSED` (503), `NOT_ELIGIBLE` (403; `data.failures[]`), `ALREADY_PENDING` / `ALREADY_APPROVED` (409), `ALREADY_SUSPENDED` / `ALREADY_REVOKED` (403) |

Eligibility failure codes: `KYC_REQUIRED`, `OUTSTANDING_DEBT`, `OUTSTANDING_GROUP_DEBT`, `REPUTATION_TOO_LOW`, `ACCOUNT_TOO_NEW`, `NOT_ENOUGH_COMPLETED_POOLS`. The `snapshot` holds the user's values next to the `required` thresholds. Use it to show "what you still need".

> **Important (VERIFIED):** calling `GET /moderator/status/:userId` counts as **moderator activity**. Moderators inactive for 48h trigger an admin alert. After two of a pool's cycles of inactivity, their pools go to the admin queue. **The app should call this endpoint when a moderator opens the app or the moderator area.**

**Joining (member side)**

| Method & path | Body / query | `data` on success | Notable `error` codes |
|---|---|---|---|
| `GET /groupPools/preview/:userId?code=XXXXXXXX` | – | Preview: `id, name, description, rulesText, status, moderator{id, username, firstName, lastName, photoUrl, stats{reputationScore, reputationTier, poolsModerated}}, contributionAmount, payoutIntervalDays, payoutFrequencyLabel, grossPayoutAmount, payoutAmount, managementFeePercent, totalCycles, maxMembers, currentMemberCount, spotsRemaining, joinAmount, securityReserve, joiningFee, payoutOrderType, manualOrder[{position, user}], latePenaltyRate, contributionLifelines, bond{amount, totalPoolValue, coveragePercent, coverageMemberDays}, debtVisibilityNotice, myRequest{id, status, createdAt, expiresAt}\|null` | `CODE_NOT_FOUND` (404; same for unknown, revoked or non-forming codes), 429 |
| `POST /groupPools/requests/:userId` | `{ code, debtVisibilityConsent: true, acceptPayoutOrder?: boolean, note?: string }` | the request (`PENDING`, `expiresAt`) | `CONSENT_REQUIRED`, `ORDER_ACCEPTANCE_REQUIRED` (MANUAL pools), `REQUEST_REJECTED` (403, final), `REQUEST_ALREADY_OPEN`, `ALREADY_MEMBER`, `MODERATOR_OWN_POOL`, `KYC_REQUIRED` (`data.kycStatus`), `OUTSTANDING_DEBT` (`data.amountOwedBalance`, `redemptionAmountDue`), `OUTSTANDING_GROUP_DEBT`, `MAX_GROUP_POOLS_EXCEEDED` (pending requests count), `POOL_FULL`, `POOL_NOT_ACCEPTING`, `INSUFFICIENT_FUNDS` (402; `data.joinAmount`, `availableBalance`), `ACCOUNT_NOT_ACTIVE`, 429 |
| `GET /groupPools/myRequests/:userId` | – | `[request + pool{id, name, status, contributionAmount, payoutIntervalDays, joinAmount}]` (latest 50) | – |
| `POST /groupPools/requests/:requestId/cancel/:userId` | – | – | `REQUEST_NOT_OPEN` |
| `POST /groupPools/requests/:requestId/completeJoin/:userId` | – | `{ status: 'JOINED' }` | For `AWAITING_FUNDS` after topping up: `INSUFFICIENT_FUNDS`, `POOL_FULL`, `REQUEST_NOT_OPEN`. A background job also retries every 15 minutes. |
| `POST /groupPools/:poolId/order/accept/:userId` | – | – | `NOTHING_TO_ACCEPT`. Used when the moderator changed this member's MANUAL slot; **the pool can't activate until every member has accepted.** |

**Debt, transparency, swaps (member side)**

| Method & path | Body | `data` | Notable errors |
|---|---|---|---|
| `GET /groupPools/myDebts/:userId` | – | `{ totalOutstanding, debts[{id, poolId, creditor: BOND\|MODERATOR, principal, repaid, outstanding, daysMissed, pool{id, name, status}}] }` | – |
| `POST /groupPools/debts/repay/:userId` | `{ poolId? }` | `{ repaid, remainingOutstanding }`. Pays up to the available balance, oldest first. | `NO_OUTSTANDING_DEBT`, `INSUFFICIENT_FUNDS` |
| `GET /groupPools/:poolId/transparency/:userId` | – | `{ poolId, name, status, pausedAt, pauseReason, bond{total, remaining, coveragePercent, totalPoolValue, status}, uncovered{days, amount}, debts[{name, photoUrl, isMe, amountOwed, daysMissed, amountRepaid}], payoutTimeline[{cycleNumber, recipient, isMe, expectedPayoutDate, status}] }` | `NOT_A_MEMBER` (members and moderator only) |
| `GET /groupPools/:poolId/swaps/:userId` | – | swap requests `[{id, cycleA, cycleB, userA, userB, acceptedAAt, acceptedBAt, status, expiresAt, proposedBy}]` | `NOT_A_MEMBER` |
| `POST /groupPools/swaps/:swapId/accept/:userId` | – | `{ status: 'PENDING' }` (waiting for the other member) or `{ status: 'ACCEPTED' }` (swapped) | `SWAP_NOT_FOUND`, `SWAP_NOT_PENDING`, `SWAP_EXPIRED`, `SWAP_STALE` |
| `POST /groupPools/swaps/:swapId/decline/:userId` | – | `{ status: 'REJECTED' }` | same |

**Moderator side**

| Method & path | Body | `data` | Notable errors |
|---|---|---|---|
| `GET /groupPools/moderated/:userId` | – | `[pool fields + bond{initialAmount, toppedUpTotal, remaining, drawnTotal, repaidTotal, status} + inviteCode\|null + pendingRequestCount]` | – |
| `POST /groupPools/create/:userId` | `{ name, description?, rulesText?, contributionAmount (daily), maxMembers, payoutIntervalDays, payoutOrderType: RANDOM\|SENIORITY\|MANUAL, latePenaltyRate?, contributionLifelines? (per week of interval), moderatorParticipates: boolean }` | created pool + `inviteCode`, `bondAmount`, `totalPoolValue` | `NOT_A_MODERATOR`, `GROUP_POOLS_CLOSED` (503), `MAX_MODERATED_POOLS_EXCEEDED`, `INVALID_POOL_CONFIG` (400 with **`details[]`**, one message per problem), `INSUFFICIENT_FUNDS` (402; `data{amountNeeded, bondAmount, joinAmount, availableBalance}`), `KYC_REQUIRED`, `OUTSTANDING_DEBT`, `MAX_GROUP_POOLS_EXCEEDED` |
| `PUT /groupPools/:poolId/update/:userId` | any subset of the create fields | updated pool | `CONFIG_FROZEN` (economics locked after the first member is approved; name, description and rules stay editable), `POOL_NOT_FORMING`, `INVALID_POOL_CONFIG`, `INSUFFICIENT_FUNDS` |
| `POST /groupPools/:poolId/inviteCode/regenerate/:userId` | – | `{ inviteCode }` (the old code stops working immediately) | `POOL_NOT_FORMING` |
| `GET /groupPools/:poolId/requests/:userId?status=PENDING` | – | `[request + user{id, username, firstName, lastName, photoUrl, createdAt, stats{reputationScore, reputationTier, poolsCompleted, poolsDefaulted}}]` | `NOT_POOL_MODERATOR`, `MODERATOR_NOT_ACTIVE` |
| `POST /groupPools/requests/:requestId/approve/:userId` | – | `{ status: 'JOINED' }`, or `{ status: 'AWAITING_FUNDS' }` (still a success) | `REQUEST_NOT_OPEN`, `REQUEST_EXPIRED`, `POOL_FULL`, plus any join-gate code if the requester is no longer eligible |
| `POST /groupPools/requests/:requestId/reject/:userId` | `{ reason? }` | – | `REQUEST_NOT_OPEN` (rejection is **final** for that user and pool) |
| `POST /groupPools/:poolId/members/:memberUserId/remove/:userId` | `{ reason? }` | – | FORMING only; refunds everything. `CANNOT_REMOVE_MODERATOR`, `NOT_A_MEMBER` |
| `POST /groupPools/:poolId/cancel/:userId` | `{ reason? }` | – | FORMING only; refunds everyone and releases the bond. `POOL_NOT_FORMING` |
| `POST /groupPools/:poolId/extend/:userId` | – | `{ formingDeadline }` | Only once per pool: `ALREADY_EXTENDED` |
| `PUT /groupPools/:poolId/order/:userId` | `{ orderedUserIds: string[] }` (payout order; members left out are appended in join order) | `{ changedMembers }` | `NOT_MANUAL_ORDER`, `INVALID_ORDER`, `POOL_NOT_FORMING` |
| `POST /groupPools/:poolId/bond/topUp/:userId` | `{ amount }` | `{ bond, resumed, uncoveredRows, releasedPayouts }` | `NOT_BOND_OWNER` (after a reassignment only the original moderator can top up), `INVALID_AMOUNT`, `INSUFFICIENT_FUNDS`, `POOL_NOT_RUNNING` |
| `POST /groupPools/:poolId/swaps/propose/:userId` | `{ cycleA, cycleB }` | the swap (`PENDING`, `expiresAt`) | `SWAP_NOT_ALLOWED` (not ACTIVE, or paused), `POOL_DISPUTED`, `INVALID_SWAP` (current, past or same cycle), `MEMBER_ALREADY_PAID`, `MODERATOR_CANNOT_ADVANCE`, `SWAP_ALREADY_PENDING` |
| `POST /groupPools/swaps/:swapId/cancel/:userId` | – | – | `SWAP_NOT_PENDING` |
| `GET /groupPools/earnings/:userId` | – | `{ totalFeeShare, totalBondLocked, totalOwedToMe, pools[{poolId, name, status, feeShare, bond{status, remaining, drawnTotal, repaidTotal}\|null, owedToMe}] }` | – |

### 3.4 Client-side estimate formulas (only if the owner wants a live preview, see §2)
With `daily = contributionAmount`, `n = maxMembers` (= `totalCycles`), `d = payoutIntervalDays`, `scale = ceil(d / 7)`:
- `gross per payout = daily × d × n`; `net payout = gross × (1 − managementFeePercent)`
- `securityReserve = daily × 3 × scale`; `joiningFee = daily × 0.1`; `joinAmount = reserve + fee`
- `total pool value = daily × d × n × n`
- `bond = max(bondFloor, bondPercent × total pool value)`. **GAP:** `bondFloor`, `bondPercent` and `managementFeePercent` are policy values the client cannot read.
- The moderator needs `bond + (participates ? joinAmount : 0)` available.

### 3.5 Notifications (VERIFIED)
The backend writes **in-app notifications** (type `POOL`, or `PAYOUT` for held payouts) for:
- new join requests, approvals, rejections, AWAITING_FUNDS and expiry;
- removals and cancellations;
- MANUAL order changes, swap proposals and outcomes;
- pool paused, resumed and settled, and held payouts;
- the forming-deadline warning;
- moderator application decisions and reassignment.

**GAP:** there are no push notifications and no deep-link payloads in them. Check how the client shows in-app notifications today.

---

## 4. Screens and flows the backend supports

Use this as the feature inventory. The **owner's answers decide** how these map onto existing screens.

**Member**
1. **Join with code:** code entry (paste, type, or open from a deep link) → preview → consent (+ MANUAL order acceptance) → optional note → request sent.
2. **My join requests:** statuses, cancel, and "Top up and complete" for `AWAITING_FUNDS` (with the deadline).
3. **Forming group pool (joined):** members, spots left, rules, and for MANUAL pools "accept new order" when required.
4. **Active / paused group pool:**
   - a paused banner, with the reason and an explanation that contributions continue and payouts are held;
   - `UNCOVERED` and `HOLD` states in the timelines;
   - a **transparency** section (debts, bond coverage);
   - swap requests to accept or decline.
5. **My group debt:** total, per-pool breakdown, and repay.
6. **Eligibility errors** everywhere a join can happen, including `OUTSTANDING_GROUP_DEBT` on template pools.

**Moderator**
7. **Become a moderator:** status, eligibility checklist (failures and thresholds), application with motivation, and pending, rejected, suspended or revoked states.
8. **My pools (moderator dashboard):** pools by status, pending request badges, bond health, invite code (copy, share, regenerate), forming deadline (extend once), and cancel.
9. **Create pool:** form (name, description, rules, daily amount, size, payout interval, order type, penalty, lifelines, participate toggle), funds check, and success with the invite code and share.
10. **Edit pool:** text always; economics only until frozen (`configFrozenAt`).
11. **Join requests review:** requester reputation and stats, approve or reject, and the AWAITING_FUNDS outcome.
12. **Members (forming):** remove, with full refund.
13. **MANUAL order editor:** drag to reorder, plus who still needs to accept.
14. **Swaps (active):** pick two future slots and propose; pending list; cancel.
15. **Bond:** status, remaining, coverage %, top-up, and what a top-up will do (resume or not).
16. **Earnings:** fee share, locked bonds, and amounts owed to the moderator.

---

## 5. Known gaps and backend facts to respect

1. **No policy-read endpoint:** bounds are learned from `INVALID_POOL_CONFIG.details[]` (ask the owner).
2. **No economics-preview endpoint:** see §3.4.
3. **No endpoint for a group pool's members with roles and order-acceptance state for the moderator.** The existing `GET /:poolId/members` returns members with `role` but not `manualOrderPosition` or `orderAcceptedAt`. Note what the order editor would need and list it as a backend request in your report.
4. **Admin features are not part of this client:** the admin queue, alerts, reassignment and settlement live in the separate admin dashboard.
5. **No push notifications:** in-app only.
6. **Deep link and universal-link domain** are not decided yet.

---

## 6. Decision topics you must cover with the owner

Ground each question in your Step 1 findings.

1. **Information architecture:**
   - Where does "Join with code" live (pool tab, home, FAB, discover screen)?
   - Where does the moderator area live (profile, separate tab, inside Pools)?
   - Should group pools appear mixed with template pools in "my pools" lists, or in separate sections?
2. **Template vs group presentation:** how to badge group pools, and what replaces the tier badge when `tier` is `null`.
3. **Reuse vs new:** which existing pool detail and active-pool components to extend versus create new (name them).
4. **Join flow:**
   - one screen or a stepper;
   - how to present the debt-visibility consent (checkbox, full-screen notice, bottom sheet);
   - how to present MANUAL order acceptance.
5. **Deep links:** scheme and path handling, behaviour when not signed in or KYC isn't verified, and the universal-link domain if known.
6. **Create form:**
   - single page or multi-step;
   - live estimate (client formulas, labelled) or none;
   - how to surface policy bounds given the gap;
   - interval picker options (the owner will know the allowed set);
   - the participate toggle and its funds explanation.
7. **Funds shortfalls:** link `INSUFFICIENT_FUNDS` / `AWAITING_FUNDS` into the existing deposit flow, and come back afterwards to `completeJoin` or create.
8. **Paused and held states:** banner design, wording, and where held payouts appear.
9. **Transparency and debt:**
   - where the debt list sits;
   - tone of the wording (sensitive: names are shown to other members);
   - the user's own debt highlighting, and the repay entry points.
10. **Moderator dashboard:** what's on the main card, how to show bond health (thresholds for warning colours), and pending-request badges.
11. **Order editor and swaps:** interaction model (drag list vs pickers), and showing who must accept.
12. **Activity ping:** when to call `GET /moderator/status/:userId` (app open, foreground, entering the moderator area).
13. **Data freshness:** polling or refetch-on-focus for requests, swaps and paused state, and cache invalidation after each mutation.
14. **Copy and localisation:** language(s), currency/date formats, and plain-language explanations of reserve, lifelines, bond and debt.
15. **Error mapping:** a single map from `error` code to UI treatment (inline, toast, blocking sheet with an action).
16. **Release:** feature flag / gradual rollout, analytics events, and tests (component, e2e).
17. **Scope and phasing:** which flows ship first (e.g. member join + moderator create/approve first; swaps and earnings later).

---

## 7. The report you must produce (after the questions)

Save it as `docs/GROUP_POOLS_FRONTEND_PLAN.md`. Sections:

1. **Summary:** what will be built, in 5–8 bullets.
2. **Decisions log:** every question asked, the owner's answer, and the resulting rule.
3. **Current-state findings:** the relevant existing screens, components, data layer and patterns, with file paths.
4. **Screen and component map:** a table of each new or changed screen, its route/path, the components reused or new, and the endpoints it calls.
5. **Navigation and deep-link changes.**
6. **Data layer:**
   - new API functions and types (TypeScript interfaces mirroring §3);
   - query keys and cache invalidation per mutation;
   - polling or refetch rules.
7. **State and error handling:** the error-code → UI map, and loading, empty and ineligible states per screen.
8. **Changes to existing template-pool UI:** for example nullable `tier`, the `origin` badge, PAUSED in the active list, the `UNCOVERED` and `HOLD` timeline states, and `OUTSTANDING_GROUP_DEBT`.
9. **Copy deck:** key strings (consent notice, paused banner, AWAITING_FUNDS, bond, debt).
10. **Backend requests:** gaps you need closed (e.g. policy-read endpoint, economics preview, members-with-order endpoint, push payloads), each with a proposed contract and a note on whether it blocks anything.
11. **Implementation phases:** ordered, each with scope, acceptance criteria and test plan.
12. **Risks and open questions.**

Then **stop** and ask the owner to approve the plan (or request changes) before writing any code.
