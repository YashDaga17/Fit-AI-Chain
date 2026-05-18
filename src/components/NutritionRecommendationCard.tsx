"use client"

import { useState } from "react"

import {
  NutritionGoal,
  getNutritionRecommendations,
} from "@/utils/nutritionRecommendations"

export default function NutritionRecommendationCard() {
  const [goal, setGoal] =
    useState<NutritionGoal>("balanced")

  const foods =
    getNutritionRecommendations(goal)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-2xl font-bold mb-4">
        Nutrition Recommendations
      </h2>

      <select
        value={goal}
        onChange={(e) =>
          setGoal(e.target.value as NutritionGoal)
        }
        className="border rounded-lg p-2 mb-5"
      >
        <option value="high-protein">
          High Protein
        </option>

        <option value="low-carb">
          Low Carb
        </option>

        <option value="balanced">
          Balanced
        </option>
      </select>

      <div className="space-y-4">
        {foods.map((food, index) => (
          <div
            key={index}
            className="bg-orange-50 border rounded-xl p-4"
          >
            <h3 className="font-bold text-lg">
              {food.name}
            </h3>

            <p className="text-sm text-gray-600 mb-2">
              {food.benefit}
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p> Calories: {food.calories}</p>
              <p> Protein: {food.protein}g</p>
              <p> Carbs: {food.carbs}g</p>
              <p> Fats: {food.fats}g</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}