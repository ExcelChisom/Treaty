-- PostgreSQL schema and seed data for Treaty Phase 2

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Foods Table
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vendor TEXT NOT NULL,
  location TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  calories INTEGER DEFAULT 0,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fats INTEGER DEFAULT 0,
  budget_tier TEXT,
  fitness_tag TEXT,
  active BOOLEAN DEFAULT true
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false
);

-- Shreddy Messages Table
CREATE TABLE IF NOT EXISTS shreddy_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  response_text TEXT NOT NULL,
  tone TEXT NOT NULL
);

-- Meal Logs Table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  food_id UUID REFERENCES foods(id),
  quantity INTEGER DEFAULT 1,
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data for Foods (Covenant University Menu)
INSERT INTO foods (name, price, vendor, category, budget_tier, fitness_tag)
VALUES 
  ('Gizdodo', 2000, 'Cafe 1', 'Main Meal', 'Medium', 'High Carb'),
  ('Plantain & Egg Sauce', 3200, 'Cafe 1', 'Main Meal', 'Premium', 'Moderate Energy'),
  ('Fish & Chips', 2500, 'Cafe 1', 'Main Meal', 'Medium', 'High Calorie'),
  ('Chicken Burger', 2500, 'MORH', 'Burger', 'Medium', 'Cheat Meal');
