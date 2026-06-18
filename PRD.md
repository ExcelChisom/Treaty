# Product Requirements Document (PRD) - Treaty

## 1. Vision & Core Philosophy
Treaty is a mobile-first Student Lifestyle Operating System optimized for the Covenant University launch market. It handles Food, Finance (Expense Tracking), Fitness, and Schedule (FFF + Schedule), supercharged by an interactive AI agent layer named "Shreddy".

## 2. Core User Flow
1. Splash Screen & Onboarding
2. Shreddy Introduction
3. **Clerk Native Auth** — Email/Password or Social Login (Google, GitHub)
4. Base Profile Setup (via Clerk's user profile)
5. Central Dashboard

> **Auth Architecture Change (v2):** The custom 4-digit PIN + Nickname authentication
> system has been fully replaced with **Clerk** (`@clerk/nextjs`). Clerk handles all
> identity management — sessions, JWT tokens, OAuth providers, and user metadata.
> There is no custom PIN hashing, no synthetic emails, and no bcryptjs dependencies.

## 3. Feature Phasing
### Phase 1: Core Infra & Identity (Current Build)
- Next.js 16 App Router configuration with PWA manifests.
- **Clerk Authentication** — sign-up, sign-in, session management via `ClerkProvider`.
- Route guards via `clerkMiddleware()` in `proxy.ts`.
- Central Dashboard with live Clerk user data and Supabase subscription checks.
- **Shreddy Greeting Engine** — time-aware, randomised motivational AI greeting.

### Phase 2: Finance Module (Always Free)
- Localized Expense Logger across predefined categories (Food, Transport, Personal, Miscellaneous, Subscriptions).
- Live Supabase `expenses` table with daily totals and budget progress ring.
- Optimistic UI updates with server-side persistence via Server Actions.
- **Note**: No internal wallet balance or funding mechanisms. Pure cash-flow tracking.

### Phase 3: Premium Food Core (Requires Active Paystack Plan)
- Localized Covenant University vendor catalog (CAF 1, CAF 2, CMSS, Buttery) mapping prices and nutritional specs.
- Dynamic macro/calorie calculation and manual meal logs.

### Phase 4: Fitness & Schedule Modules (Premium)
- Body state projection metrics (Slim, Average, Athletic, Heavy/Curvy).
- Daily/Weekly timetable planner with integrated Telegram parsing hooks.

## 4. App Architecture & Route Mapping
- `/` - Splash Screen / Onboarding
- `/auth/register` - Clerk `<SignUp />` component (styled in Treaty dark theme)
- `/auth/login` - Clerk `<SignIn />` component (styled in Treaty dark theme)
- `/dashboard` - Central Hub (Shreddy Interface + live subscription gates)
- `/finance` - Expense tracking with live Supabase data
- `/food` - Local campus food database (Locked behind subscription)
- `/fitness` - Macro/Calorie tracker (Locked behind subscription)
- `/schedule` - Interactive calendar (Locked behind subscription)

## 5. Auth Environment Variables (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```
