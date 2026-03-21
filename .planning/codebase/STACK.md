# Technology Stack

**Analysis Date:** 2026-03-21

## Languages

**Primary:**
- TypeScript 5.x - All application code (`src/**/*.ts`, `src/**/*.tsx`)
- TSX - React component files (`src/components/**/*.tsx`, `src/app/**/*.tsx`)

**Secondary:**
- CSS - Global styles via `src/app/globals.css`

## Runtime

**Environment:**
- Node.js v22.13.1 (detected on dev machine; no `.nvmrc` or `.node-version` pinned)

**Package Manager:**
- npm 10.9.2
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack React framework, App Router, Server Components, Server Actions
- React 19.2.4 - UI rendering
- React DOM 19.2.4 - DOM rendering

**UI Component Library:**
- shadcn 4.1.0 - Component scaffolding (`components.json`, style: `base-nova`)
- @base-ui/react 1.3.0 - Low-level headless UI primitives (used by shadcn layer)

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS (`src/app/globals.css`, `postcss.config.mjs`)
- @tailwindcss/postcss 4.x - PostCSS integration
- tw-animate-css 1.4.0 - Animation utilities imported in `globals.css`
- tailwind-merge 3.5.0 - Merge conflicting Tailwind classes (used in `src/lib/utils.ts`)
- class-variance-authority 0.7.1 - Typed variant component patterns (used in UI components)
- clsx 2.1.1 - Conditional className utility (used in `src/lib/utils.ts`)

**Charts:**
- recharts 3.8.0 - Data visualization (imported as dependency; available for use in components)

**Icons:**
- lucide-react 0.577.0 - Icon set (used throughout `src/app/**/*.tsx` and `src/components/**/*.tsx`)

**Build/Dev:**
- tsx 4.21.0 - TypeScript execution for scripts (used in `prisma/seed.ts` and `package.json` scripts)

## Key Dependencies

**Critical:**
- `@prisma/client` 7.5.0 - Database ORM client (generated to `src/generated/prisma/`)
- `prisma` 7.5.0 - ORM CLI and schema management
- `@prisma/adapter-pg` 7.5.0 - PostgreSQL driver adapter for Prisma
- `pg` 8.20.0 - PostgreSQL Node.js client (connection pooling via `pg.Pool`)
- `zod` 4.3.6 - Schema validation (available; imported in dependency list)
- `bcryptjs` 3.0.3 - Password hashing (imported as dependency; auth scaffolding may be future)
- `dotenv` 17.3.1 - Environment variable loading (used in `prisma.config.ts` and `prisma/seed.ts`)

**Infrastructure:**
- `@types/pg` 8.11.11 - TypeScript types for pg client
- `@types/node` 20.x - Node.js type definitions
- `@types/react` 19.x - React type definitions
- `@types/react-dom` 19.x - React DOM type definitions

## Configuration

**Environment:**
- `.env` file present at project root (contains `DATABASE_URL` at minimum)
- `DATABASE_URL` - PostgreSQL connection string (required; used in `src/lib/prisma.ts` and `prisma/seed.ts`)
- `NODE_ENV` - Standard Next.js environment variable (controls Prisma singleton behavior in `src/lib/prisma.ts`)

**Build:**
- `tsconfig.json` - TypeScript config; strict mode enabled; path alias `@/*` → `./src/*`; target ES2017
- `next.config.ts` - Minimal Next.js config (no special overrides)
- `postcss.config.mjs` - PostCSS with `@tailwindcss/postcss` plugin
- `eslint.config.mjs` - ESLint 9 flat config; uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- `prisma.config.ts` - Prisma config pointing schema to `prisma/schema.prisma`
- `components.json` - shadcn config; style `base-nova`; RSC enabled; icon library `lucide`

**Prisma Schema:**
- Schema: `prisma/schema.prisma`
- Client output: `src/generated/prisma/`
- Migrations path: `prisma/migrations/`
- Provider: `postgresql`

## Platform Requirements

**Development:**
- Node.js 22.x (runtime on dev machine)
- PostgreSQL database accessible via `DATABASE_URL`
- Run `npm run dev` for local development server

**Production:**
- Startup command: `prisma db push && tsx prisma/seed.ts && next start`
- Database schema is auto-applied on start (`db push`), seed runs upsert-safe categories/settings
- Build command: `prisma generate && next build`
- No Docker, CI/CD, or deployment platform config detected in repo

---

*Stack analysis: 2026-03-21*
