export type NutritionGoal =
  | "high-protein"
  | "low-carb"
  | "balanced"

export interface NutritionRecommendation {
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  benefit: string
}

const nutritionPlans: Record<
  NutritionGoal,
  NutritionRecommendation[]
> = {
  "high-protein": [
    {
      name: "Grilled Chicken Breast",
      calories: 320,
      protein: 40,
      carbs: 5,
      fats: 12,
      benefit: "Supports muscle growth and recovery",
    },
    {
      name: "Boiled Eggs with Toast",
      calories: 280,
      protein: 22,
      carbs: 18,
      fats: 10,
      benefit: "Protein-rich healthy breakfast",
    },
  ],

  "low-carb": [
    {
      name: "Paneer Salad",
      calories: 300,
      protein: 20,
      carbs: 10,
      fats: 18,
      benefit: "Low carb meal for fat loss",
    },
    {
      name: "Avocado Smoothie",
      calories: 250,
      protein: 8,
      carbs: 12,
      fats: 16,
      benefit: "Healthy fats with reduced carbs",
    },
  ],

  balanced: [
    {
      name: "Rice with Dal",
      calories: 450,
      protein: 18,
      carbs: 55,
      fats: 10,
      benefit: "Balanced nutrition for daily energy",
    },
    {
      name: "Chicken Wrap",
      calories: 420,
      protein: 28,
      carbs: 35,
      fats: 14,
      benefit: "Balanced meal with protein and carbs",
    },
  ],
}

export function getNutritionRecommendations(
  goal: NutritionGoal
) {
  return nutritionPlans[goal]
}