# AI-Powered Admin Email Center

## Current State Summary

**Existing AI stack:**

- Groq provider (`@ai-sdk/groq`) with Llama 3.3 70B model
- Vercel AI SDK v6 (`ai` package) with `streamText` and `useChat`
- Chat API route at `app/api/chat/route.ts` with streaming responses
- Context system (`src/lib/chat-context.ts`) injecting Supabase data into prompts
- Rate limiting via `src/lib/api/rateLimit`

**Email center architecture:**

- TipTap rich text editor (`RichTextEditor.tsx`) with full formatting toolbar
- Template system with `{{variable}}` placeholders parsed by `src/lib/utils/templateParser`
- Draft auto-save system (localStorage, multi-draft with `helpers.ts`)
- Resend-based sending/receiving via `app/api/admin/email/route.ts`
- Inbox detail panel (`sections/EmailDetailPanel.tsx`) with reply/forward

---

## Feature 1: AI-Assisted Email Writing (Compose Tab)

### What

An "AI Write" button in the RichTextEditor toolbar that generates email content from a brief prompt. The admin types a short instruction (e.g., "Write a follow-up about site visit scheduling") and the AI generates a full professional email body.

### Where to implement

**New API route:** `app/api/admin/email/ai/route.ts`

- Accepts `{ action: 'generate', prompt: string, context?: { recipientName, subject, templateId } }`
- Uses `streamText` from `ai` with `groq('llama-3.3-70b-versatile')`
- System prompt tailored for SVI business email writing (professional, Indian English, property-focused)
- Streams response back to client for real-time display
- Rate-limited (10 requests/min per admin)
- Admin-authenticated via `verifyAdmin`

**New component:** `src/components/admin/email/compose/AIComposePopover.tsx`

- Floating popover triggered from the editor toolbar
- Text input for the writing prompt
- "Tone" selector dropdown: Professional, Friendly, Formal, Urgent
- "Generate" button with streaming text preview
- "Insert" and "Replace" actions to push content into the TipTap editor
- Uses `fetch` with streaming (ReadableStream) or the `ai` SDK's `useChat` hook

**Modified files:**

- `src/components/admin/email/RichTextEditor.tsx` -- Add a Sparkles icon button to the toolbar (after the Clear Formatting button). When clicked, it opens the `AIComposePopover`. The popover receives the editor instance to insert/replace content.
- `src/components/admin/email/ComposeTab.tsx` -- No changes needed; the AI button lives inside the editor toolbar.

### UX flow

1. Admin clicks the Sparkles button in the editor toolbar
2. A popover appears below the toolbar with a text input and tone selector
3. Admin types a brief instruction and clicks "Generate"
4. AI streams the email body in real-time into a preview area within the popover
5. Admin clicks "Insert" to append to the editor, or "Replace" to overwrite current content
6. The popover closes, content appears in the TipTap editor

---

## Feature 2: AI Draft Improvement & Refinement

### What

An "Improve" action available on drafts (both inline in ComposeTab and from the DraftsTab list) that uses AI to refine the email's grammar, tone, and clarity while preserving the original meaning.

### Where to implement

**API route:** `app/api/admin/email/ai/route.ts` (same route, different action)

- Accepts `{ action: 'improve', html: string, instruction?: string }`
- Instruction options: "Fix grammar", "Make more formal", "Make more concise", "Make friendlier", "General improvement"
- Returns improved HTML with the same structure

**New component:** `src/components/admin/email/compose/AIImprovePanel.tsx`

- A slide-up panel or inline banner in ComposeTab (similar pattern to `TemplateBanner`)
- Shows original vs. improved content with a diff-style highlight
- "Apply" button to replace the editor content
- "Undo" to revert

**Modified files:**

- `src/components/admin/email/ComposeTab.tsx` -- Add an "Improve" button in the footer toolbar (next to the Discard button). When clicked, sends current `html` to the AI improve endpoint and shows `AIImprovePanel`.
- `src/components/admin/email/DraftsTab.tsx` -- Add an "Improve" hover action on each draft item alongside Open and Delete.

### UX flow

1. While composing, admin clicks "Improve" in the footer toolbar
2. A panel slides up showing the AI-refined version with highlighted changes
3. Admin can select a refinement type (grammar, tone, conciseness) from a dropdown
4. Clicking "Apply" replaces the editor content; "Dismiss" closes the panel

---

## Feature 3: Email Thread Summarization

### What

A "Summarize" button in the email detail panel (Inbox/Sent) that generates a concise summary of long email threads, extracting key points, action items, and deadlines.

### Where to implement

**API route:** `app/api/admin/email/ai/route.ts` (same route, different action)

- Accepts `{ action: 'summarize', emails: Array<{ from, subject, html, created_at }> }`
- Returns structured summary: key points (bullets), action items, deadlines, sentiment

**New component:** `src/components/admin/email/sections/AISummaryPanel.tsx`

- Replaces or overlays the `EmailDetailPanel` content when summarization is active
- Displays structured summary with collapsible sections
- "Copy Summary" button
- "Close" to return to normal detail view

**Modified files:**

- `src/components/admin/email/sections/EmailDetailPanel.tsx` -- Add a "Summarize" button in the detail panel header (next to Reply/Forward). When clicked, sends the thread content to the summarize endpoint and shows `AISummaryPanel`.
- `src/components/admin/email/RepliesTab.tsx` -- No direct changes; the button lives in `EmailDetailPanel` which is already used by RepliesTab.
- `src/components/admin/email/SentTab.tsx` -- Same; `EmailDetailPanel` is shared.

### UX flow

1. Admin opens an email in Inbox or Sent
2. Clicks "Summarize" in the detail panel header
3. AI processes the thread and returns a structured summary
4. Summary appears in a styled panel replacing the full email body
5. Key points, action items, and deadlines are highlighted
6. Admin can copy the summary or close to return to the full email

---

## Feature 4: Smart Template Suggestions & Variable Population

### What

When a template is selected, AI automatically suggests and populates template variables based on available context (recipient data, email history, Supabase records).

### Where to implement

**API route:** `app/api/admin/email/ai/route.ts` (same route, different action)

- Accepts `{ action: 'populate_template', templateId: string, variables: string[], recipientEmail?: string }`
- Fetches recipient data from Supabase (profiles, registrations, payment records, allotment records)
- Uses AI to intelligently map available data to template variables
- Returns `{ suggestions: Record<string, string>, confidence: Record<string, 'high' | 'medium' | 'low'> }`

**New component:** `src/components/admin/email/compose/SmartTemplateSuggestion.tsx`

- An enhancement to the existing `TemplateBanner` component
- Shows AI-suggested values next to each template variable input
- Confidence indicators (green/yellow/red dots)
- "Apply All" and "Apply Individual" buttons
- "Refresh" to re-fetch suggestions

**Modified files:**

- `src/components/admin/email/compose/TemplateBanner.tsx` -- Add a "Smart Fill" button in the template banner header. When clicked, calls the populate_template endpoint and displays suggestions inline next to each variable input.
- `src/components/admin/email/ComposeTab.tsx` -- Pass `recipientEmail` (from `to` field) to `TemplateBanner` for context-aware suggestions.

### UX flow

1. Admin selects a template (e.g., "Allotment Letter")
2. Template variables appear in the `TemplateBanner`
3. Admin clicks "Smart Fill" button
4. AI looks up the recipient email in Supabase and auto-populates variables
5. Suggested values appear with confidence indicators
6. Admin reviews, adjusts if needed, and applies

---

## Feature 5: Sentiment Analysis & Response Suggestions

### What

When viewing received emails in the Inbox, AI analyzes the sender's sentiment and suggests appropriate response drafts.

### Where to implement

**API route:** `app/api/admin/email/ai/route.ts` (same route, different action)

- Accepts `{ action: 'analyze_sentiment', emailHtml: string, emailText?: string }`
- Returns `{ sentiment: 'positive' | 'neutral' | 'negative' | 'urgent', score: number, summary: string, suggestedResponses: Array<{ label: string, tone: string, html: string }> }`

**New component:** `src/components/admin/email/sections/SentimentBadge.tsx`

- A small badge displayed in the `EmailDetailPanel` header showing sentiment with color coding
- Clickable to expand into a panel with detailed analysis and response suggestions

**Modified files:**

- `src/components/admin/email/sections/EmailDetailPanel.tsx` -- Add `SentimentBadge` next to the email subject. Add a "Suggest Reply" button that triggers sentiment analysis and shows 2-3 suggested response drafts.
- `src/components/admin/email/RepliesTab.tsx` -- No direct changes; the badge lives in `EmailDetailPanel`.

### UX flow

1. Admin opens a received email in Inbox
2. Sentiment badge appears automatically next to the subject (positive/neutral/negative/urgent)
3. Admin clicks "Suggest Reply" button
4. AI analyzes the email and suggests 2-3 response drafts with different tones
5. Admin clicks a suggestion to pre-fill the reply composer (triggers existing `onReply` callback with the suggested HTML)

---

## Technical Architecture

### New API Route: `app/api/admin/email/ai/route.ts`

```typescript
// Single route handling all AI email actions via `action` field
// POST body: { action: 'generate' | 'improve' | 'summarize' | 'populate_template' | 'analyze_sentiment', ... }

// Uses:
// - groq('llama-3.3-70b-versatile') for all AI operations
// - streamText for generate/improve (streaming)
// - generateText for summarize/populate_template/analyze_sentiment (non-streaming)
// - verifyAdmin middleware
// - rateLimit (10 req/min)
// - Supabase admin client for data lookups
```

### New Shared Hook: `src/components/admin/email/hooks/useAIEmail.ts`

```typescript
// Encapsulates all AI email API calls
// Provides: { generateContent, improveContent, summarizeThread, populateTemplate, analyzeSentiment }
// Handles loading states, error handling, streaming, and abort controller
```

### Environment Variables

No new environment variables needed. The existing `GROQ_API_KEY` is already configured and used by the chatbot. The AI email features reuse the same Groq provider.

### File Structure Summary

```
New files:
  app/api/admin/email/ai/route.ts              -- AI email API endpoint
  src/components/admin/email/hooks/useAIEmail.ts -- Shared AI hook
  src/components/admin/email/compose/AIComposePopover.tsx  -- Feature 1
  src/components/admin/email/compose/AIImprovePanel.tsx    -- Feature 2
  src/components/admin/email/compose/SmartTemplateSuggestion.tsx -- Feature 4
  src/components/admin/email/sections/AISummaryPanel.tsx    -- Feature 3
  src/components/admin/email/sections/SentimentBadge.tsx    -- Feature 5

Modified files:
  src/components/admin/email/RichTextEditor.tsx   -- Add AI button to toolbar
  src/components/admin/email/ComposeTab.tsx        -- Add Improve button to footer
  src/components/admin/email/DraftsTab.tsx         -- Add Improve action on drafts
  src/components/admin/email/compose/TemplateBanner.tsx -- Add Smart Fill button
  src/components/admin/email/sections/EmailDetailPanel.tsx -- Add Summarize + Sentiment
```

### Implementation Order

1. **API route first** (`app/api/admin/email/ai/route.ts`) -- All features depend on this
2. **Shared hook** (`hooks/useAIEmail.ts`) -- Used by all frontend components
3. **Feature 1: AI Compose** -- Highest value, standalone
4. **Feature 2: Draft Improvement** -- Builds on compose
5. **Feature 4: Smart Templates** -- Builds on template system
6. **Feature 3: Thread Summarization** -- Independent of compose
7. **Feature 5: Sentiment Analysis** -- Independent, lowest priority

### Key Design Decisions

- **Single API route** with action-based dispatch to reduce route proliferation
- **Streaming for generation** (Features 1 & 2) for real-time feedback
- **Non-streaming for analysis** (Features 3, 4, 5) since results are structured JSON
- **Reuse Groq provider** already configured -- no new AI service needed
- **TipTap editor integration** via the editor instance prop -- AI inserts content through `editor.commands.setContent()` or `editor.commands.insertContent()`
- **AbortController** in the shared hook to cancel in-flight requests when the user navigates away
- **Graceful degradation** -- if AI fails, show a toast error and leave existing content unchanged
