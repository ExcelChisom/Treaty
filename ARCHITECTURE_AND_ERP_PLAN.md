# Treaty - Core Architecture & ERP Blueprint

## 1. Current Live System Architecture & Routing
Treaty utilizes Next.js App Router deployed on Vercel, integrating Clerk for Authentication/RBAC, Supabase PostgreSQL for the transactional relational data layer, and Paystack for localized NGN monetization processing.

### Directory Routing Tree
- `src/actions/user.ts` -> Server Actions for secure metadata orchestration.
- `src/app/layout.tsx` -> Root layout initializing ClerkProvider & CSS resets.
- `src/app/page.tsx` -> High-impact landing/splash routing.
- `src/app/onboarding/page.tsx` -> 8-step client-side user context collection funnel.
- `src/app/dashboard/page.tsx` -> Gatekeeper Server Component parsing subscriptions and rendering app modules.
- `src/app/admin/` -> Secured layout enforcing Admin role verification via server-side session checks.
- `src/app/api/webhooks/paystack/route.ts` -> Webhook verification endpoint (HMAC SHA512 validation).
- `src/lib/supabase.ts` -> Initialized Supabase client instance.
- `src/types/database.ts` -> Global TypeScript types (Food, Transaction, Task, ShreddyMessage).
- `supabase/schema.sql` -> Immutable PostgreSQL table blueprints and Covenant University food database seeding.

---

## 2. ERP System Design & Implementation Roadmap
To handle student data, transaction ledger logs, food vendor database scaling, and dynamic gamification analytics, the `/admin` path will expand into an Enterprise Resource Planning (ERP) subsystem.

### Target Routing Architecture for ERP
- `src/app/admin/layout.tsx` -> Upgraded to inject a persistent sidebar navigation system (`w-64`, fixed position).
- `src/app/admin/page.tsx` -> Global Telemetry Control Center (Live charts for signups, premium conversions, revenue analytics).
- `src/app/admin/users/page.tsx` -> Student Directory Management (Manual role assignments, transaction oversight).
- `src/app/admin/vendors/page.tsx` -> Covenant University Menu & Price Manager (Real-time updates to items, prices, macros, location metadata).
- `src/app/admin/ledger/page.tsx` -> Central Accounting Node (Wallet funding events, affiliate code payouts tracking).

### Phase 2 Execution Matrix
1. **Phase 2.1 (Layout Scaffolding):** Refactor admin layout for persistent grid-based sidebar layout navigation.
2. **Phase 2.2 (Vendor Interface):** Map `/admin/vendors` to build real-time CRUD capabilities targeting the `foods` data table.
3. **Phase 2.3 (Ledger Architecture):** Bind financial analytics pipelines to log and audit student wallet transactions safely.
