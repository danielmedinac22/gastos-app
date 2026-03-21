# Testing Patterns

**Analysis Date:** 2026-03-21

## Test Framework

**Runner:** Not configured

No test framework is installed. The `package.json` contains no test runner (`jest`, `vitest`, `playwright`, etc.) and there are no test configuration files (`jest.config.*`, `vitest.config.*`) in the project root.

**Assertion Library:** None

**Run Commands:**
```bash
# No test command available
# npm test → not defined in package.json scripts
```

## Test File Organization

**Location:** No test files exist anywhere in the codebase.

**Naming:** Not applicable — no pattern established.

## Test Structure

No test suites exist. No patterns to document.

## Mocking

**Framework:** None installed.

## Fixtures and Factories

**Test Data:** None — the project uses `prisma/seed.ts` to seed a real database for development. There are no in-memory fixtures or factory functions.

**Seed script location:** `prisma/seed.ts` (run via `npm run db:seed` or automatically on `npm start`)

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present.

## Current Verification Approach

Testing is manual. The development workflow relies on:
- `npm run dev` for local development
- `prisma/seed.ts` to populate a real PostgreSQL database with sample data
- Browser-based manual verification

## Adding Tests

If tests are added to this project, the recommended approach given the stack (Next.js 16, React 19, TypeScript strict):

**Unit testing for pure logic** (`src/lib/cash-flow.ts`, `src/lib/cycles.ts`):
- Use `vitest` — compatible with TypeScript, no transform config needed, works with ESM
- Test `buildPaymentPeriods` and `getOrCreateCurrentCycle` logic in isolation
- Mock Prisma client using `vitest-mock-extended` or manual mocks

**Integration/E2E testing for UI flows**:
- Use `playwright` for browser-based testing
- Critical paths: expense creation, card payment marking, cash flow display

**Suggested config file location:**
- `vitest.config.ts` at project root
- Test files co-located with source: `src/lib/cash-flow.test.ts`

**Suggested install:**
```bash
npm install -D vitest @vitest/coverage-v8
```

---

*Testing analysis: 2026-03-21*
