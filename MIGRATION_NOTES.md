# Modular Monolith Migration Notes & Audit Log

**Project**: Orchestra (Programmable ATM Card Orchestration Platform)  
**Stack**: Next.js 16 (Turbopack, App Router, React 19) + Express.js 4.22 (ESM) + MongoDB / Mongoose 9.3  
**Migration Target**: Modular Monolith organized by business domain with clear boundaries and elevated code quality.

---

## Migration Phase Log

| Phase | Description | Status | Sign-off Date |
|---|---|---|---|
| **Phase 0** | Full-System Orientation (Read-only baseline) | **Completed** | Approved |
| **Phase 1** | Domain Boundary Discovery | **Completed** | Approved |
| **Phase 2** | Target Architecture Design | **In Review** | Pending Confirmation |
| **Phase 3** | Backend Migration (Module by Module) | Queued | Pending Phase 2 Approval |
| **Phase 4** | Frontend Alignment | Queued | Pending Phase 3 Completion |
| **Phase 5** | Code Quality Pass | Queued | Pending Phase 4 Completion |
| **Phase 6** | MongoDB & Data-Layer Review | Queued | Pending Phase 5 Completion |
| **Phase 7** | Production-Readiness Pass | Queued | Pending Phase 6 Completion |

---

## Phase 0 Baseline Findings & Inventory

### 1. Repository Layout & Runtime Baseline
- **Structure**: Single Git repository containing two separate directories: `/backend` and `/frontend`.
- **Backend**:
  - Node.js ESM (`"type": "module"`), Express 4.22.1, Mongoose 9.3.3.
  - Entry points: `src/server.js` (port listener), `src/app.js` (Express app setup with middleware & route mounting).
  - Scripts: `start`, `dev` (nodemon), `seed` (seed script), `test` (jest invocation - missing jest dev dependency), `lint` (eslint invocation - missing eslint dev dependency).
  - Current Test Status: `npm test` fails with `Cannot find module '.../jest'`. No test runner or jest installed in `devDependencies`. Two test files exist in `src/services/__tests__/` (`anomaly.test.js`, `routing.test.js`).
  - Current Lint Status: `npm run lint` fails because `eslint` is not installed in backend `node_modules`.
- **Frontend**:
  - Next.js 16.2.1 (App Router), React 19.2.4, TypeScript 5.9.3, Tailwind CSS, TanStack React Query 5.95, Framer Motion, Radix/Base-UI/shadcn.
  - Scripts: `dev`, `build` (next build), `start`, `lint` (eslint with eslint-config-next).
  - Build Status: `npm run build` succeeds (Turbopack production build compiled and TypeScript passed cleanly).
  - Test Status: No test suite configured (no test script in package.json, 0 test files).
  - Lint Status: `npm run lint` reported 51 problems (30 errors, 21 warnings) mostly around `@typescript-eslint/no-explicit-any`, `react-hooks/set-state-in-effect`, and unused variables.

### 2. API Communication & Frontend Consumption Pattern
- **Centralized vs Scattered**:
  - An `api-client/` directory exists with Axios endpoints (`auth.ts`, `cards.ts`, `routing.ts`, `virtual-cards.ts`, `business.ts`, `transactions.ts`).
  - React Query hooks exist in `hooks/` for auth, cards, routing, transactions, virtual-cards.
  - However, direct `fetchWithAuth('/api/...')` calls from `lib/fetch-utils.ts` are scattered across 18+ client components and dashboard pages.
  - Hardcoded production URL (`https://orchestra-y8vf.onrender.com`) is currently set as the fallback/default in both `client.ts`, `axios.ts`, and `fetch-utils.ts`.
- **Rendering Model**:
  - Next.js App Router with Route Groups: `(auth)`, `(dashboard)`, `(landing)`.
  - Almost all data-fetching pages are `'use client'` components fetching on mount or via user actions.

---

## Phase 1 Candidate Domain Boundaries & Boundary Violations

### Approved Modules
1. **`auth`**: Identity, credentials, JWT issue/revocation, user profile.
2. **`cards`**: Physical/linked bank card management, Card360 / mock provider, balance cache.
3. **`routing`**: Payment routing engine, multi-card split optimization, routing rules, payment simulation.
4. **`virtual-cards`**: Disposable / subscription virtual cards, limits, auto-renew, funding/top-ups.
5. **`business`**: Corporate expense cards, department budgets, approval workflows and audit queues.
6. **`transactions`**: Central transaction ledger, bank transfers, bill payments.
7. **`insights`**: Spending analysis, LLM advisory chat, financial health score, anomaly detection, export reports.

### Flagged Boundary Violations in Current Codebase
- **`routing` -> `cards` & `transactions`**:
  - `services/routing.js` directly queries `Card` and calls `card360.getBalance` instead of using `cards.service.js`.
  - `routing.controller.js` directly instantiates `Transaction` and calls `detectAnomalies`.
- **`virtual-cards` -> `cards` & `transactions`**:
  - `virtualCards.controller.js` directly queries `Card`, `CardBalance`, `card360`, and creates `Transaction` records during top-up.
- **`business` -> `routing`, `cards`, `transactions`**:
  - `business.controller.js` directly reaches into `RoutingRule`, `Card`, `CardBalance`, and `Transaction` during approval resolution.
- **`transfers` & `bills` -> `cards` & `transactions`**:
  - `transfers.controller.js` & `bills.controller.js` directly query `Card`, inspect/mutate `CardBalance`, and insert `Transaction` records.
- **`chat` & `insights` & `anomalies` -> `transactions`**:
  - Direct database queries and mutations on `Transaction` (`scanUserAnomalies` directly modifies `isAnomaly` on `Transaction` records).

---

## Phase 2 Target Architecture Design

### Target Module Structure
Each module in `src/modules/<domain>/` encapsulates:
- `<domain>.routes.js`: HTTP routing, auth/role middleware, request validation schema attachment.
- `<domain>.controller.js`: Request parsing, service invocation, HTTP status response serialization.
- `<domain>.service.js`: Domain business logic, database queries/mutations, cross-module service calls.
- `<domain>.schemas.js`: Module-specific Zod schemas.
- `models/`: Mongoose schemas owned strictly by this module.
- `index.js`: Public barrel exporting the route router and public service interface.

### Inter-Module Contract Standard
- No module imports another module's Mongoose model directly.
- All cross-module interactions occur via explicit service methods.

---

## Running Log of Decisions, Assumptions & Deferred Items

### Assumptions
- All monetary amounts in MongoDB models are stored as integers (kobo for NGN).

### Deferred Items for Later Phases
- **Phase 3/5**: Add backend test runner and ESLint runner.
- **Phase 4**: Unify frontend data fetching to domain-specific clients.
- **Phase 5**: Resolve ESLint violations.
- **Phase 6**: Add schema validation, compound indexes, `.lean()` optimizations, and transaction boundaries.
