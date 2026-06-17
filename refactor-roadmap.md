# SVI Infra Solutions — Refactor Roadmap

> **Generated after fresh deep analysis (49,024 LoC across 335 TS/TSX files).**
> **Last commit:** `5ed3f43 chore(refactor): quick wins - FormEvent deprecation, Metadata types, unused imports`

---

## Current State Snapshot

| Metric                       |                Value |
| ---------------------------- | -------------------: |
| TS/TSX files                 |                  335 |
| Total LoC                    |               49,024 |
| Tests                        |           78 passing |
| Test files                   |     10 unit + 10 e2e |
| Build status                 |   green (Next.js 16) |
| Lint errors (in source)      |                    0 |
| Lint errors (scratch `.cjs`) |    64 — out of scope |
| Quick wins already done      | 26 files, 145+ / 45− |

---

## Code-Quality Findings (Deep Scan)

### 1. `as any` cast hotspots (49 total in 16 files)

| File                                        |   Count | Severity                     |
| ------------------------------------------- | ------: | ---------------------------- |
| `app/api/admin/email/route.ts`              |      13 | High (production email sync) |
| `src/components/admin/email/RepliesTab.tsx` |       6 | High (runtime data shape)    |
| `src/lib/repositories/lotteryRepository.ts` |       5 | High (typed return needed)   |
| `app/admin/notifications/page.tsx`          |       4 | Med                          |
| `src/components/home/ChatBot.tsx`           |       4 | Low (UI shapes)              |
| `app/admin/offer-letter/page.tsx`           |       2 | Med                          |
| `app/admin/allotment-letter/page.tsx`       | 0 (now) | —                            |
| 9 other files                               |  1 each | Low                          |

### 2. Large files (>600 lines)

| Lines | File                                        | Type                                 | Hooks?      |
| ----: | ------------------------------------------- | ------------------------------------ | ----------- |
|  1261 | `app/admin/allotment-letter/page.tsx`       | Page (client)                        | 11 useState |
|  1040 | `app/admin/bba/BbaLegalPages.tsx`           | Component (presentational)           | **0**       |
|  1019 | `app/admin/allotment-records/page.tsx`      | Page (client)                        | 12 useState |
|  1019 | `app/admin/portal-allotments/page.tsx`      | Page (client)                        | 12 useState |
|  1011 | `app/api/admin/email/route.ts`              | API route (server)                   | n/a         |
|   939 | `app/[locale]/(main)/registration/page.tsx` | Page (client)                        | many        |
|   925 | `app/admin/notifications/page.tsx`          | Page (client)                        | many        |
|   880 | `app/admin/offer-letter/page.tsx`           | Page (client)                        | many        |
|   850 | `src/components/admin/email/ComposeTab.tsx` | Component                            | many        |
|   844 | `app/admin/payment-receipts/page.tsx`       | Page                                 | many        |
|   808 | `app/admin/bba/page.tsx`                    | Page (client)                        | many        |
|   746 | `app/admin/settings/page.tsx`               | Page (client, 8 tab branches inline) | many        |

### 3. Repeated patterns

| Pattern                                                                  |                  Occurrences | Refactor target                                           |
| ------------------------------------------------------------------------ | ---------------------------: | --------------------------------------------------------- |
| `fetch('/api/...', { headers: { Authorization: \`Bearer ${token}\` } })` |                 **41 files** | Centralize in `src/lib/api/fetcher.ts`                    |
| `supabaseAdmin.from(...)` direct usage in API routes                     | **40 API files, 39 queries** | Migrate to typed repositories                             |
| `useState({ ... })` for form data without explicit type                  |                 **28 sites** | Add `interface XxxFormData`                               |
| `useState<any>`                                                          |                  **5 sites** | Type properly                                             |
| `console.error` (often leaking)                                          |                **216 sites** | Replace with `NotificationHelper` / structured logger     |
| `console.warn`                                                           |                 **17 sites** | Same                                                      |
| `innerHTML =` (XSS risk)                                                 |                  **3 sites** | Use `textContent` or DOMPurify                            |
| `dangerouslySetInnerHTML`                                                |                 **14 sites** | Audit each — many are JSON-LD (OK), some are user content |
| Hardcoded user-facing English strings in locale routes                   |                **55+ sites** | Migrate to `useTranslations`                              |

### 4. i18n coverage gap

- 61 files in `app/[locale]/(main)/`
- Only **13** use `useTranslations` / `getTranslations`
- **~48 files (~79%)** have hardcoded English strings
- `messages/en.json` and `messages/hi.json` exist but are underused

### 5. Test coverage gap

- 10 unit tests cover only: registration API, BBA helpers, template parser, admin API
- **No tests for:** allotment-letter, bba-page, email compose, lottery, dashboard, attendance, settings, public pages
- e2e covers: dashboard, login, auth-guard, navigation, blog, i18n, pages, calculators, home
- **No e2e for:** contact form, registration form, grievance, payment, lottery, BBA generation, email send

### 6. Security findings

| Risk                                                      | Location                                                     | Severity                            |
| --------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| `innerHTML` with template literal                         | `CompletedProjectsMap.tsx`, `contact/page.tsx`               | High if user input ever flows in    |
| `dangerouslySetInnerHTML` with admin email body           | `ComposeTab.tsx`, `TemplatesTab.tsx`, `EmailDetailPanel.tsx` | Med (admin-only but untrusted HTML) |
| `theme-init.js` inline script in `app/layout.tsx`         | Two `dangerouslySetInnerHTML` (JSON-LD)                      | Low (static)                        |
| 216 `console.error` may leak stack traces to users in dev | Throughout                                                   | Low                                 |

### 7. Architecture gaps

- No central API client → 41 files re-implement auth-header pattern
- No central error boundary helper → 216 `console.error`
- No `formData` shared types → 28 sites use untyped `useState({})`
- Repository layer exists (`src/lib/repositories/`) but most API routes bypass it
- No shared `useApi` or `fetcher` hook beyond the experimental `useApi.ts`

---

## Proposed Roadmap — 4 Stages

### 🟢 Stage 1: Foundation (Quick ROI, 2-3 hrs)

**Goal:** Eliminate the most-repeated pattern + split the easiest huge file.

|   # | Task                                                                                                                                                                                        | Time | Why                                                |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: | -------------------------------------------------- |
| 1.1 | Create `src/lib/api/fetcher.ts` with `apiGet<T>`, `apiPost<T>`, `apiDelete<T>`, `apiPatch<T>` that auto-attach `Authorization: Bearer ${token}` and parse JSON.                             | 30 m | 41 files stop duplicating auth-header boilerplate. |
| 1.2 | Split `BbaLegalPages.tsx` (1040 lines, **0 hooks**) into per-section presentational components in `src/components/admin/bba/`. Keep `BbaLegalPages.tsx` as a thin orchestrator (~80 lines). | 60 m | Mechanical, low risk, immediate readability win.   |
| 1.3 | Add `/* eslint-env node */` to remaining scratch scripts so lint passes for all 6 files.                                                                                                    | 10 m | 64 lint errors → 0.                                |

**Result:** ~3 hours, ~12 files touched, 0 functional change.

### 🟡 Stage 2: Type Safety Sprint (3-4 hrs)

**Goal:** Remove the 49 `as any` casts and add Zod validation to API routes.

|   # | Task                                                                                                                                                      | Time |
| --: | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: |
| 2.1 | Add proper types for `Resend` API responses in `src/types/resend.ts`. Replace 13 `as any` in `app/api/admin/email/route.ts`.                              | 60 m |
| 2.2 | Define `EmailReply` interface in `src/types/email.ts`. Replace 6 `as any` in `RepliesTab.tsx`.                                                            | 30 m |
| 2.3 | Add generic types to `lotteryRepository.ts` methods (`ScheduledDraw`, `LotteryParticipant`, `LotteryWinner`). Replace 5 `as any`.                         | 45 m |
| 2.4 | Audit the remaining 24 `as any` in other files; add a brief comment if intentional, fix if not.                                                           | 45 m |
| 2.5 | Add Zod schemas to top 5 most-trafficked API routes (`/api/contact`, `/api/registration`, `/api/grievance`, `/api/admin/users`, `/api/admin/properties`). | 60 m |

**Result:** ~4 hours, ~20 files touched, type safety dramatically improved, runtime validation on key endpoints.

### 🟠 Stage 3: Big-File Splits (4-6 hrs)

**Goal:** Break the top 3 huge files into manageable components.

|   # | Task                                                                                                                                                                                                                                                                |  Time |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: |
| 3.1 | Extract `app/admin/allotment-letter/page.tsx` (1261 lines) into:<br>• `AllotmentForm` (~300 lines)<br>• `AllotmentPreview` (~400 lines, lazy-loaded)<br>• `SavedAllotmentsList` (~150 lines)<br>• `useAllotmentForm` hook (~150 lines)<br>• Page becomes ~200 lines | 120 m |
| 3.2 | Refactor `app/admin/settings/page.tsx` (746 lines) — the 8 tab branches are already imported from `src/components/admin/settings/*`. Remove the inline-tab logic and let each `*Tab` component own its own state.                                                   |  90 m |
| 3.3 | Split `app/admin/bba/page.tsx` (808 lines) similarly:<br>• `BbaForm` (~300 lines)<br>• `BbaPreview` (reuse BbaLegalPages)<br>• `useBbaForm` hook                                                                                                                    |  90 m |

**Result:** ~5 hours, 3 files become < 250 lines each.

### 🔴 Stage 4: Polish (3-5 hrs)

**Goal:** Test coverage, i18n, security, observability.

|   # | Task                                                                                                                                                          | Time |
| --: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: |
| 4.1 | Add Vitest tests for: `documentExporter`, `templateParser`, `useApi`, `authStore`, `uiStore`, `lotteryRepository`, `attendanceRepository`. Target: +15 tests. | 90 m |
| 4.2 | Add e2e tests for: contact form, registration form, grievance form, payment page.                                                                             | 60 m |
| 4.3 | Audit 14 `dangerouslySetInnerHTML` usages; add `DOMPurify` where user content flows in.                                                                       | 60 m |
| 4.4 | Add `NotificationHelper`-backed error toasts in 5 most-noisy files (replace bare `console.error` with user-facing error).                                     | 45 m |
| 4.5 | Migrate 10 highest-traffic pages to `useTranslations` (home, about, contact, faq, blog, leadership, registration, grievance, payment, login).                 | 90 m |

**Result:** ~6 hours, 30+ files touched, full polish pass.

---

## Suggested Order of Execution

The user asked for the plan first. Below is the recommended execution sequence (each step is one PR):

|      PR |              Stage              | Est. Time | Risk |                    Files |
| ------: | :-----------------------------: | --------: | ---- | -----------------------: |
|  **#1** |   Stage 1.1 — Fetcher utility   |      30 m | Low  |      1 new + 41 migrated |
|  **#2** | Stage 1.2 — Split BbaLegalPages |      60 m | Low  |          1 new + 1 split |
|  **#3** |  Stage 1.3 — Lint fix scratch   |      10 m | None |                  6 files |
|  **#4** |  Stage 2.1 — Email route types  |      60 m | Med  |                  2 files |
|  **#5** |  Stage 2.2 — RepliesTab types   |      30 m | Med  |                  2 files |
|  **#6** | Stage 2.3 — Lottery repo types  |      45 m | Med  |                  2 files |
|  **#7** | Stage 2.4 — Audit other as any  |      45 m | Low  |                ~10 files |
|  **#8** |     Stage 2.5 — Zod schemas     |      60 m | Med  | 5 routes + 1 schema file |
|  **#9** |   Stage 3.1 — Allotment split   |     120 m | Med  |           1 page + 4 new |
| **#10** |  Stage 3.2 — Settings refactor  |      90 m | Med  |          1 page + 8 tabs |
| **#11** |   Stage 3.3 — BBA page split    |      90 m | Med  |           1 page + 3 new |
| **#12** |     Stage 4.1 — Unit tests      |      90 m | Low  |                +15 tests |
| **#13** |      Stage 4.2 — E2E tests      |      60 m | Low  |                 +4 specs |
| **#14** |      Stage 4.3 — XSS audit      |      60 m | Med  |                  5 files |
| **#15** |    Stage 4.4 — Error toasts     |      45 m | Low  |                  5 files |
| **#16** |   Stage 4.5 — i18n migration    |      90 m | Med  |                 10 pages |

**Total: ~16 hours of focused work across 16 reviewable PRs.**

---

## Out of Scope (Deliberately Deferred)

- Migrating from `next/dynamic` to RSC streaming
- Replacing Supabase with Prisma
- Building a Storybook
- Setting up Storybook visual tests
- i18n for admin portal (currently English-only by design)
- Migrating from Pages Router to App Router (already on App Router)

---

## Verification Strategy

After each PR:

- `npm test` must remain 78+ passing (no regression)
- `npm run lint -- --quiet` must remain 0 errors in source
- `git diff --stat` should show < 500 lines added per PR
- e2e suite (where applicable) must pass

---

## Decision Points

I want your sign-off on:

1. **Sequence:** Execute in order from PR #1 → #16, or skip ahead?
2. **PRs vs monorepo:** One PR per stage, or one big PR per stage?
3. **Stage 4.5 i18n:** Do you actually want full Hindi translations, or just wire the keys?
4. **Stage 2.5 Zod:** Add now, or wait for a dedicated security sprint?
