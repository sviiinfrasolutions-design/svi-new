# SVI Infra Solutions — Next.js Web Application

**SVI Infra Solutions Pvt. Ltd.** is a premium real estate development platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This application serves as a full-featured corporate website and administrative portal for managing real estate projects, client relationships, employee attendance, document generation, and more.

The platform combines a modern, responsive public-facing website with a comprehensive admin dashboard, featuring Supabase-powered authentication and database services, AI integration via Google Gemini API, interactive mapping with Google Maps, real-time analytics, and a robust PDF document generation system.

---

## Tech Stack

### Core Framework & Language

| Technology     | Version | Purpose                                       |
| -------------- | ------- | --------------------------------------------- |
| **Next.js**    | ^16.2.6 | React framework with App Router, SSR, and SSG |
| **React**      | ^19.0.1 | UI component library                          |
| **TypeScript** | ~5.8.2  | Type-safe JavaScript                          |

### Styling & UI

| Technology                 | Version  | Purpose                                          |
| -------------------------- | -------- | ------------------------------------------------ |
| **Tailwind CSS**           | ^4.1.14  | Utility-first CSS framework                      |
| **Tailwind Merge**         | ^3.6.0   | Intelligent Tailwind class merging               |
| **clsx**                   | ^2.1.1   | Conditional className utility                    |
| **Motion (Framer Motion)** | ^12.39.0 | Declarative animations for React                 |
| **Lucide React**           | ^1.16.0  | Open-source icon set                             |
| **Recharts**               | ^3.8.1   | Composable charting library for admin dashboards |

### Backend & Database

| Technology          | Version  | Purpose                                       |
| ------------------- | -------- | --------------------------------------------- |
| **Supabase Client** | ^2.106.1 | PostgreSQL database + real-time subscriptions |
| **Supabase SSR**    | ^0.10.3  | Server-side rendering auth utilities          |
| **@google/genai**   | ^2.4.0   | Google Gemini AI API client                   |

### Document Generation & Email

| Technology          | Version | Purpose                                                   |
| ------------------- | ------- | --------------------------------------------------------- |
| **jsPDF**           | ^4.2.1  | Client-side PDF generation for booking forms and invoices |
| **html2canvas-pro** | ^2.0.2  | HTML-to-canvas conversion for PDF content                 |
| **xlsx**            | ^0.18.5 | Excel file parsing and generation                         |
| **Resend**          | ^6.12.3 | Transactional email delivery API                          |

### Security & Forms

| Technology                   | Version | Purpose                                       |
| ---------------------------- | ------- | --------------------------------------------- |
| **@hcaptcha/react-hcaptcha** | ^2.0.2  | hCaptcha integration for form spam protection |

### Maps & Analytics

| Technology                    | Version | Purpose                                      |
| ----------------------------- | ------- | -------------------------------------------- |
| **@vis.gl/react-google-maps** | ^1.8.3  | React wrapper for Google Maps JavaScript API |
| **@vercel/analytics**         | ^2.0.1  | Vercel web analytics                         |
| **@vercel/speed-insights**    | ^2.0.0  | Real User Monitoring for Core Web Vitals     |

### Image Processing

| Technology       | Version | Purpose                             |
| ---------------- | ------- | ----------------------------------- |
| **heic-convert** | ^2.1.0  | HEIC to JPEG/PNG browser conversion |

### Development & Tooling

| Technology      | Version | Purpose                                                    |
| --------------- | ------- | ---------------------------------------------------------- |
| **ESLint**      | ^9.39.4 | Static code analysis with TypeScript/React/Next.js plugins |
| **Prettier**    | ^3.8.3  | Code formatter with Tailwind CSS class sorting             |
| **Husky**       | ^9.1.7  | Git hooks for pre-commit and commit-msg validation         |
| **lint-staged** | ^17.0.5 | Runs linters only on staged git files                      |
| **Commitlint**  | ^21.0.1 | Conventional commits validation                            |
| **Vitest**      | ^4.1.7  | Unit/integration test runner with jsdom environment        |
| **tsx**         | ^4.22.3 | TypeScript execution for Node.js scripts                   |
| **esbuild**     | ^0.28.0 | Fast JavaScript bundler for scripts                        |
| **dotenv**      | ^17.4.2 | Environment variable loading for scripts                   |

---

## Architecture Overview

The application follows a **hybrid rendering architecture** leveraging Next.js App Router:

- **Server Components** are the default — data fetching and rendering happen on the server
- **Client Components** are explicitly marked with `"use client"` for interactive features (maps, animations, admin interaction)
- **API Routes** (`app/api/`) provide serverless endpoint handlers for auth, form submissions, and database operations
- **Static Generation** is used for marketing pages (About, Privacy Policy, Terms) for optimal performance
- **Dynamic Rendering** is used for admin pages and project listings requiring up-to-date data
- **Turbopack** is enabled for faster development builds

### Key Architectural Decisions

1. **Supabase as Backend-as-a-Service**: Authentication, database, real-time subscriptions, and file storage are handled by Supabase, eliminating the need for a custom backend server
2. **SSR Authentication with @supabase/ssr**: Cookie-based session management compatible with Next.js App Router's server components
3. **Component Separation**: Clean split between `src/components/common/` (reusable UI primitives), `src/components/admin/` (admin-specific), `src/components/lottery/` (lottery feature), and `src/components/main/` (public page components)
4. **Modular Data Layer**: `src/data/` contains `company_settings.json`; `src/lib/` houses utilities, SEO helpers, blog data, and Supabase client configuration
5. **Client-Side PDF Generation**: Booking forms, invoices, allotment letters, offer letters, BBAs, and payment receipts generated using jsPDF and html2canvas-pro to avoid server CPU overhead
6. **Centralized SEO**: `src/lib/seo.ts` provides `createMetadata()` helper with Open Graph, Twitter cards, canonical URLs, and robots configuration
7. **Centralized Blog**: `src/lib/blog.ts` defines typed blog posts with slug-based routing via `app/(main)/blog/[slug]`
8. **Lottery System**: Feature-flagged lottery functionality controlled via `portal_settings` table with `useLotteryVisibility` hook

---

## Features

### Public-Facing Features

- **Landing Page & Navigation**: Hero section with animations, responsive sticky header with transparent-to-solid scroll transition, mobile hamburger menu, theme toggle (light/dark)
- **Project Showcase**: Current projects with progress status; completed projects with Google Maps integration showing project locations
- **Company Pages**: About Us, Leadership (team profiles), Careers (job listings), Blog (market insights and news with dynamic `[slug]` routing)
- **Client Engagement**: Contact form (Resend email API with hCaptcha protection), Registration (Supabase auth), Client Login, Payment portal, FAQ (accordion UI), Grievance submission, Thank You confirmation
- **Lottery**: Feature-flagged lottery page togglable from admin settings via `portal_settings.lottery_page_visible`
- **Notifications**: Public notification viewing page for registered users
- **Legal**: Privacy Policy, Terms & Conditions, GDPR-compliant Cookie Consent banner
- **UI/UX**: Scroll-triggered Motion animations, breadcrumbs, back-to-top button, WhatsApp chat button, hover zoom on images, animated stats counters, error boundary fallback

### Admin Portal Features

- **Dashboard**: KPIs, Recharts-powered analytics charts (User Growth, Attendance Status, Attendance Trend, Document Stats), quick action cards, activity timeline feed
- **User Management**: Admin session provider with persistent auth, user CRUD and role management
- **Attendance System**: Daily check-in/check-out, attendance dashboard, monthly reports, teams management with nested member assignment, database migration support
- **Document Generation**: Dynamic PDFs for booking forms, invoices, allotment letters, offer letters, BBAs (Builder Buyer Agreements), payment plans, and payment receipts — all with PDF and image download options
- **Email Management**: Compose, sent history, templates, domains, and email settings — powered by Resend
- **Lottery Management**: Admin-side lottery draw management and configuration
- **Notifications**: Real-time notification dropdown in admin header, create/read/dismiss workflow
- **Settings**: Configurable application parameters in database with tabbed interface — Profile, Company, Appearance, Notifications, Security
- **Data Management**: Form submission management, project CRUD, blog article publishing

---

## Project Structure

```
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
│   │   ├── notifications/        #    /notifications
│   │   ├── payment/              #    /payment
│   │   ├── privacy-policy/       #    /privacy-policy
│   │   ├── projects/completed/   #    Completed projects + Google Maps
│   │   ├── projects/current/     #    Ongoing projects
│   │   ├── registration/         #    /registration
│   │   ├── terms-conditions/     #    /terms
│   │   ├── thank-you/            #    /thank-you
│   │   ├── layout.tsx            #    Public layout with Header/Footer
│   │   ├── not-found.tsx         #    Custom 404 page
│   │   ├── og.tsx                #    OG image component
│   │   └── page.tsx              #    Landing page
│   ├── admin/                    # Admin portal (authenticated)
│   │   ├── allotment-letter/     #    Allotment letter PDF generation
│   │   ├── attendance/           #    Employee check-in/out + reports
│   │   ├── bba/                  #    Builder Buyer Agreement generation
│   │   ├── dashboard/            #    Analytics & KPIs
│   │   ├── email/                #    Email management (compose/templates/domains)
│   │   ├── lottery/              #    Lottery draw management
│   │   ├── notifications/        #    Notification center
│   │   ├── offer-letter/         #    Offer letter PDF generation
│   │   ├── payment-plan/         #    Payment plan PDF generation
│   │   ├── payment-receipt/      #    Payment receipt PDF generation
│   │   ├── settings/             #    System configuration (tabs)
│   │   ├── layout.tsx            #    Admin layout with sidebar
│   │   └── page.tsx              #    Admin root redirect
│   ├── api/                      # API route handlers
│   │   ├── admin/                #    Admin-only API routes
│   │   │   ├── activities/       #        Activity log CRUD
│   │   │   ├── analytics/        #        Analytics data
│   │   │   ├── attendance/       #        Attendance records, analytics, reports, teams
│   │   │   ├── documents/        #        Document management + [id]
│   │   │   ├── email/            #        Email sending
│   │   │   ├── notifications/    #        Notification CRUD + [id]
│   │   │   ├── settings/         #        Portal settings
│   │   │   └── users/            #        User management + [id]
│   │   ├── contact/              #    Contact form submission
│   │   ├── grievance/            #    Grievance submission
│   │   ├── project-images/       #    Project image serving
│   │   └── registration/         #    User registration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── opengraph-image.tsx       # Dynamic OG image generation
│   ├── page.tsx                  # Home page
│   ├── robots.ts                 # Dynamic robots.txt
│   └── sitemap.ts                # Dynamic XML sitemap
├── public/                       # Static assets
│   ├── favicons/                 # Favicon variants
│   ├── icons/                    # App icons
│   ├── images/                   # Image assets (hero, blog, projects, leadership)
│   ├── screenshots/              # App screenshots
│   ├── Shayam angan/             # Shayam Angan project assets
│   ├── Shivani Vatika/           # Shivani Vatika project assets
│   ├── logo.png
│   ├── manifest.json             # PWA manifest
│   ├── signature.png             # Company signature image
│   └── theme-init.js             # Theme init script (prevents flash)
├── src/                          # Source code
│   ├── components/
│   │   ├── admin/                # Admin portal components
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSessionProvider.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── NotificationDropdown.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── attendance/       #    AttendanceDashboard, AttendanceReport, MarkAttendance, TeamsManager
│   │   │   ├── ChartComponents/  #    AttendanceStatusChart, AttendanceTrendChart, DocumentStatsChart, UserGrowthChart
│   │   │   ├── dashboard/        #    Dashboard-specific components
│   │   │   ├── DocumentGenerator/ #   Shared download options (PDF + image)
│   │   │   ├── documents/        #    Document-specific components
│   │   │   ├── email/            #    ComposeTab, SentTab, TemplatesTab, DomainsTab, SettingsTab, helpers, types, constants
│   │   │   ├── notifications/    #    Notification-specific components
│   │   │   └── settings/         #    ProfileTab, CompanyTab, AppearanceTab, NotificationsTab, SecurityTab, helpers
│   │   ├── common/               # Reusable components
│   │   │   ├── Analytics.tsx
│   │   │   ├── AnimatedSection.tsx
│   │   │   ├── BackToTop.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── HoverZoomImage.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── social-icons.tsx
│   │   │   ├── StatsCounter.tsx
│   │   │   └── WhatsAppChat.tsx
│   │   ├── lottery/              # Lottery feature components
│   │   │   ├── LotteryClientSection.tsx
│   │   │   ├── LotteryCTA.tsx
│   │   │   └── LotteryDrawSection.tsx
│   │   ├── main/                 # Public page components
│   │   ├── ui/                   # Shared UI primitives
│   │   ├── ClientProviders.tsx    # Provider composition
│   │   ├── CompletedProjectsMap.tsx # Google Maps component
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ThemeProvider.tsx
│   ├── data/                     # Configuration data
│   │   └── company_settings.json #    Company details (name, address, GST, RERA, bank info)
│   ├── lib/                      # Utilities & services
│   │   ├── hooks/                #    React hooks
│   │   │   └── useLotteryVisibility.ts # Feature-flag hook for lottery page
│   │   ├── supabase/             #    Supabase client config & utilities
│   │   │   ├── admin.ts          #        Service role client
│   │   │   ├── client.ts         #        Browser client
│   │   │   ├── create-admin.ts   #        Admin client factory
│   │   │   ├── notifications.ts  #        Notification helpers
│   │   │   ├── types.ts          #        Database types
│   │   │   └── verifyAdmin.ts    #        Admin verification utility
│   │   ├── blog.ts               #    Blog post data with slug-based routing
│   │   └── seo.ts                #    SEO metadata helper (createMetadata)
│   └── index.css
├── supabase/                     # Database schema
│   ├── migrations/               # Timestamped migration files
│   ├── attendance-migration.sql
│   ├── forms-migration.sql
│   ├── migration.sql
│   ├── notifications-setup.sql
│   └── performance-indexes.sql
├── scripts/                      # Automation scripts
│   ├── convert-heic.js           #    HEIC image conversion
│   ├── create-is-admin-function.sql
│   ├── generate-icons.js         #    Favicon generation
│   ├── seed-notifications.ts     #    Notification seeding
│   ├── test-auth-sessions.ts     #    Auth session testing
│   ├── test-db.ts                #    Database connectivity test
│   ├── test-login.ts             #    Login flow test
│   ├── test-settings-table.ts    #    Settings table test
│   └── verify-all.ts             #    Full verification suite
├── types/                        # TypeScript definitions
│   └── next-pwa.d.ts             #    PWA type declarations
├── tasks/                        # Task tracking (empty)
├── __tests__/                    # Test suites
│   └── api/admin/                #    Admin API tests
├── .editorconfig
├── .eslintrc / eslint.config.js
├── .prettierrc
├── commitlint.config.cjs
├── metadata.json
├── next.config.ts
├── postcss.config.js
├── tsconfig.json
├── vercel.json
└── vitest.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** — Latest LTS (v20 or v22 recommended)
- **npm** — Ships with Node.js
- **Supabase** — Free account for database and authentication
- **Google Cloud Platform** — Account for Maps and Gemini AI APIs
- **Vercel** — Free account for deployment (optional for local dev)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Xenonesis/svi-new.git
   cd svi-new
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your keys (see Environment Variables section below).

4. **Initialize the database:**

   Create a Supabase project and run migrations from the `supabase/` directory in order:
   1. `migration.sql` — core schema
   2. `forms-migration.sql` — form submissions tables
   3. `attendance-migration.sql` — attendance tracking tables
   4. `notifications-setup.sql` — notifications system
   5. `performance-indexes.sql` — database indexes
   6. Files in `supabase/migrations/` in timestamp order (activity logs, notifications trigger, portal settings, lottery tables, lottery visibility policy)

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
# Application
APP_URL="http://localhost:3000"

# Supabase (from project dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"   # Secret — server-side only

# Google APIs
GEMINI_API_KEY="your_gemini_api_key"                          # https://aistudio.google.com/apikey
NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY="your_google_maps_key"   # https://console.cloud.google.com

# Email
RESEND_API_KEY="your_resend_api_key"                          # https://resend.com

# Optional
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"                       # Google Analytics
```

---

## Available Scripts

| Script           | Command                                  | Description                           |
| ---------------- | ---------------------------------------- | ------------------------------------- |
| `dev`            | `next dev --port 3000`                   | Development server with HMR           |
| `build`          | `next build`                             | Production build                      |
| `start`          | `next start`                             | Start production server               |
| `test`           | `vitest run`                             | Run all tests                         |
| `test:watch`     | `vitest`                                 | Watch mode                            |
| `lint`           | `eslint . --ext .ts,.tsx,.js,.jsx`       | Code quality check                    |
| `lint:fix`       | `eslint . --ext .ts,.tsx,.js,.jsx --fix` | Auto-fix lint issues                  |
| `format`         | `prettier --write .`                     | Format all files                      |
| `format:check`   | `prettier --check .`                     | Verify formatting                     |
| `editorconfig`   | `editorconfig-checker`                   | Check .editorconfig compliance        |
| `prepare`        | `husky`                                  | Init git hooks (auto-runs on install) |
| `clean`          | `rm -rf .next`                           | Remove build artifacts                |
| `generate-icons` | `node scripts/generate-icons.js`         | Generate favicon variants             |

---

## Routing & Pages

### Public Routes

| Route                 | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `/`                   | Landing page with hero, featured projects, company overview |
| `/about`              | Company history, mission, vision, values                    |
| `/blog`               | Market insights and company news                            |
| `/blog/[slug]`        | Dynamic blog post pages                                     |
| `/careers`            | Job openings and career applications                        |
| `/contact`            | Inquiry form → Resend email API (with hCaptcha)             |
| `/faq`                | FAQs with accordion UI                                      |
| `/grievance`          | Complaint submission with tracking                          |
| `/leadership`         | Management team profiles                                    |
| `/login`              | Client authentication portal                                |
| `/lottery`            | Lottery page (feature-flagged via portal settings)          |
| `/notifications`      | Notification viewing for registered users                   |
| `/payment`            | Online payment portal                                       |
| `/privacy-policy`     | Data protection documentation                               |
| `/projects/completed` | Delivered projects with Google Maps                         |
| `/projects/current`   | Ongoing developments                                        |
| `/registration`       | New user registration (Supabase auth)                       |
| `/terms-conditions`   | Terms of service                                            |
| `/thank-you`          | Post-submission confirmation                                |

### Admin Routes

All admin routes are behind authentication via `AdminSessionProvider`:

| Route                     | Description                                                                  |
| ------------------------- | ---------------------------------------------------------------------------- |
| `/admin/dashboard`        | Analytics, KPIs, activity timeline                                           |
| `/admin/attendance`       | Check-in/out, reports, team management                                       |
| `/admin/allotment-letter` | Allotment letter PDF generation                                              |
| `/admin/bba`              | Builder Buyer Agreement PDF generation                                       |
| `/admin/email`            | Email compose, sent history, templates, domains                              |
| `/admin/lottery`          | Lottery draw management                                                      |
| `/admin/notifications`    | Notification center                                                          |
| `/admin/offer-letter`     | Offer letter PDF generation                                                  |
| `/admin/payment-plan`     | Payment plan PDF generation                                                  |
| `/admin/payment-receipt`  | Payment receipt PDF generation                                               |
| `/admin/settings`         | System configuration (profile, company, appearance, notifications, security) |

### API Routes

#### Public API Routes

| Route                 | Method | Description             |
| --------------------- | ------ | ----------------------- |
| `/api/contact`        | POST   | Contact form submission |
| `/api/grievance`      | POST   | Grievance submission    |
| `/api/registration`   | POST   | User registration       |
| `/api/project-images` | GET    | Project image serving   |

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
| `/api/admin/documents`                              | Document list/create               |
| `/api/admin/documents/[id]`                         | Individual document CRUD           |
| `/api/admin/email`                                  | Email sending                      |
| `/api/admin/notifications`                          | Notification CRUD                  |
| `/api/admin/notifications/[id]`                     | Individual notification management |
| `/api/admin/settings`                               | Portal settings CRUD               |
| `/api/admin/users`                                  | User list/create                   |
| `/api/admin/users/[id]`                             | Individual user CRUD               |

---

## Component Architecture

### Provider Hierarchy (in `ClientProviders.tsx`)

```
ThemeProvider          — Light/dark mode context (localStorage + OS preference)
  └─ SessionProvider   — Supabase auth session (client-side)
       └─ Children     — Page content
```

### Common Components (`src/components/common/`)

| Component         | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `Analytics`       | Vercel Analytics and Speed Insights integration                 |
| `AnimatedSection` | Scroll-triggered fade/slide animations via Motion's `useInView` |
| `BackToTop`       | Floating scroll-to-top button                                   |
| `Breadcrumbs`     | Auto-generated breadcrumb trail from URL path                   |
| `CookieConsent`   | GDPR-compliant consent banner with localStorage                 |
| `ErrorBoundary`   | React error boundary with fallback UI                           |
| `HoverZoomImage`  | Image with CSS transform zoom on hover                          |
| `ScrollToTop`     | Auto-scroll to top on route change                              |
| `social-icons`    | Social media icon set                                           |
| `StatsCounter`    | Animated counter that counts up on scroll into view             |
| `WhatsAppChat`    | Floating WhatsApp chat button                                   |

### Admin Components (`src/components/admin/`)

| Component              | Description                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `AdminHeader`          | Top nav + notification dropdown                                                                            |
| `AdminSidebar`         | Collapsible sidebar navigation                                                                             |
| `AdminSessionProvider` | Auth context for admin routes                                                                              |
| `ActivityTimeline`     | Chronological activity feed                                                                                |
| `NotificationDropdown` | Read/unread notification panel                                                                             |
| `QuickActions`         | Dashboard shortcut cards                                                                                   |
| `attendance/`          | `AttendanceDashboard`, `AttendanceReport`, `MarkAttendance`, `TeamsManager`                                |
| `ChartComponents/`     | `UserGrowthChart`, `AttendanceStatusChart`, `AttendanceTrendChart`, `DocumentStatsChart`                   |
| `DocumentGenerator/`   | `Shared` — download options with PDF + image export                                                        |
| `email/`               | `ComposeTab`, `SentTab`, `TemplatesTab`, `DomainsTab`, `SettingsTab`, plus `helpers`, `types`, `constants` |
| `settings/`            | `ProfileTab`, `CompanyTab`, `AppearanceTab`, `NotificationsTab`, `SecurityTab`, plus `helpers`             |

### Lottery Components (`src/components/lottery/`)

| Component              | Description                     |
| ---------------------- | ------------------------------- |
| `LotteryClientSection` | Client-side lottery interaction |
| `LotteryCTA`           | Call-to-action for lottery      |
| `LotteryDrawSection`   | Lottery draw display            |

---

## Data Layer

### Supabase Integration

- **Authentication**: Email/password with `@supabase/ssr` — cookie-based sessions compatible with App Router server components
- **PostgreSQL Database**: Schema defined through migration files — core tables, attendance tracking, form submissions, notifications, portal settings, lottery system, activity logs, and performance indexes
- **Client Architecture**:
  - `client.ts` — Browser client (`createBrowserClient`)
  - `admin.ts` — Server-side service role client
  - `create-admin.ts` — Admin client factory
  - `verifyAdmin.ts` — Admin role verification
  - `notifications.ts` — Notification CRUD helpers
  - `types.ts` — Database type definitions

### Data & Configuration (`src/data/`)

- `company_settings.json` — Company details (name, address, email, phone, GST, RERA, bank info)

### Library Utilities (`src/lib/`)

- `seo.ts` — `createMetadata()` helper generating Open Graph, Twitter card, canonical, and robots metadata
- `blog.ts` — Typed `BlogPost[]` array with `BLOG_POST_MAP` for slug-based lookup and `[slug]` routing
- `hooks/useLotteryVisibility.ts` — Reads `portal_settings.lottery_page_visible` to feature-flag the lottery page

---

## State Management & Providers

### ThemeProvider

- Provides `ThemeContext` with `theme` (light/dark) and `setTheme`
- Persists to `localStorage` under key `svi-theme`
- Falls back to OS `prefers-color-scheme`
- Initializes via `public/theme-init.js` to prevent flash of wrong theme on page load

### AdminSessionProvider

- Wraps all admin routes with Supabase auth context
- Maintains persistent admin session across page navigations

### ClientProviders

Composes ThemeProvider + Supabase session provider + Vercel Analytics into a single wrapper used in `app/layout.tsx`.

---

## Animations & UI Effects

The project uses the **Motion** library for declarative animations:

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

---

## Database Migrations

The Supabase schema is managed through SQL migration files:

| File / Migration                                               | Purpose                                 |
| -------------------------------------------------------------- | --------------------------------------- |
| `migration.sql`                                                | Core schema (users, projects, auth)     |
| `forms-migration.sql`                                          | Form submissions tables                 |
| `attendance-migration.sql`                                     | Attendance tracking tables              |
| `notifications-setup.sql`                                      | Notifications system                    |
| `performance-indexes.sql`                                      | Database performance indexes            |
| `migrations/20260520120000_forms_tables.sql`                   | Forms tables timestamped migration      |
| `migrations/20260520130000_attendance_tables.sql`              | Attendance tables timestamped migration |
| `migrations/20260520140000_activity_logs_check_constraint.sql` | Activity logs constraint                |
| `migrations/20260520150000_fix_notifications_trigger.sql`      | Notifications trigger fix               |
| `migrations/20260522130000_create_portal_settings.sql`         | Portal settings table                   |
| `migrations/20260528150000_create_lotteries_table.sql`         | Lottery system tables                   |
| `migrations/20260528180000_lottery_visibility_policy.sql`      | Lottery visibility RLS policy           |

---

## Testing Strategy

The project uses **Vitest** with **jsdom** for DOM simulation.

- **API Tests**: `__tests__/api/admin/` — end-to-end tests for admin route handlers
- **Component Tests**: Unit tests for React components (Vitest + @testing-library/react compatible)
- **Integration Tests**: Component interaction and data flow tests

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

Vitest config includes React plugin for JSX, jsdom environment, and `@/` path alias resolution.

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

### ESLint Configuration

The flat config (`eslint.config.js`) includes TypeScript ESLint (type-aware), React plugin, React Hooks plugin (Rules of Hooks), Next.js plugin (Image, routing conventions), and Prettier integration.

### Prettier Configuration

Semicolons enabled, single quotes, ES5 trailing commas, 2-space tabs, Tailwind CSS class sorting via `prettier-plugin-tailwindcss`.

---

## Next.js Configuration

The `next.config.ts` includes:

- **React Strict Mode** enabled
- **Compression** enabled
- **Turbopack** enabled for faster dev builds
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation disabled)
- **Image Optimization**: Remote patterns for Google Maps domains, WebP/AVIF formats, responsive device sizes, 75/85 quality tiers, 30-day minimum cache TTL

---

## Deployment

### Vercel Deployment

1. Push code to GitHub/GitLab/Bitbucket
2. Import repo into Vercel
3. Set environment variables in Project Settings → Environment Variables
4. Deploy — Vercel auto-builds on each push to the production branch

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

- **Google Gemini AI** (`@google/genai`): AI-powered content generation and suggestions — server-side only for credential security
- **Google Maps** (`@vis.gl/react-google-maps`): Interactive project location maps — restrict API key by HTTP referrer
- **hCaptcha** (`@hcaptcha/react-hcaptcha`): Form spam protection on contact and registration forms
- **Resend**: Transactional email for contact forms, grievance acknowledgment, registration confirmation, and admin email management
- **Vercel Analytics**: Privacy-friendly page view and visitor tracking
- **Vercel Speed Insights**: Real-user Core Web Vitals measurement (LCP, FID/INP, CLS)
- **Supabase Realtime**: WebSocket-based live updates for notifications and activity feeds
- **xlsx**: Excel file parsing and generation for data export

---

## Performance & SEO

### Performance

- Server Components by default minimize client-side JavaScript
- Next.js `<Image>` with automatic WebP/AVIF, lazy loading, and responsive sizing
- Turbopack for fast development builds
- Route segment caching for instant page loads
- Code splitting at the route level
- Motion library tree-shakes unused animation features
- Strategic PostgreSQL indexes from `performance-indexes.sql`
- 30-day image cache TTL

### SEO

- Centralized `createMetadata()` utility in `src/lib/seo.ts` for consistent metadata across all pages
- Dynamic metadata (`generateMetadata()`) per page
- Dynamic Open Graph image generation (`opengraph-image.tsx`)
- XML sitemap (`app/sitemap.ts`) covering all public routes
- Dynamic `robots.ts` with Googlebot directives
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
| Google Maps not rendering  | Verify API key, enable Maps API in GCP console, check HTTP referrer restrictions    |
| Emails not sending         | Verify Resend API key, check delivery dashboard, verify sender domain               |
| Lottery page not visible   | Check `portal_settings` table for `lottery_page_visible` key set to `true`          |
| Build failures             | Run `npm run clean`, check TypeScript (`npx tsc --noEmit`), ensure env vars are set |

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

---

## License

**Private** — All rights reserved by SVI Infra Solutions Pvt. Ltd.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without prior written permission.

---

_© 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved._
