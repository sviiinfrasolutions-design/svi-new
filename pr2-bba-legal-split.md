# PR #2: Split `BbaLegalPages.tsx`

> **Stage 1.2 of the refactor roadmap.**
> **Time estimate:** 60 minutes.
> **Risk:** Low (presentational component, no hooks, no API calls, no side effects).

---

## Background

`app/admin/bba/BbaLegalPages.tsx` is **1040 lines** of pure JSX. It renders the legal preamble + clauses of a Builder Buyer Agreement (BBA) PDF preview.

Key facts from the deep scan:

- ✅ **0 hooks** (`useState`, `useEffect`, etc.)
- ✅ **0 API calls**
- ✅ **0 side effects**
- ✅ Takes 3 props: `formData`, `companyInfo`, `totalCost` (currently typed `any`)
- Only **1 export**: `BbaLegalPages` default

This makes it the **easiest mechanical split** in the codebase.

---

## Current Structure (sections in the file)

Based on grep of the JSX:

| Section                | Approx. lines | Content                           |
| ---------------------- | ------------: | --------------------------------- |
| Page header + date     |          1-50 | Title, "Date: ..."                |
| Party 1 (Seller) block |        50-150 | Company info, signatory           |
| Party 2 (Buyer) block  |       150-280 | Buyer name, address, contact      |
| Recitals ("WHEREAS")   |       280-380 | Background clauses                |
| Operative clauses 1-5  |       380-650 | Definitions, sale intent, etc.    |
| Payment schedule       |       650-780 | Total cost, payment plan          |
| Schedule of property   |       780-900 | Unit details, area, BHK           |
| General terms          |       900-970 | Force majeure, dispute resolution |
| Signature block        |      970-1040 | Both parties' sign lines          |

---

## Plan: Extract 8 Section Components

Create `src/components/admin/bba/legal/` and split the file into:

```
src/components/admin/bba/legal/
├── index.ts                       # barrel exports
├── types.ts                       # BBALegalFormData, BBALegalCompanyInfo, BBALegalContext
├── LegalPageHeader.tsx            # header + date
├── SellerBlock.tsx                # Party 1 (company)
├── BuyerBlock.tsx                 # Party 2 (buyer)
├── RecitalsBlock.tsx              # "WHEREAS" clauses
├── OperativeClausesBlock.tsx      # Clauses 1-5
├── PaymentScheduleBlock.tsx       # Payment terms + totalCost
├── PropertyScheduleBlock.tsx      # Unit, area, BHK
├── GeneralTermsBlock.tsx          # Boilerplate
└── SignatureBlock.tsx             # Sign lines
```

After the split:

```ts
// app/admin/bba/BbaLegalPages.tsx (~80 lines)
import { types } from '@/src/components/admin/bba/legal';
import { /* all 9 blocks */ } from '@/src/components/admin/bba/legal';

export default function BbaLegalPages({ formData, companyInfo, totalCost }: BBALegalProps) {
  const ctx = { formData, companyInfo, totalCost };
  return (
    <div className="...">
      <LegalPageHeader {...ctx} />
      <SellerBlock {...ctx} />
      <BuyerBlock {...ctx} />
      <RecitalsBlock {...ctx} />
      <OperativeClausesBlock {...ctx} />
      <PaymentScheduleBlock {...ctx} />
      <PropertyScheduleBlock {...ctx} />
      <GeneralTermsBlock {...ctx} />
      <SignatureBlock {...ctx} />
    </div>
  );
}
```

---

## Type Safety Win

The current props are `any`. We will introduce proper types:

```ts
// src/components/admin/bba/legal/types.ts
export interface BBALegalFormData {
  clientName: string;
  salutation?: string;
  address: string;
  projectName: string;
  unitNumber: string;
  area: string | number;
  bsp: string | number;
  plc: string | number;
  edc: string | number;
  paymentPlan: string;
  // ... other form fields used by the BBA legal pages
}

export interface BBALegalCompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
  // ... other company fields
}

export interface BBALegalContext {
  formData: BBALegalFormData;
  companyInfo: BBALegalCompanyInfo;
  totalCost: number;
}
```

This removes the implicit `any` prop and creates a **contract** that future refactors can build on.

---

## Files Touched

| File                                                       | Action                       | LoC after |
| ---------------------------------------------------------- | ---------------------------- | --------: |
| `app/admin/bba/BbaLegalPages.tsx`                          | Shrink to orchestrator       |       ~80 |
| `src/components/admin/bba/legal/index.ts`                  | New (barrel)                 |       ~15 |
| `src/components/admin/bba/legal/types.ts`                  | New                          |       ~40 |
| `src/components/admin/bba/legal/LegalPageHeader.tsx`       | New                          |       ~30 |
| `src/components/admin/bba/legal/SellerBlock.tsx`           | New                          |       ~70 |
| `src/components/admin/bba/legal/BuyerBlock.tsx`            | New                          |       ~80 |
| `src/components/admin/bba/legal/RecitalsBlock.tsx`         | New                          |       ~90 |
| `src/components/admin/bba/legal/OperativeClausesBlock.tsx` | New                          |      ~180 |
| `src/components/admin/bba/legal/PaymentScheduleBlock.tsx`  | New                          |      ~120 |
| `src/components/admin/bba/legal/PropertyScheduleBlock.tsx` | New                          |      ~110 |
| `src/components/admin/bba/legal/GeneralTermsBlock.tsx`     | New                          |       ~80 |
| `src/components/admin/bba/legal/SignatureBlock.tsx`        | New                          |       ~80 |
| `app/admin/bba/BbaPreviewContent.tsx` (or similar)         | Verify import path unchanged |         0 |
| **Optional**: 1 snapshot test of BbaLegalPages             | New                          |       ~20 |

**Net: 1040 lines → 12 files, each <200 lines, with proper types.**

---

## Verification

After split:

- `npm test` — must remain 89+ passing
- `npm run build` — must succeed (no missing exports)
- Visual check: open `/admin/bba`, generate a preview, compare to before
- No new lint errors in source
- Total LoC delta: ~+30 lines (types + barrel + orchestrator), but readability ⬆️⬆️⬆️

---

## Risk Mitigation

1. **Visual regression:** Screenshot the current PDF preview before splitting, then compare after.
2. **Prop drilling:** All 9 blocks share the same `BBALegalContext`. Use the type instead of passing 3 separate props.
3. **Number formatting:** Preserve existing `toLocaleString('en-IN')` calls.
4. **Class names:** Pure copy-paste, no Tailwind class changes.

---

## Out of Scope

- Replacing the BBA legal text itself (legal review is a separate concern).
- Migrating to RSC (this stays a client component because the parent is).
- Re-typing `formData` and `companyInfo` in the calling `app/admin/bba/page.tsx` (that is a separate refactor — we just narrow what BbaLegalPages needs).

---

## Suggested Follow-ups (future PRs)

- PR #3: Migrate `app/admin/bba/page.tsx` to use the new types.
- PR #4: Extract `BbaPreviewContent.tsx` similarly (430 lines).
- PR #5: Add Storybook stories for each legal block (visual testing).
