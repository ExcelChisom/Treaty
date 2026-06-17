# Technical Stack Matrix - Treaty

## 1. Core Framework Architecture
- Frontend: Next.js (App Router), TypeScript 5.x, TailwindCSS.
- PWA Suite: `@ducanh2912/next-pwa`.

## 2. Infrastructure Layer
- Database & Backend: Supabase PostgreSQL.
  - Tables: `users`, `subscriptions`, `transactions`, `foods`, `meal_logs`, `fitness_logs`, `tasks`, `shreddy_messages`, `referrals`, `analytics_events`.
  - **Note**: `wallets` table is completely omitted.
- Security: Row Level Security (RLS) enabled on all tables, bound to user auth contexts.

## 3. Third-Party Integrations
- Direct Billing: Paystack API Engine (Amounts processed as integers in Kobo).
- Webhook Entrypoint: `/api/paystack/webhook` (Handles subscription activation and expiration updates).
