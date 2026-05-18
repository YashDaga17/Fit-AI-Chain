export type GoalType = "lose" | "maintain" | "gain";

export interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
  totalCalories: number;
}

export function getMealRecommendations(
  goal: GoalType
): MealPlan {
  if (goal === "lose") {
    return {
      breakfast: [
        "Oats with banana",
        "Boiled eggs",
      ],

      lunch: [
        "Grilled chicken salad",
        "Brown rice",
      ],

      dinner: [
        "Soup",
        "Mixed vegetables",
      ],

      snacks: [
        "Apple",
        "Greek yogurt",
      ],

      totalCalories: 1800,
    };
  }

  if (goal === "gain") {
    return {
      breakfast: [
        "Peanut butter toast",
        "Banana shake",
      ],

      lunch: [
        "Rice",
        "Chicken curry",
      ],

      dinner: [
        "Pasta",
        "Paneer",
      ],

      snacks: [
        "Protein shake",
        "Dry fruits",
      ],

      totalCalories: 2800,
    };
  }

  return {
    breakfast: [
      "Fruit smoothie",
      "Oats",
    ],

    lunch: [
      "Chapati",
      "Dal",
    ],

    dinner: [
      "Rice",
      "Salad",
    ],

    snacks: [
      "Nuts",
      "Yogurt",
    ],

    totalCalories: 2200,
  };
}