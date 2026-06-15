# SPRINT_PLAN.md — SVI Infra Solutions Website Redesign (2026 Premium Edition)

## Project Objective

Transform SVI Infra Solutions into a premium infrastructure-led real-estate brand experience focused on:

- Trust
- Infrastructure-led growth
- Premium visual identity
- Lead generation
- Long-term scalability
- Enterprise-grade performance

---

# Success Metrics

## UX

- Premium first impression
- Clear information hierarchy
- Strong conversion funnel
- Mobile-first experience

## Technical

- Lighthouse Performance > 95
- SEO > 95
- Accessibility > 95
- Best Practices > 95

## Business

- Increase lead generation
- Increase site visit bookings
- Increase project page engagement
- Increase WhatsApp conversions

---

# Sprint 1 — Foundation & Design System

Duration: 1 Week

## Goals

Establish technical foundation and design system.

## Tasks

### Design System

- Implement color tokens
- Implement spacing tokens
- Implement typography system
- Implement shadows
- Implement radius system
- Implement motion tokens

### Fonts

- Inter
- Manrope

### Layout

- Container system
- Grid system
- Section rhythm

### Accessibility

- WCAG AA setup
- Focus states
- Reduced motion support

### Monitoring

- Sentry setup
- Vercel Analytics
- Speed Insights

## Deliverables

- Design system complete
- Global styles complete
- Monitoring configured

---

# Sprint 2 — Navigation & Hero Experience

Duration: 1 Week

## Goals

Build premium first impression.

## Tasks

### Navigation

- Glass navbar
- Scroll hide/show
- Language switcher
- Mobile menu
- Book Site Visit CTA

### Hero

#### Desktop

- React Three Fiber Hero
- Abstract architectural scene
- Mouse parallax
- Camera orbit

#### Tablet

- Simplified geometry

#### Mobile

- Capability detection
- Lightweight R3F
- Static AVIF fallback

### Hero Copy Variants

Variant A

Strategic Land.
Future Infrastructure.
Long-Term Value.

Variant B

Building Communities Around Tomorrow's Growth Corridors.

Variant C

Secure Land Investments Backed By Infrastructure Growth.

### Feature Flag System

Store hero variant in:

```sql
feature_flags
```

### Trust Section

Rename:

```txt
Why Investors Choose SVI
```

Instead of:

```txt
Trusted By Investors
```

## Deliverables

- Navigation complete
- Hero complete
- Hero A/B testing complete

---

# Sprint 3 — Core Homepage Experience

Duration: 1 Week

## Goals

Build primary conversion sections.

## Sections

### Brand Story

Headline:

We Don't Just Develop Land.
We Create Future Growth Areas.

### Featured Projects

- Premium cards
- Hover interactions
- Motion reveals

### Why Invest

Cards:

- Future Connectivity
- Legal Security
- Development Ready
- Organic Growth Potential
- Transparent Transactions
- End-to-End Support

### Leadership

Founder story
Vision statement

### Testimonials

Priority:

1. Video testimonials
2. Photo testimonials
3. Text testimonials

Compliance-safe language only.

## Deliverables

- Core homepage complete

---

# Sprint 4 — Maps, Timelines & Storytelling

Duration: 1 Week

## Goals

Introduce premium interactive experiences.

## Location Intelligence

### MapLibre

Dynamic project centering

### Data Layers

- Airports
- Highways
- Metro
- Schools
- Hospitals
- Commercial Zones

### Caching

Static POI layers cached

Dynamic project markers fetched live

## Development Timeline

### GSAP ScrollTrigger

Steps:

1. Land Acquisition
2. Planning
3. Approvals
4. Infrastructure
5. Delivery

### Timeline Effects

- SVG path drawing
- Gold progress fill
- Alternating reveal animations

## Deliverables

- Interactive map complete
- Development timeline complete

---

# Sprint 5 — Lead Funnel & CRM

Duration: 1 Week

## Goals

Maximize conversion performance.

## Booking Modal

Fields:

- Name
- Phone
- Email
- Project Interest
- Preferred Visit Date

## Lead Scoring

Phone = +20

Email = +10

Project Selected = +20

Visit Date = +30

WhatsApp Lead = +15

Call Lead = +15

Returning Visitor = +10

Direct Site Visit Request = +25

## Storage

Supabase

Table:

```sql
leads
```

### Additional Fields

```sql
lead_score
lead_source
lead_status
```

## Floating Contact System

Desktop FAB:

- WhatsApp
- Call
- Book Visit

Mobile Sticky Bar:

- Call
- WhatsApp
- Book Visit

## Deliverables

- CRM complete
- Lead scoring complete
- Contact system complete

---

# Sprint 6 — Analytics & SEO

Duration: 1 Week

## Analytics Events

```ts
hero_cta_click;

project_view;

book_visit_open;

book_visit_submit;

whatsapp_click;

call_click;

map_interaction;

testimonial_play;
```

## Event Pipeline

```txt
User Event
↓
Analytics Layer
↓
Vercel Analytics
↓
Supabase Analytics Table
```

## SEO

### Global Schema

- Organization
- LocalBusiness

### Per Page Schema

- FAQ
- Breadcrumb
- Project

### Metadata

- Dynamic title
- Dynamic description
- OpenGraph
- Twitter Cards

### Indexing

- robots.txt
- sitemap.xml

## Deliverables

- SEO complete
- Analytics complete

---

# Sprint 7 — Project Detail Pages

Duration: 1–2 Weeks

Route:

```txt
/project/[slug]
```

## Sections

### Hero

Project visual
Location
Status

### Gallery

AVIF/WebP images

### Master Plan

Interactive overlays

### Amenities

Grid layout

### Location Intelligence

Project-specific map

### FAQ

Project questions

### Inquiry Form

Lead generation

### Related Projects

Cross-linking

## Deliverables

- Project pages complete

---

# Sprint 8 — Performance Optimization

Duration: 1 Week

## Performance Budget

Critical Route JS

```txt
< 350kb
```

### Images

- AVIF
- WebP fallback
- Blur placeholders
- Responsive srcset

### R3F Optimization

If FPS < 30 for 3 seconds:

- Disable shadows
- Disable postprocessing
- Reduce geometry count

If FPS < 20:

- Switch to static visual

### Device-Based Optimization

Check:

```ts
prefersReducedMotion;

navigator.deviceMemory;

navigator.hardwareConcurrency;
```

## Deliverables

- Performance optimized

---

# Sprint 9 — Security & Production Hardening

Duration: 1 Week

## Security

### Forms

- Rate limiting
- Zod validation
- Input sanitization
- Honeypot protection

### Supabase

- RLS policies
- Secure API routes
- Service role isolation

### Monitoring

- Sentry alerts
- Error tracking
- API failure monitoring

## Deliverables

- Security hardened

---

# Sprint 10 — QA & Launch

Duration: 1 Week

## Functional Testing

- Forms
- Maps
- Analytics
- Localization
- Navigation

## Device Testing

- Mobile
- Tablet
- Desktop

## Accessibility

- Keyboard navigation
- Focus states
- Screen reader checks

## Launch Checklist

- Lighthouse > 95
- SEO validated
- Schema validated
- Analytics verified
- Leads verified
- Email delivery verified
- Sitemap verified
- robots.txt verified
- Custom 404 page
- Custom 500 page

## Go Live

Production deployment

Post-launch monitoring

Performance audits

Conversion tracking

A/B testing review

---

# Final Outcome

SVI Infra Solutions will transition from a traditional real-estate website into a premium infrastructure-led investment brand experience with:

- Luxury visual identity
- Enterprise-grade architecture
- High conversion lead funnel
- Strong SEO foundation
- Interactive storytelling
- Scalable design system
- Long-term maintainability
