# SVI Infra Solutions — Next.js Web Application

**SVI Infra Solutions Pvt. Ltd.** is a premium real estate development platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This application serves as a full-featured corporate website and administrative portal for managing real estate projects, client relationships, employee attendance, document generation, and more.

The platform combines a modern, responsive public-facing website with a comprehensive admin dashboard, featuring Supabase-powered authentication and database services, AI integration via Groq (Llama 4) and Google Gemini, interactive mapping with MapLibre GL, real-time analytics, a robust PDF document generation system, an email marketing suite, and a lottery management system.

---

## Tech Stack

### Core Framework & Language

| Technology     | Version | Purpose                                       |
| -------------- | ------- | --------------------------------------------- |
| **Next.js**    | ^16.2.6 | React framework with App Router, SSR, and SSG |
| **React**      | ^19.0.1 | UI component library                          |
| **TypeScript** | ^5.9.3  | Type-safe JavaScript                          |

### Styling & UI

| Technology                 | Version  | Purpose                                          |
| -------------------------- | -------- | ------------------------------------------------ |
| **Tailwind CSS**           | ^4.1.14  | Utility-first CSS framework                      |
| **@tailwindcss/postcss**   | ^4.3.0   | Tailwind CSS PostCSS plugin for v4               |
| **Tailwind Merge**         | ^3.6.0   | Intelligent Tailwind class merging               |
| **clsx**                   | ^2.1.1   | Conditional className utility                    |
| **Motion (Framer Motion)** | ^12.39.0 | Declarative animations for React                 |
| **Lucide React**           | ^1.16.0  | Open-source icon set                             |
| **Recharts**               | ^3.8.1   | Composable charting library for admin dashboards |
| **Sonner**                 | ^2.0.7   | Lightweight toast notification library           |
| **canvas-confetti**        | ^1.9.4   | Confetti animation effects for celebrations      |

### Backend & Database

| Technology          | Version  | Purpose                                          |
| ------------------- | -------- | ------------------------------------------------ |
| **Supabase Client** | ^2.106.1 | PostgreSQL database + authentication + real-time |
| **Supabase SSR**    | ^0.10.3  | Server-side rendering auth utilities             |
| **@google/genai**   | ^2.4.0   | Google Gemini AI API client                      |

### AI & Chatbot

| Technology        | Version  | Purpose                                     |
| ----------------- | -------- | ------------------------------------------- |
| **ai (Vercel)**   | ^6.0.198 | AI SDK for streaming chat and generative UI |
| **@ai-sdk/groq**  | ^3.0.39  | Groq AI provider for Llama 4 models         |
| **@ai-sdk/react** | ^3.0.200 | React hooks for AI SDK                      |

### Document Generation & Email

| Technology          | Version | Purpose                                                   |
| ------------------- | ------- | --------------------------------------------------------- |
| **jsPDF**           | ^4.2.1  | Client-side PDF generation for booking forms and invoices |
| **html2canvas-pro** | ^2.0.2  | HTML-to-canvas conversion for PDF content                 |
| **exceljs**         | ^4.4.0  | Excel file parsing and generation                         |
| **Resend**          | ^6.12.3 | Transactional email delivery API                          |

### Rich Text Editor

| Technology                       | Version | Purpose                             |
| -------------------------------- | ------- | ----------------------------------- |
| **@tiptap/react**                | ^3.24.0 | Headless rich text editor framework |
| **@tiptap/starter-kit**          | ^3.24.0 | Essential Tiptap extensions bundle  |
| **@tiptap/pm**                   | ^3.24.0 | ProseMirror core for Tiptap         |
| **@tiptap/extension-link**       | ^3.24.0 | Hyperlink support in editor         |
| **@tiptap/extension-image**      | ^3.24.0 | Image embedding in editor           |
| **@tiptap/extension-underline**  | ^3.24.0 | Underline text formatting           |
| **@tiptap/extension-color**      | ^3.24.0 | Text color customization            |
| **@tiptap/extension-highlight**  | ^3.24.0 | Text highlight/marker               |
| **@tiptap/extension-text-align** | ^3.24.0 | Text alignment controls             |
| **@tiptap/extension-text-style** | ^3.24.0 | Text style support                  |

### Maps

| Technology      | Version | Purpose                                  |
| --------------- | ------- | ---------------------------------------- |
| **maplibre-gl** | ^5.24.0 | Open-source map rendering (vector tiles) |

### Analytics

| Technology                 | Version | Purpose                                  |
| -------------------------- | ------- | ---------------------------------------- |
| **@vercel/analytics**      | ^2.0.1  | Vercel web analytics                     |
| **@vercel/speed-insights** | ^2.0.0  | Real User Monitoring for Core Web Vitals |

### Image Processing

| Technology       | Version | Purpose                             |
| ---------------- | ------- | ----------------------------------- |
| **heic-convert** | ^2.1.0  | HEIC to JPEG/PNG browser conversion |

### Validation

| Technology | Version | Purpose                            |
| ---------- | ------- | ---------------------------------- |
| **zod**    | ^4.4.3  | TypeScript-first schema validation |

### Development & Tooling

| Technology               | Version | Purpose                                                    |
| ------------------------ | ------- | ---------------------------------------------------------- |
| **ESLint**               | ^9.39.4 | Static code analysis with TypeScript/React/Next.js plugins |
| **Prettier**             | ^3.8.3  | Code formatter with Tailwind CSS class sorting             |
| **Husky**                | ^9.1.7  | Git hooks for pre-commit and commit-msg validation         |
| **lint-staged**          | ^17.0.5 | Runs linters only on staged git files                      |
| **Commitlint**           | ^21.0.1 | Conventional commits validation                            |
| **Vitest**               | ^4.1.7  | Unit/integration test runner with jsdom environment        |
| **Playwright**           | ^1.60.0 | End-to-end browser testing                                 |
| **tsx**                  | ^4.22.3 | TypeScript execution for Node.js scripts                   |
| **esbuild**              | ^0.28.0 | Fast JavaScript bundler for scripts                        |
| **dotenv**               | ^17.4.2 | Environment variable loading for scripts                   |
| **cross-env**            | ^10.1.0 | Cross-platform environment variable setting                |
| **editorconfig-checker** | ^6.1.1  | Check .editorconfig compliance                             |

---

## Architecture Overview

The application follows a **hybrid rendering architecture** leveraging Next.js App Router:

- **Server Components** are the default — data fetching and rendering happen on the server
- **Client Components** are explicitly marked with `"use client"` for interactive features (maps, animations, admin interaction)
- **API Routes** (`app/api/`) provide serverless endpoint handlers for auth, form submissions, AI chat, and database operations
- **Middleware** (`middleware.ts`) protects admin routes by verifying Supabase auth sessions and admin role
- **Static Generation** is used for marketing pages (About, Privacy Policy, Terms) for optimal performance
- **Dynamic Rendering** is used for admin pages and project listings requiring up-to-date data
- **Turbopack** is available for faster development builds (currently disabled via `cross-env NEXT_TURBOPACK=0`)

### Key Architectural Decisions

1. **Supabase as Backend-as-a-Service**: Authentication, database, real-time subscriptions, and file storage are handled by Supabase, eliminating the need for a custom backend server
2. **SSR Authentication with @supabase/ssr**: Cookie-based session management compatible with Next.js App Router's server components, enforced via middleware
3. **Component Separation**: Clean split between `src/components/common/` (reusable UI primitives), `src/components/admin/` (admin-specific), `src/components/lottery/` (lottery feature), `src/components/layout/` (navigation & footer), `src/components/home/` (landing page sections), and `src/components/admin/email/` (email marketing suite)
4. **Modular Data Layer**: `src/data/` contains `company_settings.json`, `email-templates.json`, and `faq` definitions; `src/lib/` houses utilities, API helpers, SEO metadata, blog data, lottery helpers, and Supabase client configuration
5. **Client-Side PDF Generation**: Booking forms, invoices, allotment letters, offer letters, BBAs, and payment receipts generated using jsPDF and html2canvas-pro to avoid server CPU overhead
6. **Centralized SEO**: `src/lib/seo.ts` provides `createMetadata()` helper with Open Graph, Twitter cards, canonical URLs, and robots configuration
7. **Centralized Blog**: `src/lib/blog.ts` defines typed blog posts with slug-based routing via `app/(main)/blog/[slug]`
8. **AI Chatbot**: Integrated via Vercel AI SDK with Groq (Llama 4) provider — streaming chat interface on the landing page
9. **Lottery System**: Full-featured lottery management with scheduled draws, participant management, and visibility toggling via `portal_settings` table
10. **Email Marketing**: Campaign management with Tiptap rich text editor, template system, domain management, and Resend-powered delivery

---

## Features

### Public-Facing Features

- **Landing Page & Navigation**: Hero section with animations, responsive sticky header with transparent-to-solid scroll transition, mobile hamburger menu, theme toggle (light/dark)
- **AI Chatbot**: Streaming AI assistant powered by Groq (Llama 4) via Vercel AI SDK — floating chat widget on the landing page
- **Project Showcase**: Current projects with progress status; completed projects with MapLibre GL interactive mapping showing project locations
- **Company Pages**: About Us, Leadership (team profiles), Careers (job listings), Blog (market insights and news with dynamic `[slug]` routing)
- **Client Engagement**: Contact form (Resend email API), Registration (Supabase auth), Client Login, Payment portal, FAQ (accordion UI with data-driven content), Grievance submission, Thank You confirmation
- **Lottery**: Feature-flagged lottery page togglable from admin settings via `portal_settings.lottery_page_visible`
- **Legal**: Privacy Policy, Terms & Conditions, GDPR-compliant Cookie Consent banner
- **UI/UX**: Scroll-triggered Motion animations, breadcrumbs, back-to-top button, WhatsApp chat button, hover zoom on images, animated stats counters, reading progress bar, error boundary fallback, loading skeletons

### Admin Portal Features

- **Dashboard**: KPIs, Recharts-powered analytics charts (User Growth, Attendance Status, Attendance Trend, Document Stats), quick action cards, activity timeline feed
- **User Management**: Admin session provider with persistent auth, user CRUD and role management (modals for create/edit/delete)
- **Attendance System**: Daily check-in/check-out, attendance dashboard, monthly reports, teams management with nested member assignment
- **Document Generation**: Dynamic PDFs for booking forms, invoices, allotment letters, offer letters, BBAs (Builder Buyer Agreements), payment plans, and payment receipts — all with PDF and image download options. Record-keeping pages for allotments, BBAs, offer letters, and payment receipts
- **Property Management**: CRUD for real estate properties with image management
- **Registration Management**: View, filter, and manage user registrations with advisor assignment
- **Email Management**: Compose with rich text editor, sent history with replies, templates, domains, campaigns (marketing), deleted messages, Resend usage dashboard, and email settings — powered by Resend
- **Lottery Management**: Admin-side lottery draw management with scheduling, participant upload, campaign editing, bulk email, and winner history
- **Notifications**: Real-time notification dropdown in admin header, create/read/dismiss workflow
- **Settings**: Configurable application parameters in database with tabbed interface — Profile, Company, Appearance, Notifications, Security, Email, Properties, Logs

---

## Project Structure

````
svi-infra/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Public website route group
│   │   ├── about/                #    /about
│   │   ├── blog/                 #    /blog + /[slug] dynamic posts
│   │   ├── careers/              #    /careers
│   │   ├── contact/              #    /contact
│   │   ├── faq/                  #    /faq
│   │   ├── grievance/            #    /grievance
│   │   ├── leadership/           #    /leadership
│   │   ├── login/                #    /login
│   │   ├── lottery/              #    /lottery (feature-flagged)
│   │   ├── payment/              #    /payment
│   │   ├── privacy-policy/       #    /privacy-policy
│   │   ├── projects/             #    /projects/completed + /projects/current
│   │   ├── registration/         #    /registration
│   │   ├── terms-conditions/     #    /terms
│   │   ├── thank-you/            #    /thank-you
│   │   ├── error.tsx             #    Custom error page
│   │   ├── layout.tsx            #    Public layout with Header/Footer
│   │   ├── loading.tsx           #    Suspense loading fallback
│   │   ├── not-found.tsx         #    Custom 404 page
│   │   ├── og.tsx                #    OG image component
│   │   └── page.tsx              #    Landing page
│   ├── admin/                    # Admin portal (authenticated via middleware)
│   │   ├── allotment-letter/     #    Allotment letter PDF generation
│   │   ├── allotment-records/    #    Allotment record management
│   │   ├── attendance/           #    Employee check-in/out + reports
│   │   ├── bba/                  #    Builder Buyer Agreement generation
│   │   ├── bba-records/          #    BBA record management
│   │   ├── dashboard/            #    Analytics & KPIs
│   │   ├── email/                #    Email management
│   │   ├── lottery/              #    Lottery draw management
│   │   ├── notifications/        #    Notification center
│   │   ├── offer-letter/         #    Offer letter PDF generation
│   │   ├── offer-letter-records/ #    Offer letter record management
│   │   ├── payment-plan/         #    Payment plan PDF generation
│   │   ├── payment-receipt/      #    Payment receipt PDF generation
│   │   ├── payment-receipts/     #    Payment receipt records
│   │   ├── properties/           #    Property CRUD
│   │   ├── registrations/        #    User registration management
│   │   ├── settings/             #    System configuration (tabs)
│   │   ├── layout.tsx            #    Admin layout with sidebar
│   │   └── page.tsx              #    Admin root (login page)
│   ├── api/                      # API route handlers
│   │   ├── admin/                #    Admin-only API routes
│   │   │   ├── activities/       #        Activity log CRUD
│   │   │   ├── analytics/        #        Analytics data
│   │   │   ├── attendance/       #        Attendance management
│   │   │   ├── bba/              #        BBA record management
│   │   │   ├── campaigns/        #        Email campaign management
│   │   │   ├── documents/        #        Document management + [id]
│   │   │   ├── email/            #        Email sending
│   │   │   ├── lottery/          #        Lottery draw management
│   │   │   ├── notifications/    #        Notification CRUD + [id]
│   │   │   ├── properties/       #        Property CRUD
│   │   │   ├── registrations/    #        Registration management
│   │   │   ├── settings/         #        Portal settings
│   │   │   └── users/            #        User management + [id]
│   │   ├── chat/                 #    AI chatbot streaming endpoint
│   │   ├── contact/              #    Contact form submission
│   │   ├── cron/                 #    Scheduled task endpoints
│   │   ├── grievance/            #    Grievance submission
│   │   ├── lottery/              #    Public lottery API

---

## Getting Started

### Prerequisites

- **Node.js** — Latest LTS (v20 or v22 recommended)
- **npm** — Ships with Node.js
- **Supabase** — Free account for database and authentication
- **Groq** — Free API key for AI chatbot (https://console.groq.com)
- **Google Cloud Platform** — Account for Gemini AI API (optional)
- **Resend** — Account for transactional email
- **Vercel** — Free account for deployment (optional)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Xenonesis/svi-new.git
   cd svi-new
````

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your keys.

4. **Initialize the database:**

   Create a Supabase project and run migrations in order:
   1. `migration.sql` — core schema
   2. `forms-migration.sql` — form submissions tables
   3. `attendance-migration.sql` — attendance tracking tables
   4. `notifications-setup.sql` — notifications system
   5. `performance-indexes.sql` — database indexes
   6. `campaigns-migration.sql` — email campaigns tables
   7. `scheduled-draw-migration.sql` — lottery scheduled draw tables
   8. Files in `supabase/migrations/` in timestamp order

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

---

## Routing & Pages

### Public Routes

| Route                 | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `/`                   | Landing page with hero, featured projects, AI chatbot |
| `/about`              | Company history, mission, vision, values              |
| `/blog`               | Market insights and company news                      |
| `/blog/[slug]`        | Dynamic blog post pages                               |
| `/careers`            | Job openings and career applications                  |
| `/contact`            | Inquiry form → Resend email API                       |
| `/faq`                | FAQs with accordion UI, data-driven content           |
| `/grievance`          | Complaint submission with tracking                    |
| `/leadership`         | Management team profiles                              |
| `/login`              | Client authentication portal                          |
| `/lottery`            | Lottery page (feature-flagged via portal settings)    |
| `/payment`            | Online payment portal                                 |
| `/privacy-policy`     | Data protection documentation                         |
| `/projects/completed` | Delivered projects with MapLibre GL interactive maps  |
| `/projects/current`   | Ongoing developments                                  |
| `/registration`       | New user registration (Supabase auth)                 |
| `/terms-conditions`   | Terms of service                                      |
| `/thank-you`          | Post-submission confirmation                          |

### Admin Routes

All admin routes protected by middleware (Supabase auth + admin role check):

| Route                         | Description                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `/admin`                      | Admin login page                                                             |
| `/admin/dashboard`            | Analytics, KPIs, activity timeline                                           |
| `/admin/attendance`           | Check-in/out, reports, team management                                       |
| `/admin/allotment-letter`     | Allotment letter PDF generation                                              |
| `/admin/allotment-records`    | Allotment record management                                                  |
| `/admin/bba`                  | Builder Buyer Agreement PDF generation                                       |
| `/admin/bba-records`          | BBA record management                                                        |
| `/admin/email`                | Email compose, sent, templates, domains, campaigns, deleted, replies         |
| `/admin/lottery`              | Lottery draw management, scheduling, participants                            |
| `/admin/notifications`        | Notification center                                                          |
| `/admin/offer-letter`         | Offer letter PDF generation                                                  |
| `/admin/offer-letter-records` | Offer letter record management                                               |
| `/admin/payment-plan`         | Payment plan PDF generation                                                  |
| `/admin/payment-receipt`      | Payment receipt PDF generation                                               |
| `/admin/payment-receipts`     | Payment receipt record management                                            |
| `/admin/properties`           | Property CRUD management                                                     |
| `/admin/registrations`        | User registration management with filtering                                  |
| `/admin/settings`             | System configuration (profile, company, appearance, notifications, security) |

### API Routes

#### Public API Routes

| Route                 | Method | Description              |
| --------------------- | ------ | ------------------------ |
| `/api/chat`           | POST   | AI chatbot streaming     |
| `/api/contact`        | POST   | Contact form submission  |
| `/api/cron`           | POST   | Scheduled task execution |
| `/api/grievance`      | POST   | Grievance submission     |
| `/api/lottery`        | GET    | Public lottery data      |
| `/api/project-images` | GET    | Project image serving    |
| `/api/properties`     | GET    | Public property listings |
| `/api/registration`   | POST   | User registration        |
| `/api/webhooks`       | POST   | External webhooks        |

#### Admin API Routes

| Route                                               | Description                        |
| --------------------------------------------------- | ---------------------------------- |
| `/api/admin/activities`                             | Activity log CRUD                  |
| `/api/admin/analytics`                              | Analytics data endpoints           |
| `/api/admin/attendance/records`                     | Attendance record management       |
| `/api/admin/attendance/analytics`                   | Attendance analytics               |
| `/api/admin/attendance/report`                      | Attendance report generation       |
| `/api/admin/attendance/teams`                       | Team CRUD                          |
| `/api/admin/attendance/teams/[id]`                  | Individual team management         |
| `/api/admin/attendance/teams/[id]/members`          | Team member management             |
| `/api/admin/attendance/teams/[id]/members/[userId]` | Individual member management       |
| `/api/admin/bba`                                    | BBA record management              |
| `/api/admin/campaigns`                              | Email campaign management          |
| `/api/admin/documents`                              | Document list/create               |
| `/api/admin/documents/[id]`                         | Individual document CRUD           |
| `/api/admin/email`                                  | Email sending                      |
| `/api/admin/lottery`                                | Lottery draw management            |
| `/api/admin/notifications`                          | Notification CRUD                  |
| `/api/admin/notifications/[id]`                     | Individual notification management |
| `/api/admin/properties`                             | Property CRUD                      |
| `/api/admin/registrations`                          | Registration management            |
| `/api/admin/settings`                               | Portal settings CRUD               |
| `/api/admin/users`                                  | User list/create                   |
| `/api/admin/users/[id]`                             | Individual user CRUD               |

---

## Environment Variables

```env
# ── Gemini AI ───────────────────────────────────────────────────────
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# ── Application ─────────────────────────────────────────────────────
APP_URL="http://localhost:3000"
NEXT_PUBLIC_ANALYTICS_ID=""

# ── Supabase ────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# ── hCaptcha ────────────────────────────────────────────────────────
# Use test key for local development
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="10000000-ffff-ffff-ffff-000000000001"

# ── AI Chatbot ──────────────────────────────────────────────────────
GROQ_API_KEY="gsk_your_groq_api_key_here"

# ── Resend (Email) ──────────────────────────────────────────────────
RESEND_API_KEY="re_your_resend_api_key"
ADMIN_EMAIL="admin@yourdomain.com"
```

---

## Available Scripts

| Script         | Command                                           | Description                           |
| -------------- | ------------------------------------------------- | ------------------------------------- |
| `dev`          | `cross-env NEXT_TURBOPACK=0 next dev --port 3000` | Development server with HMR           |
| `build`        | `next build`                                      | Production build                      |
| `start`        | `next start`                                      | Start production server               |
| `test`         | `vitest run`                                      | Run all tests                         |
| `test:watch`   | `vitest`                                          | Watch mode                            |
| `lint`         | `eslint . --ext .ts,.tsx,.js,.jsx`                | Code quality check                    |
| `lint:fix`     | `eslint . --ext .ts,.tsx,.js,.jsx --fix`          | Auto-fix lint issues                  |
| `format`       | `prettier --write .`                              | Format all files                      |
| `format:check` | `prettier --check .`                              | Verify formatting                     |
| `editorconfig` | `editorconfig-checker`                            | Check .editorconfig compliance        |
| `prepare`      | `husky`                                           | Init git hooks (auto-runs on install) |
| `clean`        | `rm -rf .next`                                    | Remove build artifacts                |

---

## Component Architecture

### Provider Hierarchy (in `ClientProviders.tsx`)

```
ThemeProvider          — Light/dark mode context
  └─ Children          — Page content (Vercel Analytics/Speed Insights)
```

Admin layout adds **AdminSessionProvider** for Supabase auth context.

### Common Components (`src/components/common/`)

| Component         | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `Analytics`       | Vercel Analytics and Speed Insights                           |
| `AnimatedSection` | Scroll-triggered fade/slide animations via Motion `useInView` |
| `BackToTop`       | Floating scroll-to-top button                                 |
| `Breadcrumbs`     | Auto-generated breadcrumb trail from URL path                 |
| `CookieConsent`   | GDPR-compliant consent banner with localStorage               |
| `ErrorBoundary`   | React error boundary with fallback UI                         |
| `FAQSection`      | Reusable FAQ accordion section                                |
| `HoverZoomImage`  | Image with CSS transform zoom on hover                        |
| `ReadingProgress` | Scroll-based reading progress indicator bar                   |
| `ScrollToTop`     | Auto-scroll to top on route change                            |
| `social-icons`    | Social media icon set                                         |
| `StatsCounter`    | Animated counter that counts up on scroll                     |

### Admin Components (`src/components/admin/`)

| Component              | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `AdminHeader`          | Top nav + notification dropdown                                                     |
| `AdminSidebar`         | Collapsible sidebar navigation                                                      |
| `AdminSessionProvider` | Auth context for admin routes                                                       |
| `ActivityTimeline`     | Chronological activity feed                                                         |
| `NotificationDropdown` | Read/unread notification panel                                                      |
| `QuickActions`         | Dashboard shortcut cards                                                            |
| `attendance/`          | Attendance dashboard, report, mark attendance, teams manager                        |
| `ChartComponents/`     | User growth, attendance status/trend, document stats charts                         |
| `DocumentGenerator/`   | BBA/OfferLetter preview content, shared download options                            |
| `email/`               | Full email suite: compose, campaigns, templates, domains, rich text editor          |
| `helpers/`             | Badge, property interest tags, property labels                                      |
| `lottery/`             | Dashboard panel, history table, schedule draw panel, hooks, modals, wizard          |
| `modals/`              | Advisor settings, create user, delete confirm, edit user                            |
| `OfferLetter/`         | Sales compensation section, slab selector                                           |
| `registrations/`       | Registration table, filters, detail modals, status badges, hooks                    |
| `settings/`            | Profile, Company, Appearance, Notifications, Security, Email, Logs, Properties tabs |
| `Shared/`              | Modal component                                                                     |

### Home Page Components (`src/components/home/`)

| Component         | Description                       |
| ----------------- | --------------------------------- |
| `HeroSection`     | Landing page hero with animations |
| `AboutSection`    | Company overview section          |
| `FeaturesSection` | Key features highlight            |
| `ProjectsSection` | Featured projects showcase        |
| `CTASection`      | Call-to-action section            |
| `ChatBot`         | AI-powered floating chat widget   |
| `HomeFAQ`         | Frequently asked questions        |
| `HomeSections`    | Section composition orchestrator  |

### Lottery Components (`src/components/lottery/`)

| Component              | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `LotteryClientSection` | Client-side lottery interaction                             |
| `LotteryCTA`           | Call-to-action for lottery                                  |
| `LotteryDrawSection`   | Lottery draw display                                        |
| `sections/`            | CountdownBanner, DrawArenaModal, HallOfFame, WinnerCarousel |
| `hooks/`               | `useLotteryDraw` hook                                       |

### Data & Configuration (`src/data/`)

- `company_settings.json` — Company details (name, address, GST, RERA, bank info)
- `email-templates.json` — Email template definitions
- `faq/general.ts` — FAQ content data

### Library Utilities (`src/lib/`)

- `seo.ts` — `createMetadata()` helper for Open Graph, Twitter card, canonical, robots metadata
- `blog.ts` — Typed `BlogPost[]` array with `BLOG_POST_MAP` for slug-based lookup
- `api/` — `rateLimit.ts`, Zod `schemas.ts`, `withAdminAuth.ts`
- `hooks/useLotteryVisibility.ts` — Feature-flag hook for lottery page
- `hooks/useMounted.ts` — Hydration-safe mount detection
- `lottery/campaignHelpers.ts` — Campaign helper utilities
- `utils/documentExporter.ts` — PDF/image export utilities
- `utils/templateParser.ts` — Template string parser
- `bba/` — BBA-related helper utilities
- `email-templates.ts` — Email template rendering
- `nearby-places.ts` — Nearby places data for maps

---

## State Management & Providers

### ThemeProvider

- Provides `ThemeContext` with `theme` (light/dark) and `setTheme`
- Persists to `localStorage` under key `svi-theme`
- Falls back to OS `prefers-color-scheme`
- Initializes via `public/theme-init.js` to prevent flash

### AdminSessionProvider

- Wraps all admin routes with Supabase auth context
- Maintains persistent admin session across page navigations

### Middleware Auth (`middleware.ts`)

- Protects all `/admin/:path*` routes (except root `/admin` login page)
- Verifies Supabase auth cookie session server-side
- Checks `profiles` table for `role = 'admin'`

### ClientProviders

Composes ThemeProvider + Vercel Analytics + Speed Insights in `app/layout.tsx`.

---

## Animations & UI Effects

| Element          | Animation                                                |
| ---------------- | -------------------------------------------------------- |
| Hero section     | Fade-in with scale entrance on load                      |
| Scroll reveal    | Elements fade upward via `AnimatedSection` + `useInView` |
| Stats counter    | Values count up with spring physics                      |
| Navigation hover | Gold underline slides in from left                       |
| Header scroll    | Transparent → solid with backdrop blur                   |
| Theme toggle     | Smooth light/dark transition                             |
| FAQ accordion    | Smooth height and opacity on expand/collapse             |
| Project cards    | Lift effect with shadow on hover                         |
| Reading progress | Scroll-position indicator bar at top of page             |

---

## Database Migrations

| File / Migration                                               | Purpose                             |
| -------------------------------------------------------------- | ----------------------------------- |
| `migration.sql`                                                | Core schema (users, projects, auth) |
| `forms-migration.sql`                                          | Form submissions tables             |
| `attendance-migration.sql`                                     | Attendance tracking tables          |
| `notifications-setup.sql`                                      | Notifications system                |
| `performance-indexes.sql`                                      | Database performance indexes        |
| `campaigns-migration.sql`                                      | Email campaigns tables              |
| `scheduled-draw-migration.sql`                                 | Lottery scheduled draw tables       |
| `migrations/20260520120000_forms_tables.sql`                   | Forms tables                        |
| `migrations/20260520130000_attendance_tables.sql`              | Attendance tables                   |
| `migrations/20260520140000_activity_logs_check_constraint.sql` | Activity logs constraint            |
| `migrations/20260520150000_fix_notifications_trigger.sql`      | Notifications trigger fix           |
| `migrations/20260522130000_create_portal_settings.sql`         | Portal settings table               |
| `migrations/20260528150000_create_lotteries_table.sql`         | Lottery system tables               |
| `migrations/20260528180000_lottery_visibility_policy.sql`      | Lottery visibility RLS policy       |
| `migrations/20260602100001_create_email_stars_table.sql`       | Email star/favorite system          |
| `migrations/20260602100002_create_email_inbox_table.sql`       | Email inbox/threading system        |
| `migrations/20260602100003_create_email_deletions_table.sql`   | Email deletion tracking             |
| `migrations/20260602100004_add_email_data_to_deletions.sql`    | Email data additions to deletions   |

---

## Testing Strategy

- **Vitest** with **jsdom** for DOM simulation
- **Playwright** for end-to-end browser testing
- **API Tests**: `__tests__/api/admin/` — analytics, attendance, documents, teams, users, admin verification
- **Utility Tests**: `__tests__/utils/templateParser.test.ts`
- **BBA Tests**: `__tests__/bba/`
- **Integration Tests**: `__tests__/api/registration.test.ts`

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

---

## Development Workflow

### Code Quality Gates

The pipeline enforces quality through **Husky git hooks**:

- **pre-commit**: `lint-staged` runs ESLint + Prettier on staged files
- **commit-msg**: Validates conventional commits format

### Commit Convention

All commits must follow **Conventional Commits**: `<type>(<scope>): <description>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**: `feat(admin): add attendance check-in/out UI`, `fix(header): resolve mobile menu overflow on iOS`

### Lint-Staged Configuration

| File Pattern                        | Checks                       |
| ----------------------------------- | ---------------------------- |
| `*.ts`, `*.tsx`, `*.js`, `*.jsx`    | ESLint fix + Prettier format |
| `*.json`, `*.md`, `*.yml`, `*.yaml` | Prettier format              |

### ESLint & Prettier

Flat config (`eslint.config.js`) includes TypeScript ESLint (type-aware), React plugin, React Hooks plugin, Next.js plugin, and Prettier integration. Semicolons enabled, single quotes, ES5 trailing commas, 2-space tabs, Tailwind CSS class sorting via `prettier-plugin-tailwindcss`.

---

## Next.js Configuration

`next.config.ts` includes:

- **React Strict Mode** enabled
- **Compression** enabled
- **Turbopack** available (currently disabled at runtime)
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation disabled)
- **Image Optimization**: Remote patterns for Google Maps domains (legacy), WebP/AVIF formats, responsive device sizes, 75/85 quality tiers, 30-day minimum cache TTL

---

## Deployment

### Vercel Deployment

1. Push code to GitHub/GitLab/Bitbucket
2. Import repo into Vercel
3. Set environment variables in Project Settings
4. Deploy — Vercel auto-builds on each push

**`vercel.json`:**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Alternative Platforms

AWS (Amplify or ECS/Fargate), Google Cloud Run (with Dockerfile), Azure Static Web Apps, or any dedicated server running `npm run start`.

---

## Third-Party Integrations

- **Google Gemini AI** (`@google/genai`): AI-powered content generation — server-side only
- **Groq AI** (`@ai-sdk/groq`): Streaming AI chatbot using Llama 4 via Vercel AI SDK
- **MapLibre GL** (`maplibre-gl`): Open-source interactive project location maps — no API key required
- **hCaptcha**: Form spam protection on contact and registration forms
- **Resend**: Transactional email, marketing campaigns, domain management
- **TipTap** (`@tiptap/react`): Rich text editor for email composition
- **Vercel Analytics**: Privacy-friendly page view and visitor tracking
- **Vercel Speed Insights**: Real-user Core Web Vitals (LCP, FID/INP, CLS)
- **Supabase Realtime**: WebSocket-based live updates for notifications and activity feeds
- **ExcelJS** (`exceljs`): Excel file parsing and generation for data export
- **Sonner** (`sonner`): Toast notifications for user feedback
- **canvas-confetti**: Confetti animation effects for celebrations
- **Zod** (`zod`): Schema validation for API request/response payloads

---

## Data Layer

### Supabase Integration

- **Authentication**: Email/password with `@supabase/ssr` — cookie-based sessions
- **PostgreSQL Database**: Schema via migration files — core, attendance, forms, notifications, portal settings, lottery, email campaigns, email inbox, performance indexes
- **Client Architecture**: `client.ts`, `admin.ts`, `create-admin.ts`, `verifyAdmin.ts`, `notifications.ts`, `types.ts`

---

## Performance & SEO

### Performance

- Server Components by default minimize client-side JavaScript
- Next.js `<Image>` with automatic WebP/AVIF, lazy loading, responsive sizing
- Route segment caching for instant page loads
- Code splitting at the route level
- Strategic PostgreSQL indexes from `performance-indexes.sql`
- 30-day image cache TTL
- Streaming AI chat responses (no blocking)

### SEO

- Centralized `createMetadata()` utility in `src/lib/seo.ts`
- Dynamic metadata (`generateMetadata()`) per page
- Dynamic Open Graph image generation (`opengraph-image.tsx`)
- XML sitemap (`app/sitemap.ts`) covering all public routes
- Dynamic `robots.ts` with Googlebot and AI crawler directives
- Canonical URLs on all pages
- Twitter card metadata (`summary_large_image`)
- Semantic HTML with proper heading hierarchy and ARIA attributes
- WCAG AA color contrast and visible focus states
- JSON-LD structured data for rich search results

---

## Troubleshooting

| Issue                      | Solution                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Dev server won't start     | Check Node.js v18+, delete `node_modules` and reinstall, run `npm run clean`        |
| Supabase connection errors | Verify `.env.local` keys, ensure Supabase project is active, check IP restrictions  |
| Auth not working           | Run all migrations, enable email/password auth in Supabase, configure site URL      |
| MapLibre not rendering     | Verify map tiles are accessible, check browser console for CORS errors              |
| AI Chatbot not responding  | Verify `GROQ_API_KEY` is set correctly in `.env.local`                              |
| Emails not sending         | Verify Resend API key, check delivery dashboard, verify sender domain               |
| Lottery page not visible   | Check `portal_settings` table for `lottery_page_visible` key set to `true`          |
| Build failures             | Run `npm run clean`, check TypeScript (`npx tsc --noEmit`), ensure env vars are set |
| Admin routes redirect loop | Clear cookies, check middleware config, verify admin role in database               |

---

## Contributing

1. Fork the repo and branch from `main`: `git checkout -b feat/your-feature-name`
2. Make changes following code quality standards
3. Run tests: `npm test && npm run lint && npm run format:check`
4. Commit using conventional commits: `git commit -m "feat(scope): description"`
5. Push and open a Pull Request

### Code Style Guidelines

- Use TypeScript strict mode with explicit types
- Prefer server components unless interactivity requires client components
- Use `@/` path alias for imports (e.g., `@/src/components/common/BackToTop`)
- Place reusable components in `src/components/common/`, feature components co-located with routes
- Use `createMetadata()` from `@/src/lib/seo.ts` for page metadata
- Use `tailwind-merge` and `clsx` for conditional class composition
- Follow Prettier's auto-sorted Tailwind class order
- Write tests for new features; update tests when modifying logic
- Always run migrations in timestamp order when adding new database tables

---

## License

**Private** — All rights reserved by SVI Infra Solutions Pvt. Ltd.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without prior written permission.

---

_© 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved._
