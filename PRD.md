# Product Requirements Document (PRD) - Treaty

## 1. Vision & Core Philosophy
Treaty is a mobile-first Student Lifestyle Operating System optimized for the Covenant University launch market. It handles Food, Finance (Expense Tracking), Fitness, and Schedule (FFF + Schedule), supercharged by an interactive AI agent layer named "Shreddy". 

## 2. Core User Flow
1. Splash Screen & Onboarding
2. Shreddy Introduction & Voice Selection
3. Nickname Registration & Secure 4-Digit PIN Creation
4. Base Profile Setup (Gender, Age, Height, Weight, Fitness Goals)
5. Central Dashboard

## 3. Feature Phasing
### Phase 1: Core Infra & Identity (Current Build)
- Next.js 14+ App Router configuration with PWA manifests.
- Supabase Authentication + User Metadata mapping (Nickname & Hashed PIN).
- Central Dashboard with sub-status indicators and the foundational Shreddy Greeting Engine.

### Phase 2: Finance Module (Always Free)
- Localized Expense Logger across predefined categories (Food, Transport, Personal, Miscellaneous, Subscriptions).
- **Note**: No internal wallet balance or funding mechanisms. Pure cash-flow tracking.

### Phase 3: Premium Food Core (Requires Active Paystack Plan)
- Localized Covenant University vendor catalog (CAF 1, CAF 2, CMSS, Buttery) mapping prices and nutritional specs.
- Dynamic macro/calorie calculation and manual meal logs.

### Phase 4: Fitness & Schedule Modules (Premium)
- Body state projection metrics (Slim, Average, Athletic, Heavy/Curvy).
- Daily/Weekly timetable planner with integrated Telegram parsing hooks.

## 4. App Architecture & Route Mapping
- `/` - Splash Screen / Onboarding
- `/auth/register` - Nickname and Profile initialization
- `/auth/login` - Secure PIN verification
- `/dashboard` - Central Hub (Shreddy Interface)
- `/finance` - Expense tracking and reporting layout
- `/food` - Local campus food database (Locked behind subscription)
- `/fitness` - Macro/Calorie tracker (Locked behind subscription)
- `/schedule` - Interactive calendar (Locked behind subscription)
