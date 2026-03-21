# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**`totalAmount` is a denormalized field that is never updated:**
- Issue: `BillingCycle.totalAmount` is initialized to `0` at cycle creation in `src/lib/cycles.ts:76` and is never incremented or recalculated when expenses are added, edited, or deleted. The "upcoming payments" section on the dashboard (`src/app/page.tsx:175`) and the cash-flow page (`src/app/cash-flow/page.tsx:42`) read this field directly, so those displays always show `$0` for cycle payment amounts until a cycle is somehow externally updated.
- Files: `src/lib/cycles.ts`, `src/actions/expenses.ts`, `src/app/page.tsx`, `src/app/cash-flow/page.tsx`
- Impact: Dashboard "Próximos pagos" card always shows `$0` amounts. Cash-flow card payment projections are always `$0` for the matched cycle. The cards list and card detail page work around this by summing `expenses` directly rather than using `totalAmount`, masking the inconsistency.
- Fix approach: In `createExpense` and `deleteExpense` (and any future edit action), use a Prisma `$transaction` to increment/decrement `totalAmount` on the associated `BillingCycle` after writing the expense. Alternatively, remove `totalAmount` from the schema and always derive the value from `expenses` via aggregation.

**`isClosed` is never set to `true` anywhere in the codebase:**
- Issue: `BillingCycle.isClosed` is created as `false` (`src/lib/cycles.ts:78`) and there is no action or scheduled job to flip it. The card detail page (`src/app/cards/[id]/page.tsx:72-81`) branches on `isClosed` to show "Por pagar" / "Marcar pagado" UI, but that branch is unreachable because `isClosed` never becomes `true`. The cash-flow page also relies on this flag (`src/app/cash-flow/page.tsx:44`).
- Files: `src/lib/cycles.ts`, `src/app/cards/[id]/page.tsx`, `src/actions/cards.ts`
- Impact: Billing cycles are never automatically closed at cut-off date. The "Por pagar" badge and "Marcar pagado" button are never shown. Card payment projections in cash-flow that depend on `isClosed` cycles are incorrect.
- Fix approach: Add a `closeCycle` server action or scheduled route that sets `isClosed = true` on cycles past their `endDate`. Alternatively, compute closed status dynamically at read time: `endDate < today` implies closed.

**No input validation — all server actions trust raw `FormData`:**
- Issue: Every server action in `src/actions/` calls `formData.get(...)` and immediately passes the result to `parseFloat`, `parseInt`, or casts directly with `as string`, without any schema validation. There is no guard against `NaN`, negative amounts, `dayOfMonth` outside 1-28, or missing required fields.
- Files: `src/actions/expenses.ts`, `src/actions/cards.ts`, `src/actions/fixed-expenses.ts`, `src/actions/incomes.ts`
- Impact: A malformed form submission (e.g., non-numeric amount, empty categoryId) will attempt a Prisma write with `NaN` or `null`, throwing an unhandled server error with no user-facing message. `zod` is already listed as a dependency in `package.json` but is unused.
- Fix approach: Add Zod schemas at the top of each action file and call `.safeParse()` before any DB writes. Return structured error objects for use with `useActionState` or redirect with error params.

**`Settings` model exists but is unused in the UI:**
- Issue: The schema (`prisma/schema.prisma:110-115`) defines a `Settings` model with a `monthlyIncome` field, and the seed creates a `default` row. However, no page or action reads or writes this model. The app uses a separate `Income` model for income tracking, making `Settings.monthlyIncome` a dead field.
- Files: `prisma/schema.prisma`, `prisma/seed.ts`
- Impact: Cognitive overhead; misleads future developers about the income source of truth. The `monthlyIncome` field is 0 and ignored.
- Fix approach: Either remove the `Settings` model and its seed entry, or repurpose it (e.g., store currency preference, locale setting). Do not leave it as dead schema.

**`bcryptjs` and `recharts` are installed but entirely unused:**
- Issue: `package.json` lists `bcryptjs@^3.0.3` and `recharts@^3.8.0` as production dependencies. No file in `src/` imports either package.
- Files: `package.json`
- Impact: Unnecessary bundle weight (recharts is large); `bcryptjs` implies auth was planned but not implemented, adding confusion about the security model.
- Fix approach: Run `npm uninstall bcryptjs recharts` unless there is an imminent plan to use them.

**Expenses list has a hard `take: 50` cap with no pagination:**
- Issue: `src/app/expenses/page.tsx:16` fetches at most 50 expenses. There is no "load more", infinite scroll, or page navigation. Older expenses become permanently invisible.
- Files: `src/app/expenses/page.tsx`
- Impact: Users who record more than 50 expenses lose history visibility silently — no indicator that records are truncated.
- Fix approach: Add server-side pagination (page param in URL) or a cursor-based "load more" pattern. At minimum, show a count of total expenses vs. displayed.

**Card detail page loads only the last 3 billing cycles:**
- Issue: `src/app/cards/[id]/page.tsx:24` uses `take: 3`, so only the 3 most recent cycles are shown with no way to see older ones.
- Files: `src/app/cards/[id]/page.tsx`
- Impact: Historical expense data on a card is inaccessible after 3 cycles.
- Fix approach: Same as expenses — add pagination or a "show more cycles" control.

## Security Considerations

**No authentication or authorization:**
- Risk: The app has no login system. All routes, server actions, and data are accessible to anyone who can reach the server. `bcryptjs` being present suggests auth was considered but not implemented.
- Files: `src/app/layout.tsx`, all `src/actions/*.ts` files
- Current mitigation: None. The app appears to be single-user and locally hosted.
- Recommendations: If the app is ever exposed beyond localhost, add session-based or token-based auth. At minimum, environment-gate via middleware.

**No CSRF protection on server actions:**
- Risk: Next.js Server Actions include built-in same-origin checks, but there is no explicit CSRF token validation or `origin` header enforcement at the application layer.
- Files: All `src/actions/*.ts` files
- Current mitigation: Next.js framework-level same-origin enforcement applies.
- Recommendations: Acceptable for current single-user scope; revisit if auth and multi-user access are added.

**`DATABASE_URL` consumed without validation at startup:**
- Risk: `src/lib/prisma.ts:8` passes `process.env.DATABASE_URL` directly to `pg.Pool`. If the env var is undefined, the pool is created with `connectionString: undefined`, which silently fails at query time rather than crashing at startup with a clear error.
- Files: `src/lib/prisma.ts`
- Current mitigation: `prisma db push` in the start script (`package.json`) would fail first, providing indirect feedback.
- Recommendations: Add an explicit startup check: `if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required")`.

## Performance Bottlenecks

**Dashboard makes 5 parallel DB queries on every page load:**
- Problem: `src/app/page.tsx:15` uses `Promise.all` for 5 queries. Each page view (the default route) hits the database 5 times. With `export const dynamic = "force-dynamic"`, there is no caching.
- Files: `src/app/page.tsx`
- Cause: No React cache, no ISR, pure dynamic rendering.
- Improvement path: Consider `unstable_cache` for slow-changing data (incomes, fixed expenses, cards) with a short TTL. Real-time data (month expenses, upcoming cycles) can stay dynamic.

**Cash-flow page loads all billing cycles for 2 months on every render:**
- Problem: `src/app/cash-flow/page.tsx` is fully dynamic and queries `billingCycles` with a 2-month date range on every visit.
- Files: `src/app/cash-flow/page.tsx`
- Cause: `export const dynamic = "force-dynamic"` with no caching layer.
- Improvement path: Same as dashboard — apply `unstable_cache` with revalidation on mutation.

## Fragile Areas

**`getOrCreateCurrentCycle` billing cycle date logic:**
- Files: `src/lib/cycles.ts`
- Why fragile: The start/end/payment date calculations involve multiple manual month arithmetic operations (lines 29-60). Edge cases include months with fewer than `cutOffDay` days (e.g., cutOffDay = 31 in February), and the `startDate` calculation uses `card.cutOffDay + 1` which can produce day 29 in February or day 32.
- Safe modification: Always test with cards where `cutOffDay` is 28, 29, 30, 31, and with expense dates in January (month boundary), November→December, and February.
- Test coverage: None. No tests exist in the codebase.

**`assignToDay` in `src/lib/cash-flow.ts` uses a hard-coded biweekly split:**
- Files: `src/lib/cash-flow.ts:44-46`
- Why fragile: The function maps any `dayOfMonth <= 15` to period day 15 and everything else to 30. A fixed expense due on day 16 is placed in the "30" period even if the actual month has 31 days and the payment falls on a different week. This is a business logic simplification that breaks for months where day 30 doesn't exist (February) — `new Date(year, 1, 30)` silently overflows to March 2.
- Safe modification: Verify February behavior before relying on cash-flow projections for February payments.
- Test coverage: None.

**Delete actions have no confirmation and are irreversible:**
- Files: `src/components/delete-expense-button.tsx`, `src/components/delete-fixed-expense-button.tsx`, `src/components/delete-income-button.tsx`
- Why fragile: Each delete button calls the server action directly on click with no confirmation dialog. `deleteExpense` performs a hard `prisma.expense.delete`, not a soft delete. Data is permanently lost.
- Safe modification: Wrap delete in a confirmation dialog (shadcn `AlertDialog`) before executing the action.
- Test coverage: None.

**`ExpenseForm` card selector is always visible when `paymentMethod = CASH`:**
- Files: `src/components/expense-form.tsx:118-134`
- Why fragile: The credit card `<select>` is rendered whenever `cards.length > 0` regardless of the selected `paymentMethod`. A user can submit a CASH expense with a `creditCardId` populated. In `createExpense` (`src/actions/expenses.ts:18`), the cycle lookup is gated on `paymentMethod === "CARD"`, so the cycle is skipped — but `creditCardId` is still written to the expense record, creating inconsistent data (a CASH expense linked to a card).
- Safe modification: Show/hide the card selector based on selected payment method (requires converting to controlled state or using CSS visibility keyed on the radio value).
- Test coverage: None.

## Missing Critical Features

**No way to close a billing cycle manually or automatically:**
- Problem: The `isClosed` flag on `BillingCycle` has no mechanism to become `true`. There is no action, button, cron job, or middleware to close cycles past their `endDate`.
- Blocks: The "Por pagar" badge and "Marcar pagado" flow on the card detail page; correct cash-flow projections for closed/upcoming cycles.

**No edit capability for any record type:**
- Problem: Expenses, fixed expenses, incomes, and cards can only be created or deleted. There is no edit/update flow for any entity.
- Blocks: Correcting typos, updating amounts for inflation, changing billing dates without delete-and-recreate.

## Test Coverage Gaps

**Zero test coverage across the entire codebase:**
- What's not tested: All server actions, all business logic in `src/lib/cycles.ts` and `src/lib/cash-flow.ts`, all UI components, all page data fetching.
- Files: All `src/` files. No test runner config, no `*.test.*` or `*.spec.*` files exist.
- Risk: Billing cycle date arithmetic bugs, cash-flow calculation errors, and data mutation edge cases (concurrent cycle creation, invalid form data) go undetected.
- Priority: High — the billing cycle and cash-flow logic is non-trivial date math with real financial consequences.

---

*Concerns audit: 2026-03-21*
