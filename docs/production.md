# SettleFlow — Production Deployment

This document covers production hardening (B8), deployment, observability, and the security audit checklist.

## Prerequisites

- Neon PostgreSQL production branch (`settleflow-prod`)
- Vercel project with production environment variables
- Inngest production environment
- Shopify App Store / live app credentials
- Easebuzz live merchant keys (after sandbox verification)

## Required environment variables (production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooler URL (production branch) |
| `SHOPIFY_API_KEY` | Live Shopify app key |
| `SHOPIFY_API_SECRET` | Live Shopify app secret |
| `SCOPES` | `read_orders,read_all_orders` |
| `HOST` | Public app URL (`https://your-domain.vercel.app`) |
| `ENCRYPTION_KEY` | 32+ char secret for AES-256-GCM |
| `SESSION_SECRET` | 32+ char secret for session JWT |
| `INNGEST_EVENT_KEY` | Inngest production event key |
| `INNGEST_SIGNING_KEY` | Inngest production signing key |
| `SENTRY_DSN` | Sentry project DSN |
| `BETTERSTACK_SOURCE_TOKEN` | Better Stack log source token |
| `POSTHOG_API_KEY` | PostHog project API key |
| `POSTHOG_HOST` | Optional; defaults to `https://us.i.posthog.com` |

Copy from `.env.example` and set values in Vercel **Production** only. Never use production keys locally.

## Deployment pipeline

### CI (every push / PR to `main`)

`.github/workflows/ci.yml` runs lint, typecheck, Prisma generate, Vitest, and build.

### Production deploy (push to `main`)

`.github/workflows/deploy.yml`:

1. `prisma migrate deploy` against production `DATABASE_URL`
2. Vercel production deploy via `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets

Configure GitHub **production** environment secrets before enabling auto-deploy.

## Health checks

`GET /api/health` returns:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "checks": { "database": "ok" },
    "timestamp": "...",
    "version": "0.1.0"
  }
}
```

Returns **503** when the database probe fails (`status: "degraded"`). Use for Vercel / load balancer readiness probes.

## Observability

| Tool | Integration | When active |
|------|-------------|-------------|
| **Sentry** | `src/lib/monitoring/sentry.ts`, route error wrapper, Inngest `onFailure` | `NODE_ENV=production` + `SENTRY_DSN` |
| **Better Stack** | Pino → `@logtail/pino` transport | Production + `BETTERSTACK_SOURCE_TOKEN` |
| **PostHog** | `src/lib/monitoring/posthog.ts` | Production + `POSTHOG_API_KEY` |

Product events captured:

- `shop_installed` — Shopify token exchange
- `finance_login_success` — standalone login
- `invite_accepted` — team invite accepted
- `reconcile_triggered` — manual reconciliation

## API documentation

`/api/docs` is **disabled in production** (`NODE_ENV=production` returns 404). Available in development and preview.

OpenAPI spec: `pnpm openapi:generate` → `openapi/spec.json`.

## Rate limiting

Auth routes (`/api/auth/login`, `/api/auth/shopify`, `/api/auth/invite/accept`) are limited to **10 requests/minute/IP** via `src/lib/rate-limit.ts`. Returns **429** when exceeded.

Note: in-memory limits apply per serverless instance; sufficient for launch. Consider Redis/Upstash for strict global limits at scale.

## Security audit (B8)

Run locally or in CI:

```bash
pnpm security:audit
```

### Checklist status

| Control | Status |
|---------|--------|
| Shopify HMAC on every webhook | Implemented |
| Easebuzz hash on every webhook | Implemented |
| Session token JWT on embedded auth | Implemented |
| bcrypt (cost 12) passwords | Implemented |
| httpOnly, secure, sameSite cookies | Implemented |
| Every DB query scoped by `shopId` | Implemented (services) |
| RBAC on mutating routes | Implemented |
| Zod validation on inputs | Implemented |
| Gateway secrets encrypted at rest | Implemented |
| Rate limit auth routes | Implemented (B8) |
| Audit log for settings / resolutions | Partial — resolution records store `resolvedByUserId`; settings changes not yet auditable |

## Manual verification before go-live

1. `pnpm test` — all tests green
2. `pnpm security:audit` — audit passes
3. Confirm Easebuzz webhook field mappings against live sandbox (see `TODO(easebuzz-sandbox)` markers)
4. Register webhook URLs in Easebuzz dashboard
5. Smoke test: install app → connect gateway → receive test webhook → run reconcile → verify dashboard APIs

## Backend milestone completion

| Milestone | Status |
|-----------|--------|
| B0 Foundation | Complete |
| B1 Database | Complete |
| B2 Shopify Auth | Complete |
| B3 Shopify Webhooks | Complete |
| B4 Standalone Auth + RBAC | Complete |
| B5 Easebuzz Integration | Complete |
| B6 Easebuzz Webhooks | Complete |
| B7 Reconciliation Engine | Complete |
| B8 Production Hardening | Complete |

**Frontend (F0–F8) may begin** against the OpenAPI contract and dashboard APIs documented at `/api/docs` (dev).
