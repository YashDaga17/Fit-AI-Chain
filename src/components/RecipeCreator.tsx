"use client"

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChefHat, Save, X, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Ingredient {
  id: string
  name: string
  amount: string
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface EditRecipe {
  id: number
  name: string
  description?: string
  servings: number
  ingredients: Omit<Ingredient, 'id'>[]
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  isPublic?: boolean
}

interface RecipeCreatorProps {
  username: string
  onSave?: () => void
  onClose?: () => void
  editRecipe?: EditRecipe
}

const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'oz', 'piece', 'slice']

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function RecipeCreator({ username, onSave, onClose, editRecipe }: RecipeCreatorProps) {
  const isEditing = !!editRecipe
  const [recipeName, setRecipeName] = useState(editRecipe?.name || '')
  const [description, setDescription] = useState(editRecipe?.description || '')
  const [servings, setServings] = useState(editRecipe?.servings || 1)
  const [isPublic, setIsPublic] = useState(editRecipe?.isPublic || false)
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editRecipe?.ingredients.map(ing => ({ ...ing, id: generateId() })) || []
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // New ingredient form state
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    amount: '',
    unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  // Auto-calculate totals
  const totalCalories = ingredients.reduce((sum, i) => sum + (i.calories || 0), 0)
  const totalProtein = ingredients.reduce((sum, i) => sum + (i.protein || 0), 0)
  const totalCarbs = ingredients.reduce((sum, i) => sum + (i.carbs || 0), 0)
  const totalFat = ingredients.reduce((sum, i) => sum + (i.fat || 0), 0)

  const perServingCalories = servings > 0 ? Math.round(totalCalories / servings) : totalCalories
  const perServingProtein = servings > 0 ? Math.round(totalProtein / servings) : totalProtein
  const perServingCarbs = servings > 0 ? Math.round(totalCarbs / servings) : totalCarbs
  const perServingFat = servings > 0 ? Math.round(totalFat / servings) : totalFat

  const addIngredient = () => {
    if (!newIngredient.name.trim()) {
      setError('Ingredient name is required')
      return
    }
    setIngredients(prev => [...prev, { ...newIngredient, id: generateId() }])
    setNewIngredient({ name: '', amount: '', unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 })
    setError('')
  }

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }

  const handleSave = async () => {
    if (!recipeName.trim()) {
      setError('Recipe name is required')
      return
    }
    if (ingredients.length === 0) {
      setError('Add at least one ingredient')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing
        ? { id: editRecipe!.id, username, name: recipeName.trim(), description: description.trim(), servings, isPublic, ingredients: ingredients.map(({ id, ...rest }) => rest), totalCalories, totalProtein, totalCarbs, totalFat }
        : { username, name: recipeName.trim(), description: description.trim(), servings, isPublic, ingredients: ingredients.map(({ id, ...rest }) => rest), totalCalories, totalProtein, totalCarbs, totalFat }

      const res = await fetch('/api/recipes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setSuccess(true)
      setTimeout(() => {
        onSave?.()
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to save recipe')
    } finally {
      setIsSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
        <p className="text-lg font-semibold text-gray-800">Recipe Saved!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEditing ? <Pencil className="h-6 w-6 text-white" /> : <ChefHat className="h-6 w-6 text-white" />}
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Recipe' : 'Create Recipe'}</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Recipe Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Recipe Name *</label>
            <input
              id="recipe-name"
              type="text"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              placeholder="e.g. Chicken Salad Bowl"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              id="recipe-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional short description..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 bg-gray-50 resize-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Servings</label>
              <input
                id="recipe-servings"
                type="number"
                min={1}
                value={servings}
                onChange={e => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 bg-gray-50"
              />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                id="recipe-public"
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="recipe-public" className="text-sm font-medium text-gray-600">Make public</label>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        {ingredients.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">Nutrition Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-orange-500">{perServingCalories}</p>
                <p className="text-xs text-gray-500">kcal / serving</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-xl p-2 text-center shadow-sm">
                  <p className="text-base font-bold text-blue-500">{perServingProtein}g</p>
                  <p className="text-xs text-gray-400">Protein</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm">
                  <p className="text-base font-bold text-yellow-500">{perServingCarbs}g</p>
                  <p className="text-xs text-gray-400">Carbs</p>
                </div>
                <div className="bg-white rounded-xl p-2 text-center shadow-sm">
                  <p className="text-base font-bold text-red-400">{perServingFat}g</p>
                  <p className="text-xs text-gray-400">Fat</p>
                </div>
              </div>
            </div>
            {servings > 1 && (
              <p className="text-xs text-gray-400 mt-2 text-center">Total: {totalCalories} kcal for {servings} servings</p>
            )}
          </div>
        )}

        {/* Ingredients */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Ingredients ({ingredients.length})</p>

          {/* Ingredient list */}
          {ingredients.length > 0 && (
            <div className="space-y-2 mb-4">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ing.name}</p>
                    <p className="text-xs text-gray-400">{ing.amount} {ing.unit} · {ing.calories} kcal · P:{ing.protein}g C:{ing.carbs}g F:{ing.fat}g</p>
                  </div>
                  <button
                    onClick={() => removeIngredient(ing.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add ingredient form */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-dashed border-gray-200 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add Ingredient</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                id="ingredient-name"
                type="text"
                value={newIngredient.name}
                onChange={e => setNewIngredient(p => ({ ...p, name: e.target.value }))}
                placeholder="Name *"
                className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
              <div className="flex gap-1">
                <input
                  id="ingredient-amount"
                  type="text"
                  value={newIngredient.amount}
                  onChange={e => setNewIngredient(p => ({ ...p, amount: e.target.value }))}
                  placeholder="Qty"
                  className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
                <select
                  id="ingredient-unit"
                  value={newIngredient.unit}
                  onChange={e => setNewIngredient(p => ({ ...p, unit: e.target.value }))}
                  className="px-1 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'calories', label: 'kcal', color: 'text-orange-500' },
                { key: 'protein', label: 'Protein (g)', color: 'text-blue-500' },
                { key: 'carbs', label: 'Carbs (g)', color: 'text-yellow-500' },
                { key: 'fat', label: 'Fat (g)', color: 'text-red-400' },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className={`text-xs font-medium ${color} block mb-1`}>{label}</label>
                  <input
                    id={`ingredient-${key}`}
                    type="number"
                    min={0}
                    value={(newIngredient as any)[key] || ''}
                    onChange={e => setNewIngredient(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
              ))}
            </div>

            <Button
              id="add-ingredient-btn"
              onClick={addIngredient}
              variant="outline"
              size="sm"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        {/* Save Button */}
        <Button
          id="save-recipe-btn"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? 'Update Recipe' : 'Save Recipe'}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
