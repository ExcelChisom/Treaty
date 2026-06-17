-- ============================================================
-- Treaty — Supabase PostgreSQL Schema
-- Version: 1.0.0 (Phase 1 — Core Infra & Identity)
-- 
-- IMPORTANT: wallets table is INTENTIONALLY OMITTED.
-- All payments route directly through Paystack to the
-- application owner. This file manages subscriptions only.
--
-- Run this entire file in Supabase SQL Editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()


-- ────────────────────────────────────────────────────────────
-- TABLE: users
-- Stores Treaty-specific profile data linked to auth.users.
-- The id mirrors auth.users.id (UUID).
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname      TEXT NOT NULL UNIQUE,
    pin_hash      TEXT NOT NULL,                        -- bcrypt hash of 4-digit PIN
    gender        TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
    age           SMALLINT CHECK (age BETWEEN 13 AND 120),
    height_cm     NUMERIC(5, 2),                        -- e.g. 175.50 cm
    weight_kg     NUMERIC(5, 2),                        -- e.g. 72.00 kg
    goal          TEXT CHECK (goal IN (
                      'lose_weight', 'maintain', 'gain_muscle',
                      'improve_fitness', 'eat_healthy'
                  )),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS
    'Treaty user profiles — extends auth.users with app-specific metadata.';
COMMENT ON COLUMN public.users.pin_hash IS
    'bcrypt-hashed 4-digit PIN. Never store raw PIN.';


-- ────────────────────────────────────────────────────────────
-- TABLE: subscriptions
-- Active plan entitlements per user. Populated by Paystack
-- webhook at /api/paystack/webhook after payment verification.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_type            TEXT NOT NULL CHECK (plan_type IN ('food', 'fitness', 'schedule', 'shreddy', 'bundle')),
    status               TEXT NOT NULL DEFAULT 'inactive'
                             CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
    paystack_reference   TEXT UNIQUE,                   -- Paystack transaction ref
    amount_kobo          INTEGER,                       -- amount paid in Kobo (100 Kobo = ₦1)
    started_at           TIMESTAMPTZ,
    expires_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS
    'User subscription entitlements. Managed by Paystack webhook.';
COMMENT ON COLUMN public.subscriptions.amount_kobo IS
    'Payment amount in Kobo. 100 Kobo = ₦1 NGN.';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status     ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);


-- ────────────────────────────────────────────────────────────
-- TABLE: transactions
-- Immutable ledger of Paystack payment verification events.
-- Records are INSERT-only — never updated.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    paystack_reference   TEXT NOT NULL UNIQUE,          -- Paystack transaction reference hash
    paystack_event       TEXT NOT NULL,                 -- e.g. 'charge.success', 'subscription.disable'
    plan_type            TEXT CHECK (plan_type IN ('food', 'fitness', 'schedule', 'shreddy', 'bundle')),
    amount_kobo          INTEGER NOT NULL,
    currency             TEXT NOT NULL DEFAULT 'NGN',
    status               TEXT NOT NULL CHECK (status IN ('success', 'failed', 'abandoned', 'reversed')),
    channel              TEXT,                          -- e.g. 'card', 'bank', 'ussd'
    metadata             JSONB DEFAULT '{}',            -- raw Paystack payload snapshot
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS
    'Immutable Paystack payment event log. INSERT only — do not UPDATE rows.';

CREATE INDEX IF NOT EXISTS idx_transactions_user_id  ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status   ON public.transactions(status);


-- ────────────────────────────────────────────────────────────
-- TABLE: foods
-- Covenant University campus vendor food catalog.
-- Populated by admin; read-only for regular users.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.foods (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    vendor        TEXT NOT NULL CHECK (vendor IN ('CAF_1', 'CAF_2', 'CMSS', 'Buttery', 'Other')),
    category      TEXT CHECK (category IN (
                      'breakfast', 'lunch', 'dinner',
                      'snack', 'drink', 'side'
                  )),
    price_kobo    INTEGER NOT NULL CHECK (price_kobo >= 0),  -- price in Kobo
    calories      NUMERIC(7, 2),                             -- kcal
    protein_g     NUMERIC(6, 2),                             -- grams
    carbs_g       NUMERIC(6, 2),
    fat_g         NUMERIC(6, 2),
    fiber_g       NUMERIC(6, 2),
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.foods IS
    'Covenant University campus food vendor catalog with nutritional data.';

CREATE INDEX IF NOT EXISTS idx_foods_vendor   ON public.foods(vendor);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category);


-- ────────────────────────────────────────────────────────────
-- TABLE: meal_logs
-- User's daily food consumption logs. Premium feature.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meal_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    food_id       UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    food_name     TEXT NOT NULL,                        -- denormalized for deleted food records
    quantity      NUMERIC(5, 2) NOT NULL DEFAULT 1,
    unit          TEXT DEFAULT 'serving',
    calories      NUMERIC(7, 2),                        -- computed at log time
    protein_g     NUMERIC(6, 2),
    carbs_g       NUMERIC(6, 2),
    fat_g         NUMERIC(6, 2),
    meal_type     TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    notes         TEXT,
    logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.meal_logs IS
    'User daily meal consumption tracking. Requires Food subscription.';

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id    ON public.meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_logged_at  ON public.meal_logs(logged_at DESC);


-- ────────────────────────────────────────────────────────────
-- TABLE: fitness_logs
-- Exercise and activity tracking. Premium feature.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fitness_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    exercise_name     TEXT NOT NULL,
    category          TEXT CHECK (category IN (
                          'cardio', 'strength', 'flexibility',
                          'sports', 'walk', 'other'
                      )),
    duration_mins     NUMERIC(6, 2),
    distance_km       NUMERIC(7, 3),
    sets              SMALLINT,
    reps              SMALLINT,
    weight_kg         NUMERIC(6, 2),
    calories_burned   NUMERIC(7, 2),
    body_state        TEXT CHECK (body_state IN ('slim', 'average', 'athletic', 'heavy_curvy')),
    notes             TEXT,
    logged_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.fitness_logs IS
    'User exercise and activity log. Requires Fitness subscription.';

CREATE INDEX IF NOT EXISTS idx_fitness_logs_user_id   ON public.fitness_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_logged_at ON public.fitness_logs(logged_at DESC);


-- ────────────────────────────────────────────────────────────
-- TABLE: tasks
-- Schedule module — personal task and timetable items.
-- Premium feature.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ,
    due_time        TIME,
    priority        TEXT NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category        TEXT CHECK (category IN (
                        'class', 'assignment', 'exam', 'personal',
                        'fitness', 'meal_prep', 'other'
                    )),
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    source          TEXT DEFAULT 'manual'
                        CHECK (source IN ('manual', 'telegram_import', 'shreddy')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tasks IS
    'User task and schedule entries. Supports Telegram import. Requires Schedule subscription.';

CREATE INDEX IF NOT EXISTS idx_tasks_user_id      ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date     ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON public.tasks(is_completed);


-- ────────────────────────────────────────────────────────────
-- TABLE: shreddy_messages
-- Conversation history between user and Shreddy AI.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shreddy_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role          TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content       TEXT NOT NULL,
    context_type  TEXT CHECK (context_type IN (
                      'greeting', 'food_advice', 'fitness_tip',
                      'schedule_help', 'general', 'finance_tip'
                  )),
    tokens_used   INTEGER,                              -- for AI usage tracking
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.shreddy_messages IS
    'Shreddy AI conversation thread per user. Ordered by created_at.';

CREATE INDEX IF NOT EXISTS idx_shreddy_user_id    ON public.shreddy_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_shreddy_created_at ON public.shreddy_messages(created_at DESC);


-- ────────────────────────────────────────────────────────────
-- TABLE: referrals
-- User referral tracking for growth mechanics.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_user_id  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    referral_code     TEXT NOT NULL UNIQUE,
    status            TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
    reward_type       TEXT,                             -- e.g. '7_day_extension', 'discount'
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMPTZ,
    CONSTRAINT no_self_referral CHECK (referrer_user_id != referred_user_id)
);

COMMENT ON TABLE public.referrals IS
    'User referral program tracking. referrer earns rewards when referred user subscribes.';

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code     ON public.referrals(referral_code);


-- ────────────────────────────────────────────────────────────
-- TABLE: analytics_events
-- Behavioral event log for product analytics. Append-only.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- nullable for anonymous
    event_name    TEXT NOT NULL,                        -- e.g. 'page_view', 'meal_logged', 'pin_entered'
    properties    JSONB DEFAULT '{}',                   -- arbitrary key-value event metadata
    session_id    TEXT,                                 -- client session identifier
    platform      TEXT DEFAULT 'web'
                      CHECK (platform IN ('web', 'pwa', 'android', 'ios')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.analytics_events IS
    'Product analytics event stream. Append-only — do not UPDATE rows.';

CREATE INDEX IF NOT EXISTS idx_analytics_user_id    ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on every table. Authenticated users can only
-- access rows where user_id = auth.uid().
-- Service role (used by webhook) bypasses RLS automatically.
-- ============================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shreddy_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events  ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: users
-- ────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: subscriptions
-- ────────────────────────────────────────────────────────────
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: transactions (read-only for users)
-- Inserts performed by service role via webhook only.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: foods (public read, admin-only write)
-- Any authenticated user can read the food catalog.
-- Writes are blocked for non-service-role users.
-- ────────────────────────────────────────────────────────────
CREATE POLICY "foods_select_authenticated" ON public.foods
    FOR SELECT USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: meal_logs
-- ────────────────────────────────────────────────────────────
CREATE POLICY "meal_logs_select_own" ON public.meal_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_logs_insert_own" ON public.meal_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_logs_update_own" ON public.meal_logs
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_logs_delete_own" ON public.meal_logs
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: fitness_logs
-- ────────────────────────────────────────────────────────────
CREATE POLICY "fitness_logs_select_own" ON public.fitness_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "fitness_logs_insert_own" ON public.fitness_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fitness_logs_update_own" ON public.fitness_logs
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fitness_logs_delete_own" ON public.fitness_logs
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: tasks
-- ────────────────────────────────────────────────────────────
CREATE POLICY "tasks_select_own" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: shreddy_messages
-- ────────────────────────────────────────────────────────────
CREATE POLICY "shreddy_select_own" ON public.shreddy_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "shreddy_insert_own" ON public.shreddy_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: referrals
-- ────────────────────────────────────────────────────────────
CREATE POLICY "referrals_select_own" ON public.referrals
    FOR SELECT USING (
        auth.uid() = referrer_user_id
        OR auth.uid() = referred_user_id
    );

CREATE POLICY "referrals_insert_own" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "referrals_update_own" ON public.referrals
    FOR UPDATE USING (auth.uid() = referrer_user_id)
    WITH CHECK (auth.uid() = referrer_user_id);


-- ────────────────────────────────────────────────────────────
-- RLS POLICIES: analytics_events (insert-only for users)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "analytics_insert_own" ON public.analytics_events
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "analytics_select_own" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);


-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Auto-updates updated_at timestamp on row changes.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_foods_updated_at
    BEFORE UPDATE ON public.foods
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- NEW USER HANDLER
-- Automatically creates a public.users row when a new
-- auth.users entry is created via Supabase Auth.
-- This fires AFTER INSERT on auth.users.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert shell row; nickname & pin_hash populated by
    -- the /api/auth/register Route Handler in the same transaction.
    INSERT INTO public.users (id, nickname, pin_hash)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || LEFT(NEW.id::TEXT, 8)),
        COALESCE(NEW.raw_user_meta_data->>'pin_hash', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================
-- SCHEMA COMPLETE
-- Tables: users, subscriptions, transactions, foods,
--         meal_logs, fitness_logs, tasks, shreddy_messages,
--         referrals, analytics_events
-- wallets table: OMITTED (by design — no internal wallet)
-- ============================================================
