# SettleFlow — Frontend Plan

> **CURSOR RULES — READ FIRST**
>
> ```text
> Never change architecture unless I explicitly approve.
> Never rename folders.
> Never replace libraries.
> Never rewrite existing code unless fixing a bug.
> Always extend the current architecture.
> If unsure, ask instead of assuming.
> ```

**Role:** Staff Frontend Engineer + Senior Product Designer  
**Build order:** Start AFTER backend milestones B0–B7 are complete and APIs are stable  
**Product:** Shopify Payment Analytics & Settlement Reconciliation SaaS  
**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui · Framer Motion · TanStack Query · TanStack Table · Recharts · Lucide Icons

---

## Pinned Versions

Lock these in `package.json` `engines`, `.nvmrc`, and lockfile. Do not downgrade or swap without explicit approval.

| Package | Version |
|---------|---------|
| Node.js | **24** |
| Next.js | **16** |
| React | **19** |
| Tailwind CSS | **v4** |
| shadcn/ui | **latest** |
| TanStack Query | **v5** |
| TanStack Table | **latest stable** |
| Framer Motion | **latest stable** |
| Recharts | **latest stable** |
| Vitest | **latest stable** |
| Playwright | **latest stable** |

---

## Non-Negotiable Decisions

These are locked before F0. Cursor must not change them.

- Next.js App Router only
- TypeScript strict mode (`"strict": true`)
- Server Components by default; `"use client"` only when interactivity requires it
- Tailwind CSS v4 only — **never Bootstrap, MUI, Chakra, styled-components, or CSS modules for layout**
- shadcn/ui only — **never hand-roll Button, Dialog, Table, etc.**
- **Never Polaris** — we use shadcn + App Bridge for session tokens only
- TanStack Query for all server state — **never Redux, Zustand for server data, or SWR**
- TanStack Table for all data tables
- Recharts for all charts — **never Chart.js or Nivo unless explicitly approved**
- Framer Motion for animations — **never GSAP unless explicitly approved**
- Lucide Icons only — **never Font Awesome or Heroicons**
- API types derived from backend Zod schemas / OpenAPI — **never duplicate type definitions by hand**
- PostgreSQL + Prisma on backend — frontend never assumes a different data layer

---

## Coding Rules

Apply to every file Cursor generates.

- Max file length: **300 lines** — split into smaller components if exceeded
- Max function length: **40 lines**
- One responsibility per file
- No duplicate code — extract shared components in `components/shared/`
- No `any` type
- No commented-out code
- Use `async/await` only in client data hooks
- Prefer composition over inheritance
- Every **exported** component/function needs a brief JSDoc
- Every component props interface must be explicitly typed

---

## Testing

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit tests (formatters, query keys, hooks with `@testing-library/react`) |
| **Playwright** | E2E tests (login flow, dashboard load, table filter, settings save) |
| **MSW** | Mock backend API responses in component tests |

### Test Folder Structure

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── setup/
│   ├── vitest.setup.ts
│   └── msw-handlers.ts
e2e/
├── embedded/                     # Shopify iframe flows (if testable)
└── standalone/                   # Login, dashboard, settings
```

### Milestone Exit Criteria (Every Milestone)

Every milestone F0–F8 must end with:

```
1. Write tests for new code
2. Run tests (pnpm test && pnpm test:e2e where applicable)
3. Fix failing tests
```

---

## API Contract

Frontend consumes backend APIs documented at `/api/docs` (dev/staging).

- Use `src/types/api.ts` types generated from backend OpenAPI (`pnpm openapi:types`)
- Never guess API response shapes — read OpenAPI spec or shared Zod schemas
- All fetch calls go through `lib/api-client.ts` (handles envelope + auth headers)

---

## Monitoring & Observability

| Tool | Purpose | When |
|------|---------|------|
| **Sentry** | Frontend error tracking + performance | F8 |
| **PostHog** | UI analytics (page views, feature usage, onboarding funnel) | F8 |
| **Better Stack** | Optional frontend log forwarding | F8 |

---

## Environment Strategy

| | Development | Production |
|---|-------------|------------|
| **API base** | `localhost:3000/api` or Shopify CLI tunnel | `https://app.settleflow.io/api` |
| **Shopify** | Dev store embedded app | Live App Store app |
| **OpenAPI docs** | `http://localhost:3000/api/docs` | Not exposed |
| **PostHog** | Dev project key | Production project key |
| **Sentry** | Disabled or dev DSN | Production DSN |

Frontend env vars (`.env.local`):

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_POSTHOG_KEY=        # F8 only
NEXT_PUBLIC_SENTRY_DSN=         # F8 only
```

---

## CI/CD (GitHub Actions)

Shared with backend CI pipeline (`.github/workflows/ci.yml`). Frontend steps run in same job:

| Step | Command |
|------|---------|
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit tests | `pnpm test` |
| Build | `pnpm build` |
| E2E tests | `pnpm test:e2e` (F1+ — Playwright against preview deploy) |

E2E runs against Vercel preview URL on PRs (configured in B8/F8).

---

## Design Philosophy

| Principle | Implementation |
|-----------|----------------|
| Clean & minimal | Black/white neutral palette; color only for status |
| Premium FinTech | Stripe / Vercel / Linear / Notion level polish |
| Merchant-friendly | Understand dashboard in under 10 seconds |
| shadcn-first | Official shadcn components only — customize spacing, radius, typography, colors |
| Accessible | WCAG 2.1 AA — keyboard nav, focus rings, ARIA labels |
| Performant | Skeleton loaders, optimistic UI where safe, lazy charts |

### Color System

| Token | Use |
|-------|-----|
| `--background`, `--foreground` | Black & white base |
| `--muted`, `--border` | Neutral grays |
| `--success` (green) | Matched, settled, success toasts |
| `--warning` (yellow) | Pending settlement, processing |
| `--destructive` (red) | Mismatches, errors, failed payments |
| `--primary` (blue, sparingly) | Primary CTA buttons only |

**Rule:** No decorative color. Status badges and charts use semantic colors only.

---

## Product Architecture Decisions (Locked)

| Decision | Choice | Why |
|----------|--------|-----|
| UI library | shadcn/ui only | Consistent, accessible, production-ready |
| Animations | Framer Motion | Page transitions, micro-interactions |
| Data fetching | TanStack Query v5 | Caches API responses; works with backend envelope |
| Tables | TanStack Table + shadcn DataTable pattern | Sortable, filterable, paginated |
| Charts | Recharts | Composable; fits FinTech dashboards |
| Auth surfaces | Hybrid embedded + standalone | Same dashboard components, different shells |
| State | Query + URL params + minimal Context | No Redux; keep it simple |

---

## Frontend Folder Structure

```
src/
├── app/
│   ├── (embedded)/                       # Shopify Admin iframe
│   │   ├── layout.tsx                    # App Bridge script + providers
│   │   └── app/
│   │       ├── page.tsx                  # Dashboard
│   │       ├── transactions/page.tsx
│   │       ├── settlements/page.tsx
│   │       ├── refunds/page.tsx
│   │       ├── reconciliation/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── (standalone)/                     # Finance portal
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── invite/[token]/page.tsx
│   │   └── shops/[shopId]/
│   │       ├── layout.tsx                # Shop-scoped shell
│   │       ├── page.tsx                  # Dashboard (mirrored)
│   │       ├── transactions/page.tsx
│   │       ├── settlements/page.tsx
│   │       ├── refunds/page.tsx
│   │       ├── reconciliation/page.tsx
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── layout.tsx                        # Root layout + fonts
│   └── globals.css                       # Tailwind v4 + CSS variables
├── components/
│   ├── ui/                               # shadcn/ui (npx shadcn add ...)
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── top-bar.tsx
│   │   ├── shop-switcher.tsx
│   │   └── page-header.tsx
│   ├── dashboard/
│   │   ├── kpi-grid.tsx
│   │   ├── kpi-card.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── settlement-lag-chart.tsx
│   │   └── recent-activity.tsx
│   ├── transactions/
│   │   ├── transactions-table.tsx
│   │   └── transactions-toolbar.tsx
│   ├── settlements/
│   │   ├── settlements-table.tsx
│   │   └── settlement-detail-sheet.tsx
│   ├── reconciliation/
│   │   ├── reconciliation-table.tsx
│   │   ├── mismatch-badge.tsx
│   │   └── resolve-dialog.tsx
│   ├── refunds/
│   │   └── refunds-table.tsx
│   ├── analytics/
│   │   ├── date-range-tabs.tsx
│   │   ├── trend-chart.tsx
│   │   └── gateway-breakdown-chart.tsx
│   ├── settings/
│   │   ├── easebuzz-form.tsx
│   │   ├── matching-strategy-form.tsx
│   │   ├── webhook-urls-panel.tsx
│   │   └── team-invite-form.tsx
│   ├── shared/
│   │   ├── data-table.tsx                # Reusable TanStack + shadcn wrapper
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-column-header.tsx
│   │   ├── status-badge.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── error-state.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── currency-display.tsx
│   │   └── page-transition.tsx           # Framer Motion wrapper
│   └── providers/
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       ├── shopify-provider.tsx          # App Bridge + session bootstrap
│       └── toast-provider.tsx
├── hooks/
│   ├── use-shop-context.ts
│   ├── use-payments.ts
│   ├── use-settlements.ts
│   ├── use-reconciliation.ts
│   ├── use-refunds.ts
│   ├── use-analytics.ts
│   ├── use-settings.ts
│   └── use-keyboard-shortcuts.ts
├── lib/
│   ├── api-client.ts                     # Fetch wrapper for backend envelope
│   ├── query-keys.ts
│   ├── format.ts                         # Currency, dates
│   └── animations.ts                     # Framer Motion variants
└── types/
    └── api.ts                            # Shared types matching backend contract
```

---

## Page Structure

### Navigation (both shells)

```
Dashboard
Transactions
Settlements
Refunds
Reconciliation
Analytics
Settings
```

### Embedded Routes (`/app/*`)

| Page | Route | Primary Content |
|------|-------|-----------------|
| Dashboard | `/app` | 6 KPIs, revenue chart, recent mismatches, pending settlements |
| Transactions | `/app/transactions` | Searchable/filterable payment table |
| Settlements | `/app/settlements` | Payout batches + detail sheet |
| Refunds | `/app/refunds` | Refund tracking table |
| Reconciliation | `/app/reconciliation` | Mismatch list + resolve actions |
| Analytics | `/app/analytics` | Trends, gateway breakdown, settlement lag |
| Settings | `/app/settings` | Easebuzz, matching, webhooks, team |

### Standalone Routes (`/shops/[shopId]/*`)

Same pages under standalone layout with:
- Login at `/login`
- Invite accept at `/invite/[token]`
- Shop switcher in top bar (multi-shop users)

---

## UI Component Hierarchy

```
AppShell
├── SidebarNav
│   └── NavItem × 7 (Lucide icon + label)
├── TopBar
│   ├── PageTitle
│   ├── DateRangePicker
│   ├── RefreshButton
│   └── ShopSwitcher (standalone only)
└── PageTransition (Framer Motion)
    └── PageContent
        ├── PageHeader (title + description + actions)
        └── [Page-specific content]
```

### Dashboard Page

```
DashboardPage
├── KpiGrid
│   └── KpiCard × 6
│       ├── Total Collected
│       ├── Settled Amount
│       ├── Pending Settlement
│       ├── Mismatch Count
│       ├── Refund Volume
│       └── Match Rate %
├── Grid (2-col)
│   ├── RevenueChart (Recharts AreaChart)
│   └── SettlementLagChart (Recharts BarChart)
└── RecentActivity
    └── Activity rows (mismatches + settlements)
```

### Data Pages (Transactions, Settlements, Refunds, Reconciliation)

```
DataPage
├── PageHeader
├── Toolbar (search, filters, date range, export future)
├── DataTable (TanStack Table)
│   ├── ColumnHeader (sortable)
│   ├── StatusBadge
│   └── RowActions (reconciliation only)
├── DataTablePagination
└── EmptyState | LoadingSkeleton | ErrorState
```

### Settings Page

```
SettingsPage
├── Tabs (shadcn Tabs)
│   ├── Gateway — EasebuzzForm + WebhookUrlsPanel
│   ├── Matching — MatchingStrategyForm
│   └── Team — TeamInviteForm + members table
```

---

## shadcn/ui Components to Install

Install via CLI — do not hand-roll equivalents:

| Component | Used For |
|-----------|----------|
| `button` | Actions, CTAs |
| `card` | KPI cards, chart containers |
| `table` | Data tables base |
| `badge` | Status indicators |
| `input`, `label` | Forms, search |
| `select` | Filters, strategy picker |
| `dialog` | Resolve mismatch, confirmations |
| `sheet` | Settlement detail drawer |
| `tabs` | Settings sections, analytics ranges |
| `skeleton` | Loading states |
| `toast` / `sonner` | Notifications |
| `dropdown-menu` | Row actions, shop switcher |
| `separator` | Layout dividers |
| `tooltip` | Column headers, icon buttons |
| `alert` | Error banners |
| `form` | React Hook Form integration |
| `calendar` + `popover` | Date range picker |
| `command` | Command palette (keyboard shortcuts) |
| `avatar` | Team members |
| `scroll-area` | Sidebar, activity feed |

---

## Theme Customization (globals.css)

Customize only CSS variables — do not modify shadcn component source:

```css
/* Conceptual — not generated code */
:root {
  --radius: 0.5rem;
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... neutral palette ... */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
  --primary: 221 83% 53%;  /* use sparingly */
}
```

Typography: Inter or Geist (Next.js font). Clear hierarchy — `text-2xl` page titles, `text-sm text-muted-foreground` descriptions.

Spacing: Generous padding (`p-6`, `gap-6`). Cards breathe.

---

## State Management Strategy

| Concern | Tool | Notes |
|---------|------|-------|
| Server data | TanStack Query | All API reads/writes |
| URL filters | `nuqs` or searchParams | Shareable filter state |
| Forms | React Hook Form + Zod | Settings, login, invite |
| Auth context | React Context | `shopId`, `role`, `mode: embedded \| standalone` |
| UI prefs | localStorage | Sidebar collapsed, table density |
| Animations | Framer Motion | Page + list item transitions |

### Query Key Convention

```typescript
['shop', shopId, 'payments', { page, status, from, to }]
['shop', shopId, 'settlements', { page, from, to }]
['shop', shopId, 'reconciliation', { page, status }]
['shop', shopId, 'refunds', { page, from, to }]
['shop', shopId, 'analytics', { range }]
['shop', shopId, 'settings']
```

### Invalidation Map

| Action | Invalidate |
|--------|------------|
| Settings saved | `settings`, `reconciliation` |
| Mismatch resolved | `reconciliation`, `analytics`, dashboard KPIs |
| Manual reconcile triggered | all shop queries |
| Date range changed | current page query only |

---

## API Integration (Frontend ↔ Backend)

### api-client.ts Pattern

- Base URL: relative `/api`
- Embedded: attach App Bridge session token as `Authorization: Bearer`
- Standalone: cookie session (automatic)
- Parse `{ success, data, meta, error }` envelope
- Throw typed errors for Query error boundaries

### Type Safety

Import shared Zod schemas from `src/schemas/` (created by backend) for form validation parity.

---

## UX Patterns

### Loading States
- **Dashboard KPIs:** 6 skeleton cards
- **Tables:** 10 skeleton rows
- **Charts:** Skeleton rectangle with shimmer
- **Page transition:** Fade + slight Y translate (Framer Motion)

### Empty States
- Friendly illustration-free design (icon + headline + description + CTA)
- Example: "No mismatches — everything is reconciled" with green check

### Error States
- shadcn Alert + retry button
- Toast for transient errors

### Toast Notifications
- Success: "Settings saved", "Mismatch resolved"
- Error: API error message (human-readable)
- Info: "Reconciliation started — this may take a minute"

### Micro-interactions
- Row hover highlight (subtle `bg-muted/50`)
- Button press scale (`whileTap={{ scale: 0.98 }}`)
- KPI number count-up on mount (optional, subtle)
- Status badge pulse for pending items

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + K` | Command palette (navigate pages) |
| `R` | Refresh current page data |
| `1`–`7` | Jump to nav items |
| `Esc` | Close dialog/sheet |

### Easter Eggs (subtle)
- Konami code → brief confetti when match rate is 100%
- Logo hover → subtle rotate (2deg max)
- Empty reconciliation → "All clear" with faint sparkle animation

---

## Accessibility Checklist

- [ ] All interactive elements keyboard reachable
- [ ] Focus visible on all focusable elements
- [ ] `aria-label` on icon-only buttons
- [ ] Table headers associated with columns
- [ ] Status not conveyed by color alone (icon + text)
- [ ] Chart data available in table alternative (future)
- [ ] Reduced motion: respect `prefers-reduced-motion`
- [ ] Form errors linked via `aria-describedby`
- [ ] Skip to main content link

---

## Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| Desktop (1280px+) | Full sidebar + 2-col dashboard |
| Tablet (768px+) | Collapsible sidebar |
| Mobile (<768px) | Bottom nav or hamburger; tables scroll horizontally |

**Primary target:** Desktop — finance workflows. Mobile is functional, not primary.

---

## Embedded vs Standalone Shells

```mermaid
flowchart TB
  subgraph embedded [Embedded Shell]
    AppBridge[App Bridge v4 Script]
    SessionBootstrap[POST /api/auth/shopify]
    EmbeddedLayout[AppShell - no shop switcher]
  end

  subgraph standalone [Standalone Shell]
    LoginPage[/login]
    CookieAuth[Session Cookie]
    StandaloneLayout[AppShell + ShopSwitcher]
  end

  subgraph shared [Shared Components]
    Dashboard[DashboardPage]
    Tables[DataTables]
    Charts[Charts]
    Settings[SettingsPage]
  end

  AppBridge --> SessionBootstrap --> EmbeddedLayout
  LoginPage --> CookieAuth --> StandaloneLayout
  EmbeddedLayout --> shared
  StandaloneLayout --> shared
```

**Key rule:** Page components in `components/dashboard/`, `components/transactions/`, etc. are shared. Only `layout/` shells differ.

---

## Page Wireframes (Content Layout)

### Dashboard — "understand in 10 seconds"
```
┌─────────────────────────────────────────────────────┐
│  SettleFlow          [Last 30 days ▼]  [↻ Refresh]  │
├──────────┬──────────────────────────────────────────┤
│ Dashboard│  Good morning. Here's your payment health. │
│ Trans... │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│ Settle.. │  │ ₹12L │ │ ₹9L  │ │ ₹3L  │ │  4   │     │
│ Refunds  │  │Coll. │ │Settl.│ │Pend. │ │Mism. │     │
│ Reconc.. │  └──────┘ └──────┘ └──────┘ └──────┘     │
│ Analyt.. │  ┌─────────────────┐ ┌───────────────┐  │
│ Settings │  │ Revenue Chart   │ │ Recent Issues │  │
│          │  └─────────────────┘ └───────────────┘  │
└──────────┴──────────────────────────────────────────┘
```

---

## Frontend Milestones

**Prerequisite:** Backend B7 complete (all API routes working + OpenAPI docs live)  
**Stop after each milestone. Wait for approval before continuing.**

**Every milestone exit:** Write tests → Run tests → Fix failing tests

---

### F0 — Design System Foundation
- Tailwind v4 + shadcn/ui init + theme variables (B&W + status colors)
- Install core shadcn components
- AppShell skeleton (no data yet)
- Vitest + Testing Library scaffold
- **Deliverable:** Styled empty shell with sidebar nav; unit test for StatusBadge

### F1 — Providers + Auth Shells
- QueryProvider, ThemeProvider, ToastProvider
- Embedded: App Bridge + session bootstrap
- Standalone: login page + invite accept page
- Playwright E2E: login flow
- **Deliverable:** Both shells render; auth flows connect to backend; tests pass

### F2 — Shared Data Components
- `api-client.ts`, query keys, `DataTable` wrapper
- StatusBadge, EmptyState, LoadingSkeleton, ErrorState
- DateRangePicker, CurrencyDisplay, PageTransition
- MSW handlers for all API endpoints
- **Deliverable:** Shared components with unit tests; MSW mock suite ready

### F3 — Dashboard Page
- KPI grid wired to `/analytics` API
- Revenue + settlement lag charts (Recharts)
- Recent activity feed
- Playwright E2E: dashboard loads with data
- **Deliverable:** Dashboard live with real data; tests pass

### F4 — Transactions + Settlements Pages
- TransactionsTable + toolbar + pagination
- SettlementsTable + SettlementDetailSheet
- E2E: filter transactions, open settlement detail
- **Deliverable:** Both pages fully functional; tests pass

### F5 — Reconciliation + Refunds Pages
- ReconciliationTable + ResolveDialog
- RefundsTable
- E2E: resolve a mismatch end-to-end
- **Deliverable:** Mismatch resolution works; tests pass

### F6 — Analytics Page
- DateRangeTabs, trend charts, gateway breakdown
- **Deliverable:** Analytics page complete; tests pass

### F7 — Settings Page
- EasebuzzForm, MatchingStrategyForm, WebhookUrlsPanel, TeamInviteForm
- E2E: save settings, verify toast
- **Deliverable:** Full settings workflow; tests pass

### F8 — Polish + Production UX
- Framer Motion page transitions + micro-interactions
- Keyboard shortcuts + command palette
- Empty/loading/error states on every page
- Sentry + PostHog wired
- Accessibility audit + responsive pass
- Playwright full E2E suite green in CI
- **Deliverable:** Production-ready UI; monitoring active

---

## Dependency on Backend APIs

| Frontend Page | Required API (must exist first) |
|---------------|--------------------------------|
| Dashboard | `GET /analytics` |
| Transactions | `GET /payments` |
| Settlements | `GET /settlements` |
| Reconciliation | `GET /reconciliation`, `PATCH /reconciliation/[id]`, `POST /reconcile` |
| Refunds | `GET /refunds` |
| Analytics | `GET /analytics?range=30d` |
| Settings | `GET/PATCH /settings`, `POST /settings/invite` |
| Auth | `POST /auth/shopify`, `POST /auth/login` |

---

## Cursor Frontend Prompt (copy-paste for each milestone)

```text
You are a Staff Frontend Engineer and Senior Product Designer.

CURSOR RULES (NON-NEGOTIABLE):
- Never change architecture unless I explicitly approve.
- Never rename folders.
- Never replace libraries.
- Never rewrite existing code unless fixing a bug.
- Always extend the current architecture.
- If unsure, ask instead of assuming.

Follow docs/frontend-plan.md exactly. Implement ONLY the current milestone.

Pinned: Node 24, Next 16, React 19, Tailwind v4, shadcn latest, Vitest, Playwright.

Stack (locked): shadcn/ui only, TanStack Query, TanStack Table, Recharts, Framer Motion, Lucide.

Design: Clean, minimal, premium FinTech. Black & white; color ONLY for status (green/yellow/red; blue for primary CTA).

Coding rules: max 300 lines/file, max 40 lines/function, no any, no commented code, typed props, Server Components by default.

UI rules:
- Use ONLY official shadcn/ui components. Customize via CSS variables only.
- Wire to backend APIs via api-client.ts — read OpenAPI spec, do not guess types.
- Do NOT modify backend code.
- Milestone exit: Write tests → Run tests → Fix failing tests.
- Stop when deliverable is met. Wait for approval.
```

---

## Future Frontend Enhancements

| Phase | Feature |
|-------|---------|
| v2 | CSV export buttons |
| v2 | Dark mode toggle (already themed via CSS vars) |
| v3 | Real-time updates via polling or SSE |
| v3 | Shopify Admin order detail extension block |
| v4 | Custom dashboard widgets (drag-drop) |

---

**Next step:** Complete backend B0–B8 first → then begin **F0 → F8** without adding more documentation.
