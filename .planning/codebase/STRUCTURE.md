# Codebase Structure

**Analysis Date:** 2026-03-21

## Directory Layout

```
GastosApp/
├── prisma/                  # Prisma schema and seed script
│   ├── schema.prisma        # Database models and enums
│   └── seed.ts              # Database seed data
├── public/                  # Static assets (favicon, etc.)
├── src/
│   ├── actions/             # Next.js Server Actions (all writes)
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── cards/           # Credit card routes
│   │   │   ├── [id]/        # Card detail (dynamic route)
│   │   │   └── new/         # New card form
│   │   ├── cash-flow/       # Biweekly cash flow projection
│   │   ├── expenses/        # Expense list and new expense form
│   │   │   └── new/         # New expense form
│   │   ├── fixed/           # Fixed expenses management
│   │   ├── incomes/         # Recurring income management
│   │   ├── globals.css      # Global Tailwind CSS
│   │   ├── layout.tsx       # Root layout with MobileNav
│   │   └── page.tsx         # Dashboard (/)
│   ├── components/          # Reusable React components
│   │   └── ui/              # shadcn/ui primitives
│   ├── generated/           # Auto-generated Prisma client (do not edit)
│   │   └── prisma/
│   ├── lib/                 # Business logic and shared utilities
│   └── types/               # Shared TypeScript type exports
├── next.config.ts           # Next.js configuration (minimal)
├── prisma.config.ts         # Prisma CLI configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # shadcn/ui configuration
└── package.json
```

## Directory Purposes

**`src/actions/`:**
- Purpose: All database write operations exposed as Server Actions
- Contains: One file per domain entity, each exporting `"use server"` async functions
- Key files:
  - `src/actions/expenses.ts` — `createExpense`, `deleteExpense`
  - `src/actions/cards.ts` — `createCard`, `deleteCard`, `markCyclePaid`
  - `src/actions/fixed-expenses.ts` — `createFixedExpense`, `deleteFixedExpense`
  - `src/actions/incomes.ts` — `createIncome`, `deleteIncome`

**`src/app/`:**
- Purpose: Next.js App Router — each subdirectory with `page.tsx` is a route
- Contains: Async Server Components that query Prisma directly and render UI
- Key files:
  - `src/app/layout.tsx` — root layout, renders `<MobileNav />`
  - `src/app/page.tsx` — dashboard at `/`
  - `src/app/expenses/page.tsx` — recent expenses list
  - `src/app/expenses/new/page.tsx` — new expense form page
  - `src/app/cards/page.tsx` — credit cards list
  - `src/app/cards/[id]/page.tsx` — card detail with billing cycles
  - `src/app/cards/new/page.tsx` — new card form page
  - `src/app/cash-flow/page.tsx` — biweekly cash flow projection
  - `src/app/fixed/page.tsx` — fixed expenses management
  - `src/app/incomes/page.tsx` — recurring incomes management

**`src/components/`:**
- Purpose: Reusable React components, split between interactive Client Components and display Server Components
- Contains: Form components, action buttons, navigation
- Key files:
  - `src/components/mobile-nav.tsx` — fixed bottom navigation bar (`"use client"`)
  - `src/components/expense-form.tsx` — expense entry form (`"use client"`)
  - `src/components/card-form.tsx` — credit card creation form (`"use client"`)
  - `src/components/fixed-expense-form.tsx` — fixed expense form (`"use client"`)
  - `src/components/income-entry-form.tsx` — income entry form (`"use client"`)
  - `src/components/delete-expense-button.tsx` — inline delete button (`"use client"`)
  - `src/components/delete-fixed-expense-button.tsx` — inline delete button (`"use client"`)
  - `src/components/delete-income-button.tsx` — inline delete button (`"use client"`)
  - `src/components/mark-paid-button.tsx` — mark billing cycle paid (`"use client"`)

**`src/components/ui/`:**
- Purpose: shadcn/ui component primitives — do not edit these directly
- Contains: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `dialog.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `tabs.tsx`, `textarea.tsx`
- Special: `button-variants.ts` exports `buttonVariants` separately for use in Server Components where the full `Button` client component cannot be imported

**`src/lib/`:**
- Purpose: Pure utilities, business logic, and infrastructure setup
- Key files:
  - `src/lib/prisma.ts` — Prisma singleton client using `pg` adapter
  - `src/lib/cycles.ts` — `getOrCreateCurrentCycle()` — billing cycle upsert logic
  - `src/lib/cash-flow.ts` — `buildPaymentPeriods()` — cash flow projection pure function
  - `src/lib/utils.ts` — `cn()`, `formatCurrency()` (COP/es-CO), `formatDate()` (es-CO)

**`src/types/`:**
- Purpose: Re-exports Prisma-generated types for use across the app without importing from `@/generated` directly
- Key files:
  - `src/types/index.ts` — re-exports `Category`, `CreditCard`, `BillingCycle`, `Expense`, `FixedExpense`, `Settings`, `PaymentMethod`

**`src/generated/prisma/`:**
- Purpose: Auto-generated Prisma client output — committed to repo
- Generated: Yes (by `prisma generate`)
- Committed: Yes (output is inside `src/` per `prisma.config.ts`)
- Do not edit manually

**`prisma/`:**
- Purpose: Database schema definition and seed data
- Key files:
  - `prisma/schema.prisma` — defines all models: `Category`, `CreditCard`, `BillingCycle`, `Expense`, `FixedExpense`, `Settings`, `Income`
  - `prisma/seed.ts` — seeds initial categories and settings

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` — root HTML shell, global fonts, `<MobileNav />`
- `src/app/page.tsx` — dashboard at `/`

**Configuration:**
- `prisma/schema.prisma` — database schema (source of truth for all models)
- `tsconfig.json` — TypeScript config with `@/*` → `./src/*` path alias
- `components.json` — shadcn/ui configuration (style, component paths)
- `next.config.ts` — Next.js config (currently empty/default)
- `prisma.config.ts` — Prisma CLI config

**Core Logic:**
- `src/lib/prisma.ts` — database client singleton
- `src/lib/cycles.ts` — billing cycle date logic
- `src/lib/cash-flow.ts` — biweekly projection computation
- `src/lib/utils.ts` — formatting utilities

**Testing:**
- Not present — no test files or test configuration detected

## Naming Conventions

**Files:**
- Pages: always `page.tsx` (enforced by Next.js App Router)
- Layouts: always `layout.tsx`
- Components: kebab-case matching the exported component name (e.g., `expense-form.tsx` exports `ExpenseForm`)
- Actions: kebab-case domain name (e.g., `fixed-expenses.ts`)
- Lib utilities: kebab-case (e.g., `cash-flow.ts`, `cycles.ts`)

**Directories:**
- App routes: kebab-case matching the URL segment (e.g., `cash-flow/`, `fixed/`)
- Dynamic segments: bracket notation (e.g., `cards/[id]/`)

**Exports:**
- Components: PascalCase named exports (e.g., `export function ExpenseForm`)
- Actions: camelCase named exports (e.g., `export async function createExpense`)
- Lib functions: camelCase named exports (e.g., `export function buildPaymentPeriods`)
- Types: PascalCase (e.g., `PaymentPeriod`, `PaymentMethod`)

## Where to Add New Code

**New route/page:**
- Create `src/app/<route-name>/page.tsx` as an async Server Component
- Add `export const dynamic = "force-dynamic"` at the top
- Query Prisma directly in the component body
- Add the route to the `navItems` array in `src/components/mobile-nav.tsx` if it needs a nav entry

**New write operation:**
- Add the function to the relevant file in `src/actions/` (e.g., new card operation → `src/actions/cards.ts`)
- Mark the file `"use server"` at the top
- Call `revalidatePath()` for all affected routes after the Prisma write

**New interactive component:**
- Create `src/components/<component-name>.tsx` with `"use client"` at the top
- Import the Server Action it needs from `src/actions/`
- Pass data it needs as props from the parent Server Component / page

**New UI primitive:**
- Add to `src/components/ui/` following shadcn/ui conventions
- If `buttonVariants` or similar utilities need to be shared with Server Components, extract them to a separate `.ts` file (not `.tsx`) in `src/components/ui/`

**New business logic / utility:**
- Add to `src/lib/` as a named export
- Keep it a pure function where possible (no Prisma calls) so it can be tested in isolation

**New database model:**
- Add the model to `prisma/schema.prisma`
- Run `npx prisma generate` to regenerate `src/generated/prisma/`
- Run `npx prisma db push` to apply schema changes to the database
- Re-export new types from `src/types/index.ts`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: GSD planning documents (codebase analysis, phase plans)
- Generated: Yes (by Claude agents)
- Committed: Yes

**`src/generated/`:**
- Purpose: Prisma client generated output
- Generated: Yes (by `prisma generate`)
- Committed: Yes (intentionally — output is scoped inside `src/` to work with the TypeScript path alias)

---

*Structure analysis: 2026-03-21*
