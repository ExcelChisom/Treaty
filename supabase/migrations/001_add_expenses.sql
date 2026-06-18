-- ============================================================
-- Treaty — Migration 001: Expenses Table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
-- 
-- WHY THIS TABLE EXISTS:
--   The existing `transactions` table is reserved for Paystack
--   payment events (immutable ledger of subscription purchases).
--   User expense tracking requires a separate, mutable table.
--
-- KEY DESIGN DECISION:
--   `user_id` is TEXT (not UUID) because Treaty now uses Clerk
--   for authentication. Clerk user IDs are strings like
--   "user_2abc123..." and are not stored in auth.users.
--   Standard Supabase RLS (auth.uid()) does not apply here —
--   all expense operations go through the service role client.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,                           -- Clerk user ID
    amount      INTEGER NOT NULL CHECK (amount > 0),     -- in Naira (whole numbers)
    category    TEXT NOT NULL
                    CHECK (category IN ('Food', 'Transport', 'Personal', 'Misc', 'Subs')),
    note        TEXT,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.expenses IS
    'User daily expense tracking. user_id is a Clerk text ID, not a Supabase UUID.';

COMMENT ON COLUMN public.expenses.amount IS
    'Expense amount in Nigerian Naira (whole numbers). Not in Kobo.';

COMMENT ON COLUMN public.expenses.user_id IS
    'Clerk authentication user ID. Format: user_xxxxxxxxxxxxxxxx';

-- Indexes for the most common query: user + date range
CREATE INDEX IF NOT EXISTS idx_expenses_user_id  ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_logged_at ON public.expenses(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, logged_at DESC);

-- Enable RLS (all queries use service role which bypasses this,
-- but it's good practice to enable it for future Clerk-Supabase JWT integration)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
