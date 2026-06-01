# 📧 Email Center — Feature Enhancement Plan

> **Target:** `/admin/email` page
> **Stack:** Next.js + Supabase + Resend API + Tailwind + Framer Motion
> **Date:** 2026-06-01

---

## 📊 Current State Analysis

### ✅ Already Working

| Feature             | Status                    | Location                     |
| ------------------- | ------------------------- | ---------------------------- |
| Compose Email       | ✅                        | ComposeTab                   |
| CC/BCC Fields       | ✅ (hidden behind toggle) | ComposeTab — "CC/BCC" button |
| Reply-To            | ✅ (hidden in advanced)   | ComposeTab                   |
| From Name           | ✅ (hidden in advanced)   | ComposeTab                   |
| Send via Resend API | ✅                        | `/api/admin/email`           |
| Sent Emails List    | ✅                        | SentTab                      |
| Email Detail View   | ✅                        | SentTab — side panel         |
| Copy Email ID       | ✅                        | SentTab — detail panel       |
| Quick Templates     | ✅                        | ComposeTab — left sidebar    |
| Campaigns           | ✅                        | CampaignsTab                 |
| Domains             | ✅                        | DomainsTab                   |
| Settings            | ✅                        | SettingsTab                  |

### ❌ Missing / Needs Improvement

| Feature                 | Status                            | Priority  |
| ----------------------- | --------------------------------- | --------- |
| CC/BCC always visible   | Hidden behind toggle              | 🟡 Medium |
| Copy Full Email Content | Only copies ID                    | 🔴 High   |
| Forward Email           | Not available                     | 🔴 High   |
| Reply to Email          | Not available                     | 🔴 High   |
| Draft Auto-Save         | Not available                     | 🟡 Medium |
| Email Attachments       | Not available                     | 🟡 Medium |
| Star/Favorite Emails    | Not available                     | 🟢 Low    |
| Email Scheduling        | Not available (Campaigns have it) | 🟢 Low    |
| Bulk Operations         | Not available                     | 🟢 Low    |

---

## 🚀 Feature Plan

---

### Feature 1: CC/BCC — Always Visible (UI Improvement)

**Current:** CC/BCC fields hidden behind a "CC/BCC" toggle button
**Proposed:** Make CC/BCC always visible in compose form (collapsible is fine, but more prominent)

#### Changes Required:

**File:** `src/components/admin/email/ComposeTab.tsx`

```
- Remove the toggle button approach
- Make CC/BCC fields always visible below "To" field
- Add "+" button to expand CC/BCC if not filled (saves space when not needed)
- Better: Show CC/BCC as a single row with small "+" icons next to To field
```

#### UI Design:

```
┌─────────────────────────────────────────────┐
│ ✉️  New Email                               │
├─────────────────────────────────────────────┤
│ To   │ recipient@example.com          [CC▾] │
│ CC   │ cc@example.com                       │
│ BCC  │ bcc@example.com                      │
│ Subj │ Email subject...                     │
│ ─────────────────────────────────────────── │
│ [Email body textarea]                       │
└─────────────────────────────────────────────┘
```

**Better approach:** Show CC/BCC as clickable chips next to "To" label, like Gmail:

```
To: [recipient@email.com] [+CC] [+BCC]
```

---

### Feature 2: Copy Full Email Content Button

**Current:** Only copies Email ID
**Proposed:** Add "Copy Email" button that copies full email content (subject + body + recipients)

#### Changes Required:

**File:** `src/components/admin/email/SentTab.tsx`

1. Add a "Copy Email" button in the detail panel header
2. Copy format:

```
Subject: {subject}
From: {from}
To: {to.join(', ')}
CC: {cc?.join(', ') || '—'}
BCC: {bcc?.join(', ') || '—'}
Date: {formatted date}

---
{email body as plain text or HTML}
```

3. Add a dropdown with copy options:
   - **Copy as Text** — plain text version
   - **Copy as HTML** — raw HTML
   - **Copy Subject** — just subject line
   - **Copy Recipients** — all To/CC/BCC addresses

#### UI Design:

```
┌──────────────────────────────────────┐
│ 📋 Copy ▾          ✉️ Email Detail  │
├──────────────────────────────────────┤
│  □ Copy as Text                      │
│  □ Copy as HTML                      │
│  □ Copy Subject                      │
│  □ Copy Recipients                   │
└──────────────────────────────────────┘
```

---

### Feature 3: Email Forwarding

**Current:** No forward functionality
**Proposed:** Add "Forward" button that opens compose with original email content pre-filled

#### Changes Required:

**File:** `src/components/admin/email/SentTab.tsx`

1. Add "Forward" button in detail panel
2. On click → switch to ComposeTab with pre-filled data:
   - Subject: `Fwd: {original subject}`
   - Body: Original HTML wrapped in forward block
   - To: empty (user fills)
   - CC/BCC: empty

**File:** `src/components/admin/email/ComposeTab.tsx`

1. Accept `forwardData` prop
2. Pre-fill form when forwardData is provided

**File:** `app/admin/email/page.tsx`

1. Add state for `forwardData`
2. Pass to both tabs
3. Auto-switch to compose tab when forward is clicked

#### Forward Email Template:

```html
<div style="border-left: 3px solid #ccc; padding-left: 16px; margin-top: 24px;">
  <p style="color: #666; font-size: 13px;">
    ---------- Forwarded message ----------<br />
    From: {from}<br />
    Date: {date}<br />
    Subject: {subject}<br />
    To: {to}
  </p>
  {original html}
</div>
```

#### UI Design (Detail Panel):

```
┌──────────────────────────────────────┐
│ ✉️ Email Detail                      │
├──────────────────────────────────────┤
│ Subject: Welcome to SVI...           │
│ From: noreply@svi...                 │
│ To: user@example.com                 │
│                                      │
│ [📋 Copy] [↩️ Reply] [↪️ Forward]   │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Email preview...                 │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

### Feature 4: Reply to Email

**Current:** No reply functionality
**Proposed:** Add "Reply" button that pre-fills compose form

#### Changes Required:

**File:** `src/components/admin/email/SentTab.tsx`

1. Add "Reply" button in detail panel
2. On click → switch to ComposeTab with:
   - To: original sender (from field)
   - Subject: `Re: {original subject}`
   - Body: Original content in quote block
   - CC: original CC recipients

**File:** `src/components/admin/email/ComposeTab.tsx`

1. Accept `replyData` prop
2. Pre-fill form when replyData is provided

#### Reply Email Template:

```html
<div style="margin-top: 24px;">
  <p style="color: #666;">On {date}, {from} wrote:</p>
  <blockquote style="border-left: 3px solid #ccc; padding-left: 16px; color: #666;">
    {original html}
  </blockquote>
</div>
```

---

### Feature 5: Draft Auto-Save

**Current:** No draft saving — data lost on page refresh
**Proposed:** Auto-save draft to localStorage every 5 seconds

#### Changes Required:

**File:** `src/components/admin/email/ComposeTab.tsx`

1. Add useEffect to save form state to localStorage:

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    if (to || subject || html) {
      localStorage.setItem(
        'email-draft',
        JSON.stringify({
          to,
          cc,
          bcc,
          subject,
          html,
          replyTo,
          fromName,
        })
      );
    }
  }, 5000);
  return () => clearInterval(timer);
}, [to, cc, bcc, subject, html, replyTo, fromName]);
```

2. On mount, check for saved draft:

```typescript
useEffect(() => {
  const saved = localStorage.getItem('email-draft');
  if (saved) {
    const draft = JSON.parse(saved);
    setTo(draft.to || '');
    setCc(draft.cc || '');
    // ... etc
  }
}, []);
```

3. Clear draft after successful send
4. Add "Draft saved" indicator in UI
5. Add "Discard Draft" button

#### UI Design:

```
┌──────────────────────────────────────┐
│ ✉️ New Email    💾 Draft saved 2s ago│
├──────────────────────────────────────┤
│ ...                                  │
└──────────────────────────────────────┘
```

---

### Feature 6: Email Attachments

**Current:** No attachment support
**Proposed:** Add file upload to compose form

#### Changes Required:

**File:** `src/components/admin/email/ComposeTab.tsx`

1. Add file input for attachments
2. Show selected files with remove option
3. Convert files to base64 for Resend API

**File:** `app/api/admin/email/route.ts`

1. Accept `attachments` array in POST body
2. Pass to Resend API:

```typescript
attachments: files.map((f) => ({
  filename: f.name,
  content: f.base64Content,
}));
```

#### UI Design:

```
┌──────────────────────────────────────┐
│ 📎 Attach Files                      │
│ ┌────────────────────────────────┐   │
│ │ invoice.pdf  (245 KB)    [×]  │   │
│ │ photo.jpg    (1.2 MB)    [×]  │   │
│ └────────────────────────────────┘   │
│ Max 10 files · 40MB total            │
└──────────────────────────────────────┘
```

**Note:** Resend supports attachments up to 40MB via base64 encoding.

---

### Feature 7: Star/Favorite Emails

**Current:** No starring functionality
**Proposed:** Star important emails for quick access

#### Changes Required:

**Database:** Add `starred_emails` table or column in Supabase

```sql
CREATE TABLE email_stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT NOT NULL UNIQUE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**File:** `src/components/admin/email/SentTab.tsx`

1. Add star icon next to each email in list
2. Toggle star on click
3. Add "Starred" filter option

**File:** `app/api/admin/email/route.ts`

1. Add POST action for `star`/`unstar`
2. Add GET filter for starred emails

---

## 📁 Files to Modify

| File                                        | Changes                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `src/components/admin/email/ComposeTab.tsx` | CC/BCC always visible, draft save, attachments, forward/reply pre-fill |
| `src/components/admin/email/SentTab.tsx`    | Copy button, Forward button, Reply button, Star button                 |
| `src/components/admin/email/types.ts`       | Add ForwardData, ReplyData interfaces                                  |
| `app/admin/email/page.tsx`                  | Forward/reply state management, tab switching                          |
| `app/api/admin/email/route.ts`              | Attachments support, star/unstar actions                               |
| `src/components/admin/email/helpers.ts`     | Draft save/load functions                                              |

---

## 🎯 Implementation Priority

### 🔴 Phase 1 — High Priority (Do First)

1. **Copy Full Email Button** — Quick win, high value
2. **Forward Email** — Essential for workflow
3. **Reply to Email** — Essential for workflow

### 🟡 Phase 2 — Medium Priority

4. **CC/BCC Always Visible** — UI polish
5. **Draft Auto-Save** — Prevents data loss
6. **Email Attachments** — Useful but more complex

### 🟢 Phase 3 — Low Priority (Nice to Have)

7. **Star/Favorite Emails** — Requires DB changes
8. **Email Scheduling** — Already in Campaigns
9. **Bulk Operations** — For power users

---

## 🎨 Design Principles

1. **Consistency** — Match existing brand-gold + navy theme
2. **Motion** — Use Framer Motion for all transitions (already in project)
3. **Accessibility** — Proper ARIA labels, keyboard navigation
4. **Dark Mode** — All new UI must support dark mode
5. **Responsive** — Mobile-friendly layouts

---

## ⚡ Quick Implementation Guide

### Copy Email Button (5 min)

```tsx
// In SentTab.tsx detail panel header
const copyEmailContent = () => {
  const text = `Subject: ${selected.subject}\nFrom: ${selected.from}\nTo: ${selected.to?.join(', ')}\n\n${selected.text || selected.html || ''}`;
  navigator.clipboard.writeText(text);
  setCopiedEmail(true);
  setTimeout(() => setCopiedEmail(false), 2000);
};
```

### Forward Button (15 min)

```tsx
// In SentTab.tsx detail panel
const handleForward = () => {
  setForwardData({
    subject: `Fwd: ${selected.subject}`,
    html: buildForwardHtml(selected),
  });
  setActiveTab('compose'); // Switch tab
};
```

### Reply Button (15 min)

```tsx
// In SentTab.tsx detail panel
const handleReply = () => {
  setReplyData({
    to: selected.from,
    subject: `Re: ${selected.subject}`,
    html: buildReplyHtml(selected),
  });
  setActiveTab('compose'); // Switch tab
};
```

---

## 📝 Notes

- Resend API already supports CC/BCC — backend is ready
- Resend API supports attachments via base64 — backend change needed
- Campaigns tab already has scheduling — could extend to single emails later
- All UI follows existing brand design system (brand-gold, brand-navy)
- Framer Motion already imported — use for all new animations
