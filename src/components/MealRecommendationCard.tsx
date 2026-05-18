"use client";

import { useState } from "react";
import {
  getMealRecommendations,
  GoalType,
} from "../utils/mealRecommendations";

export default function MealRecommendationCard() {
  const [goal, setGoal] =
    useState<GoalType>("maintain");

  const recommendations =
    getMealRecommendations(goal);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl shadow-lg bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Personalised Meal Recommendations
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Your Goal
        </label>

        <select
          value={goal}
          onChange={(e) =>
            setGoal(e.target.value as GoalType)
          }
          className="w-full border p-3 rounded-lg"
        >
          <option value="lose">
            Weight Loss
          </option>

          <option value="maintain">
            Maintain Weight
          </option>

          <option value="gain">
            Weight Gain
          </option>
        </select>
      </div>

      <div className="bg-gray-100 p-4 rounded-xl mb-6">
        <h2 className="text-xl font-semibold">
          Daily Calories
        </h2>

        <p className="text-lg">
          {recommendations.totalCalories} kcal
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Breakfast
          </h2>

          <ul className="list-disc ml-6">
            {recommendations.breakfast.map(
              (meal, index) => (
                <li key={index}>{meal}</li>
              )
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Lunch
          </h2>

          <ul className="list-disc ml-6">
            {recommendations.lunch.map(
              (meal, index) => (
                <li key={index}>{meal}</li>
              )
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Dinner
          </h2>

          <ul className="list-disc ml-6">
            {recommendations.dinner.map(
              (meal, index) => (
                <li key={index}>{meal}</li>
              )
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Snacks
          </h2>

          <ul className="list-disc ml-6">
            {recommendations.snacks.map(
              (meal, index) => (
                <li key={index}>{meal}</li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}