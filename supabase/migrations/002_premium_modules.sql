-- ============================================================
-- Treaty — Migration 002: Premium Module Tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
--
-- CRITICAL: This migration also PATCHES the subscriptions table
-- created by schema.sql to be Clerk-compatible.
-- The original subscriptions.user_id was UUID (Supabase auth).
-- Clerk user IDs are TEXT ("user_2abc..."). We drop the FK and
-- re-type the column, then add expires_at and a unique constraint
-- required for the Paystack webhook UPSERT.
-- ============================================================

-- ── 1. PATCH: subscriptions table for Clerk compatibility ─────────────────

-- Drop the FK to public.users (Clerk users aren't in that table)
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Change user_id from UUID to TEXT
ALTER TABLE public.subscriptions
    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Add expires_at (standardised expiry field used by the webhook + UI)
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add amount_paid (in Kobo, for audit trail)
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS amount_paid INTEGER;

-- Add unique constraint required by the webhook's ON CONFLICT upsert
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_plan_unique
    UNIQUE (user_id, plan_name);

COMMENT ON TABLE public.subscriptions IS
    'Active plan subscriptions. user_id is a Clerk TEXT ID (not Supabase UUID).';

-- ── 2. foods — Covenant University vendor catalogue ───────────────────────

CREATE TABLE IF NOT EXISTS public.foods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    vendor      TEXT NOT NULL CHECK (vendor IN ('CAF 1', 'CAF 2', 'CMSS', 'Buttery', 'Custom')),
    calories    INTEGER NOT NULL CHECK (calories >= 0),
    protein_g   DECIMAL(6,1) NOT NULL DEFAULT 0,
    carbs_g     DECIMAL(6,1) NOT NULL DEFAULT 0,
    fat_g       DECIMAL(6,1) NOT NULL DEFAULT 0,
    price_naira INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the campus vendor catalogue
INSERT INTO public.foods (name, vendor, calories, protein_g, carbs_g, fat_g, price_naira) VALUES
    -- CAF 1
    ('Jollof Rice & Chicken',   'CAF 1', 650, 38, 72, 18, 1200),
    ('Fried Rice & Beef',       'CAF 1', 600, 34, 68, 16, 1100),
    ('Egusi Soup & Eba',        'CAF 1', 780, 28, 90, 24, 1400),
    ('Beans & Plantain',        'CAF 1', 520, 22, 88, 8,  1000),
    -- CAF 2
    ('Yam Porridge & Egg',      'CAF 2', 490, 18, 75, 10, 900),
    ('Spaghetti Bolognese',     'CAF 2', 560, 30, 65, 14, 1050),
    ('Rice & Stew',             'CAF 2', 580, 26, 80, 12, 950),
    ('Akara & Ogi',             'CAF 2', 380, 16, 52, 10, 700),
    -- CMSS
    ('Club Sandwich',           'CMSS', 410, 24, 38, 16, 900),
    ('Beef Shawarma',           'CMSS', 480, 28, 44, 18, 1200),
    ('Instant Noodles (Indomie)','CMSS', 340, 10, 52, 12, 500),
    ('Egg Roll',                'CMSS', 280, 10, 30, 14, 400),
    -- Buttery
    ('Suya (Beef Skewers)',     'Buttery', 420, 42, 8,  24, 1500),
    ('Chapman Cocktail',        'Buttery', 120, 0,  30, 0,  600),
    ('Meat Pie',                'Buttery', 310, 12, 36, 14, 500),
    ('Doughnut',                'Buttery', 270, 4,  36, 12, 350)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.foods IS
    'Covenant University campus food catalogue. Seeds CAF 1, CAF 2, CMSS, Buttery.';

-- ── 3. meal_logs — user daily meal tracking ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.meal_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,           -- Clerk user ID
    food_id     UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,           -- display name (copied from foods or custom)
    meal_type   TEXT NOT NULL
                    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    calories    INTEGER NOT NULL CHECK (calories >= 0),
    protein_g   DECIMAL(6,1) NOT NULL DEFAULT 0,
    carbs_g     DECIMAL(6,1) NOT NULL DEFAULT 0,
    fat_g       DECIMAL(6,1) NOT NULL DEFAULT 0,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id ON public.meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.meal_logs IS
    'User daily meal logs. user_id is Clerk TEXT. calories and macros copied from foods or entered manually.';

-- ── 4. fitness_logs — weight, workout, steps tracking ────────────────────

CREATE TABLE IF NOT EXISTS public.fitness_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,           -- Clerk user ID
    log_type    TEXT NOT NULL
                    CHECK (log_type IN ('weight', 'workout', 'steps', 'body_measurement')),
    weight_kg   DECIMAL(5,1),            -- nullable (not all log types have weight)
    steps       INTEGER,
    duration_min INTEGER,               -- workout duration in minutes
    activity    TEXT,                   -- e.g., "Push-ups", "Run", "Swimming"
    notes       TEXT,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fitness_logs_user_id ON public.fitness_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_user_date ON public.fitness_logs(user_id, logged_at DESC);

ALTER TABLE public.fitness_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.fitness_logs IS
    'User fitness tracking (weight, workouts, steps). user_id is Clerk TEXT.';

-- ── 5. tasks — schedule & task planner ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tasks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      TEXT NOT NULL,          -- Clerk user ID
    title        TEXT NOT NULL,
    course_code  TEXT,                   -- e.g., "COS 301", nullable for personal tasks
    task_type    TEXT NOT NULL
                     CHECK (task_type IN ('assignment', 'exam', 'class', 'personal')),
    priority     TEXT NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low', 'medium', 'high')),
    due_date     DATE,
    due_time     TIME,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date ASC, is_completed);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.tasks IS
    'User schedule tasks and assignments. user_id is Clerk TEXT. course_code optional.';

-- ============================================================
-- MIGRATION 002 COMPLETE
-- ============================================================
