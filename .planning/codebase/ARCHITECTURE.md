# Architecture

**Analysis Date:** 2026-03-21

## Pattern Overview

**Overall:** Next.js App Router with Server Components + Server Actions

**Key Characteristics:**
- Pages are async Server Components that query the database directly via Prisma — no API layer exists
- Mutations happen via Next.js Server Actions (`"use server"`) called from Client Components
- All routes use `export const dynamic = "force-dynamic"` to disable caching and always serve fresh data
- No global state management — UI is driven entirely by database reads on each request

## Layers

**Pages (Route Handlers):**
- Purpose: Fetch data from Prisma and render the full page UI
- Location: `src/app/`
- Contains: Async React Server Components, one `page.tsx` per route
- Depends on: `src/lib/prisma.ts`, `src/lib/utils.ts`, `src/lib/cash-flow.ts`, `src/components/`
- Used by: Next.js router (browser navigation)

**Server Actions:**
- Purpose: Handle all write operations (create, delete, update) triggered from the browser
- Location: `src/actions/`
- Contains: `"use server"` functions that accept `FormData` or typed arguments, call Prisma, then call `revalidatePath()`
- Depends on: `src/lib/prisma.ts`, `src/lib/cycles.ts`, `@/generated/prisma/client`
- Used by: Client Components in `src/components/`

**Client Components:**
- Purpose: Interactive UI elements that trigger Server Actions or require browser APIs
- Location: `src/components/` (marked with `"use client"`)
- Contains: Forms with `action={serverAction}` handlers, delete/action buttons, navigation
- Depends on: `src/actions/`, `src/components/ui/`
- Used by: Pages in `src/app/`

**Server Components (non-page):**
- Purpose: Reusable UI fragments that do not require interactivity
- Location: `src/components/` (no directive — default is server)
- Contains: Display-only components using shadcn/ui primitives

**Library / Business Logic:**
- Purpose: Reusable pure functions and shared utilities
- Location: `src/lib/`
- Contains:
  - `prisma.ts` — singleton Prisma client with pg adapter
  - `cycles.ts` — billing cycle upsert logic based on card cut-off/payment days
  - `cash-flow.ts` — `buildPaymentPeriods()` pure function for biweekly cash flow projection
  - `utils.ts` — `cn()`, `formatCurrency()` (COP locale), `formatDate()` (es-CO locale)
- Depends on: `src/lib/prisma.ts`, `@/generated/prisma/client`
- Used by: Pages and Server Actions

**Data Layer:**
- Purpose: Prisma ORM with generated client
- Location: `prisma/schema.prisma`, `src/generated/prisma/`
- Contains: Schema definitions, auto-generated TypeScript types and client
- Depends on: PostgreSQL database via `DATABASE_URL` env var
- Used by: `src/lib/prisma.ts` singleton

## Data Flow

**Read (page render):**

1. Browser navigates to a route (e.g., `/cash-flow`)
2. Next.js renders the async Server Component at `src/app/cash-flow/page.tsx`
3. Page calls `prisma.*` methods directly to fetch data (no HTTP layer)
4. Page passes data as props to child components
5. HTML is rendered server-side and sent to browser

**Write (Server Action mutation):**

1. User submits a form or clicks an action button in a Client Component
2. Client Component calls a Server Action (e.g., `createExpense(formData)`)
3. Server Action parses inputs, executes Prisma write, calls `revalidatePath()`
4. Next.js invalidates the cached page and re-renders it
5. Browser receives updated HTML

**Billing Cycle Auto-Creation:**

1. `createExpense` action detects `paymentMethod === "CARD"` with a `creditCardId`
2. Calls `getOrCreateCurrentCycle(creditCardId, date)` in `src/lib/cycles.ts`
3. Computes `startDate`, `endDate`, `paymentDate` based on card's `cutOffDay` and `paymentDay`
4. Upserts the `BillingCycle` record so no duplicate cycles are created
5. Expense is linked to the returned `billingCycleId`

**Cash Flow Projection:**

1. `src/app/cash-flow/page.tsx` fetches incomes, fixed expenses, and credit cards with unpaid billing cycles
2. Passes all data to `buildPaymentPeriods(now, incomes, fixedExpenses, cards)` in `src/lib/cash-flow.ts`
3. Pure function builds 4 biweekly periods (15th and 30th of current + next month)
4. Each item is assigned to a period using `assignToDay()` — day ≤ 15 goes to the 15th slot, else the 30th
5. Page renders the resulting `PaymentPeriod[]` array

**State Management:**
- No client-side state store. Page data is always server-fetched.
- Transient UI state (form inputs, selected category) is managed with React refs (`useRef`) and native form state

## Key Abstractions

**Server Action (mutation handler):**
- Purpose: Replaces REST API endpoints for writes
- Examples: `src/actions/expenses.ts`, `src/actions/cards.ts`, `src/actions/fixed-expenses.ts`, `src/actions/incomes.ts`
- Pattern: Accept `FormData`, parse fields manually, call Prisma, call `revalidatePath()` on affected routes

**BillingCycle:**
- Purpose: Represents one statement period for a credit card; auto-created on first expense
- Examples: `src/lib/cycles.ts`, `prisma/schema.prisma`
- Pattern: Upserted (not inserted) to prevent duplicates; keyed on `(creditCardId, startDate)`

**PaymentPeriod (cash flow):**
- Purpose: A projected biweekly snapshot of incomes vs. obligations
- Examples: `src/lib/cash-flow.ts`, `src/types/index.ts`
- Pattern: Pure function takes DB rows, returns `PaymentPeriod[]` with pre-computed totals

**Prisma Singleton:**
- Purpose: Single shared PrismaClient instance across server renders
- Examples: `src/lib/prisma.ts`
- Pattern: `globalThis` caching to avoid exhausting connections in Next.js dev hot-reload

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page renders
- Responsibilities: Font setup, global CSS, renders `<MobileNav />` as persistent bottom navigation

**Dashboard:**
- Location: `src/app/page.tsx`
- Triggers: Navigation to `/`
- Responsibilities: Aggregates monthly expense totals, active incomes, card cycle summaries, upcoming payment alerts

**New Expense Form:**
- Location: `src/app/expenses/new/page.tsx`
- Triggers: Navigation to `/expenses/new` or floating "+" nav button
- Responsibilities: Loads categories and cards, renders `<ExpenseForm />`

**Cash Flow Page:**
- Location: `src/app/cash-flow/page.tsx`
- Triggers: Navigation to `/cash-flow`
- Responsibilities: Loads data, invokes `buildPaymentPeriods()`, renders 4 biweekly projection cards

## Error Handling

**Strategy:** Minimal — relies on Next.js default error boundaries and Prisma throwing on invalid queries

**Patterns:**
- `prisma.creditCard.findUniqueOrThrow` used in `src/lib/cycles.ts` — throws 404-equivalent if card not found
- `notFound()` from `next/navigation` used in `src/app/cards/[id]/page.tsx` when card lookup returns null
- No try/catch in Server Actions — unhandled errors surface as Next.js error pages

## Cross-Cutting Concerns

**Formatting:** All currency uses `formatCurrency()` in `src/lib/utils.ts` with `es-CO` locale and COP currency. All dates use `formatDate()` with `es-CO` locale. UI text is Spanish throughout.

**Validation:** No explicit schema validation (no Zod). Server Actions parse `FormData` with manual `parseFloat`/`parseInt` casts. `required` attributes on HTML inputs provide client-side gate.

**Authentication:** None. Single-user personal finance app with no auth layer.

---

*Architecture analysis: 2026-03-21*
