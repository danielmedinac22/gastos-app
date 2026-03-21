# External Integrations

**Analysis Date:** 2026-03-21

## APIs & External Services

**Fonts:**
- Google Fonts (via Next.js font system) - Geist Sans and Geist Mono fonts
  - SDK/Client: `next/font/google` (loaded in `src/app/layout.tsx`)
  - Auth: None required (CDN fetch at build/runtime)

No third-party REST APIs, payment processors, SMS, email, or cloud function services detected.

## Data Storage

**Databases:**
- PostgreSQL (self-hosted or managed; provider not specified in codebase)
  - Connection: `process.env.DATABASE_URL` (connection string with pooling via `pg.Pool`)
  - Client: Prisma ORM 7.5.0 with `@prisma/adapter-pg` driver adapter
  - Singleton pattern: `src/lib/prisma.ts` (global instance, dev hot-reload safe)
  - Schema: `prisma/schema.prisma`
  - Models: `Category`, `CreditCard`, `BillingCycle`, `Expense`, `FixedExpense`, `Settings`, `Income`

**File Storage:**
- Local filesystem only (no S3, GCS, Cloudinary, or similar detected)

**Caching:**
- None (all pages use `export const dynamic = "force-dynamic"` — no Next.js route caching)

## Authentication & Identity

**Auth Provider:**
- None currently active
- `bcryptjs` 3.0.3 is present as a dependency but no auth routes, sessions, or middleware detected
- No auth middleware in `src/` directory
- App is single-user with no login flows

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, Bugsnag, or similar detected)

**Logs:**
- `console.log` / `console.error` only (used in `prisma/seed.ts`)
- No structured logging library detected

## CI/CD & Deployment

**Hosting:**
- Not specified — no Vercel, Railway, Fly.io, Heroku, or Docker config present
- Production startup handled via `package.json` `start` script: `prisma db push && tsx prisma/seed.ts && next start`

**CI Pipeline:**
- None detected (no `.github/`, `.gitlab-ci.yml`, or similar)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string (used in `src/lib/prisma.ts`, `prisma/seed.ts`, `prisma.config.ts`)
- `NODE_ENV` - Standard; affects Prisma singleton caching in `src/lib/prisma.ts`

**Secrets location:**
- `.env` file at project root (present, not committed per standard `.gitignore` conventions)

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook handler routes in `src/app/`)

**Outgoing:**
- None detected

## Localization

**Locale:**
- Colombian Spanish (`es-CO`) used for currency and date formatting in `src/lib/utils.ts`
- Currency: COP (Colombian Peso), formatted via `Intl.NumberFormat`
- Dates: formatted via `Intl.DateTimeFormat` with `es-CO` locale
- HTML `lang="es"` set in `src/app/layout.tsx`

---

*Integration audit: 2026-03-21*
