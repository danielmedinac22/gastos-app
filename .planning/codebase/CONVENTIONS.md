# Coding Conventions

**Analysis Date:** 2026-03-21

## Naming Patterns

**Files:**
- React component files: `kebab-case.tsx` (e.g., `expense-form.tsx`, `delete-expense-button.tsx`, `mobile-nav.tsx`)
- Utility/lib files: `kebab-case.ts` (e.g., `cash-flow.ts`, `cycles.ts`)
- Server action files: `kebab-case.ts` inside `src/actions/` (e.g., `fixed-expenses.ts`)
- UI primitive files: `kebab-case.tsx` inside `src/components/ui/`
- Extracted constants/variants: `kebab-case.ts` (e.g., `button-variants.ts`)

**React Components:**
- Named exports using PascalCase function declarations (e.g., `export function ExpenseForm(...)`)
- Default exports for Next.js page components (e.g., `export default async function Dashboard()`)
- Page components named after their route + "Page" suffix (e.g., `ExpensesPage`, `Dashboard`)

**Functions:**
- camelCase for all functions and variables
- Server actions use verb-noun naming: `createExpense`, `deleteExpense`, `markCyclePaid`, `getOrCreateCurrentCycle`
- Utility functions are descriptive: `buildPaymentPeriods`, `assignToDay`, `formatCurrency`, `formatDate`

**Variables:**
- camelCase throughout
- Descriptive names: `billingCycleId`, `cycleEndMonth`, `totalIncome`
- Short-lived loop variables use abbreviated names: `inc`, `fe`, `sum`, `i`

**Types:**
- PascalCase for `type` and exported types
- Inline prop types defined directly in component function signature as object literal
- Local-scope types defined with `type` keyword at top of file before component: `type Category = { id: string; name: string; icon: string }`
- Prisma-generated types re-exported through `src/types/index.ts`

## Code Style

**Formatting:**
- No Prettier config detected — relies on editor defaults and ESLint
- Double quotes for strings in JSX attributes
- Semicolons used inconsistently: present in some files (`src/lib/utils.ts`), absent in others (`src/components/ui/button.tsx`)
- 2-space indentation throughout

**Linting:**
- ESLint v9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Config: `eslint.config.mjs`
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)

## Import Organization

**Order:**
1. React and Next.js imports (`"use client"` / `"use server"` directive first, then imports)
2. Internal actions (`@/actions/...`)
3. Internal UI components (`@/components/...`)
4. Internal lib/utils (`@/lib/...`)
5. Generated types (`@/generated/prisma/...`)

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Always use `@/` alias for internal imports — never relative paths like `../../`

**Directive Placement:**
- `"use client"` or `"use server"` must be the very first line of the file, before all imports

## Error Handling

**Patterns:**
- Server actions have no explicit try/catch — errors bubble up to Next.js error boundaries
- Prisma uses `findUniqueOrThrow` when the record must exist (e.g., `prisma.creditCard.findUniqueOrThrow` in `src/lib/cycles.ts`)
- No custom error classes or typed error results
- Form validation is entirely HTML5 native (`required`, `min`, `type`) — no Zod schema validation in actions despite Zod being installed

## Logging

**Framework:** None — no logging library present

**Patterns:**
- No explicit logging in source code
- No `console.log` statements in production paths

## Comments

**When to Comment:**
- Block comments used to annotate logical sections within longer functions (e.g., `// Assign incomes to each period`)
- JSDoc used for complex utility functions with non-obvious logic (e.g., `getOrCreateCurrentCycle` has a `/** ... */` block explaining billing cycle logic)
- Inline `//` comments used for clarification of date arithmetic (e.g., `// 0-indexed`, `// Payment is in the month AFTER cut-off`)

**JSDoc/TSDoc:**
- Used selectively only for functions with domain-specific business logic
- Not used on React components or Server Actions

## Function Design

**Size:** Functions are kept focused and small. Page components are longer but structured with clear sections.

**Parameters:**
- Server actions accept `FormData` and parse fields inside the function body
- Pure utility/lib functions accept typed parameters
- React components accept a single typed props object

**Return Values:**
- Server actions return `void` (side-effect only, then `revalidatePath`)
- Utility functions return typed values (`string`, `PaymentPeriod[]`, etc.)
- React components return JSX

## Module Design

**Exports:**
- Named exports for all components and utilities
- Default exports only for Next.js page/layout files
- `src/types/index.ts` acts as a barrel re-exporting Prisma types

**Barrel Files:**
- Only one barrel file: `src/types/index.ts`
- UI components in `src/components/ui/` are NOT barrel-exported — import each file directly

## Server / Client Boundary

- Files that use browser APIs or hooks start with `"use client"`
- Files that run database queries or call Prisma start with `"use server"` (actions) or have no directive (Server Components)
- Server Actions live exclusively in `src/actions/`
- Client Components live in `src/components/` (non-UI) and `src/components/ui/`
- Page files in `src/app/**/page.tsx` are Server Components by default unless they declare `"use client"`

---

*Convention analysis: 2026-03-21*
