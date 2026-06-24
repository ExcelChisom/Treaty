export interface Food {
  id: string;
  name: string;
  vendor: string;
  location: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  budget_tier: string;
  fitness_tag: string;
  active: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
}

export interface ShreddyMessage {
  id: string;
  category: string;
  trigger_type: string;
  response_text: string;
  tone: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  food_id: string;
  quantity: number;
  consumed_at: string;
}
