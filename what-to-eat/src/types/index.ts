export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'meat' | 'vegetable' | 'dessert';
  image: string;
  ingredients: Ingredient[];
  steps: string[];
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  calories?: number;
  isFavorite: boolean;
  createdAt: number;
}

export interface Recommendation {
  id: string;
  date: number;
  recipes: [Recipe, Recipe, Recipe];
  isFavorite: boolean;
  note: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
}

export interface HealthyFood {
  id: string;
  name: string;
  category: 'grain' | 'protein' | 'vegetable' | 'fruit' | 'other';
  image: string;
  gi?: number;
  giLevel: 'low' | 'medium' | 'high';
  calories: number;
  protein: number;
  carbs: number;
  fiber?: number;
  benefits: string[];
  suitable: string[];
  tips: string;
  recipes?: string[];
}

export interface Meal {
  name: string;
  foods: { name: string; amount: string }[];
  calories: number;
  nutrition: { protein: number; carbs: number; fat: number; fiber: number };
  tags: string[];
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal;
}

export interface WeeklyPlan {
  week: string;
  days: DayPlan[];
}

export interface NutritionTip {
  id: string;
  title: string;
  content: string;
  icon: string;
  source?: string;
  type: 'principle' | 'tip' | 'tool';
}
