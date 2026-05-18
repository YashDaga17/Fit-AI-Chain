"use client"

import { useState, useEffect, useCallback } from 'react'
import RecipeCreator from '@/components/RecipeCreator'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  ChefHat, Plus, Search, Trash2, Zap, X,
  Flame, Beef, Wheat, Droplets, Clock, Users, Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Ingredient {
  name: string
  amount: string
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Recipe {
  id: number
  name: string
  description?: string
  servings: number
  ingredients: Ingredient[]
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
  isPublic: boolean
  createdAt: string
}

export default function RecipesPage() {
  const { username } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [search, setSearch] = useState('')
  const [showCreator, setShowCreator] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loggingId, setLoggingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loggedId, setLoggedId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRecipes = useCallback(async () => {
    if (!username) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/recipes?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      if (data.success) {
        setRecipes(data.recipes)
        setFilteredRecipes(data.recipes)
      }
    } catch {
      showToast('Failed to load recipes', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredRecipes(
      recipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
      )
    )
  }, [search, recipes])

  const handleDelete = async (id: number) => {
    if (!username) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/recipes?id=${id}&username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setRecipes(prev => prev.filter(r => r.id !== id))
        showToast('Recipe deleted')
      } else {
        showToast(data.message || 'Failed to delete', 'error')
      }
    } catch {
      showToast('Failed to delete recipe', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleQuickLog = async (recipe: Recipe) => {
    if (!username) return
    setLoggingId(recipe.id)
    try {
      const perServingCalories = Math.round(recipe.totalCalories / (recipe.servings || 1))
      const perServingProtein = Math.round((recipe.totalProtein || 0) / (recipe.servings || 1))
      const perServingCarbs = Math.round((recipe.totalCarbs || 0) / (recipe.servings || 1))
      const perServingFat = Math.round((recipe.totalFat || 0) / (recipe.servings || 1))

      const res = await fetch('/api/food/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          foodName: recipe.name,
          calories: perServingCalories,
          xpEarned: Math.round(perServingCalories / 10),
          imageUrl: '/placeholder-food.jpg',
          portionSize: `1 serving (of ${recipe.servings})`,
          nutrients: {
            protein: `${perServingProtein}g`,
            carbs: `${perServingCarbs}g`,
            fat: `${perServingFat}g`,
            fiber: '0g',
          },
          mealType: 'meal',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setLoggedId(recipe.id)
        showToast(`✅ "${recipe.name}" logged to your food diary!`)
        setTimeout(() => setLoggedId(null), 2500)
      } else {
        showToast(data.error || 'Failed to log', 'error')
      }
    } catch {
      showToast('Failed to log recipe', 'error')
    } finally {
      setLoggingId(null)
    }
  }

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please log in to view recipes.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-medium transition-all
          ${toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 pt-10 pb-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Recipes</h1>
                <p className="text-white/70 text-sm">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
              </div>
            </div>
            <Button
              id="open-recipe-creator-btn"
              onClick={() => setShowCreator(true)}
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md rounded-xl px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              id="recipe-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes..."
              className="w-full bg-white/20 text-white placeholder-white/50 pl-10 pr-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:bg-white/30 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Recipe Creator / Editor Modal */}
        {(showCreator || editingRecipe) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <RecipeCreator
                username={username}
                editRecipe={editingRecipe ?? undefined}
                onSave={() => { setShowCreator(false); setEditingRecipe(null); fetchRecipes() }}
                onClose={() => { setShowCreator(false); setEditingRecipe(null) }}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-4 text-sm">Loading recipes...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredRecipes.length === 0 && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-orange-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700">
              {search ? 'No recipes found' : 'No recipes yet'}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">
              {search
                ? `No recipes match "${search}". Try a different search term.`
                : 'Create your first custom recipe to get started!'}
            </p>
            {!search && (
              <Button
                id="create-first-recipe-btn"
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create First Recipe
              </Button>
            )}
          </div>
        )}

        {/* Recipe Cards */}
        {!isLoading && filteredRecipes.map(recipe => {
          const perServing = recipe.servings > 1
          const cal = Math.round(recipe.totalCalories / (recipe.servings || 1))
          const protein = Math.round((recipe.totalProtein || 0) / (recipe.servings || 1))
          const carbs = Math.round((recipe.totalCarbs || 0) / (recipe.servings || 1))
          const fat = Math.round((recipe.totalFat || 0) / (recipe.servings || 1))
          const isLogging = loggingId === recipe.id
          const isLogged = loggedId === recipe.id
          const isDeleting = deletingId === recipe.id

          return (
            <div
              key={recipe.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300
                ${isLogged ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
            >
              {/* Card Header */}
              <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base truncate">{recipe.name}</h3>
                  {recipe.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{recipe.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </span>
                    {recipe.ingredients?.length > 0 && (
                      <span>{recipe.ingredients.length} ingredients</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    id={`edit-recipe-${recipe.id}`}
                    onClick={() => setEditingRecipe(recipe)}
                    className="text-gray-300 hover:text-orange-400 transition-colors p-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    id={`delete-recipe-${recipe.id}`}
                    onClick={() => handleDelete(recipe.id)}
                    disabled={isDeleting}
                    className="text-gray-200 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nutrition row */}
              <div className="px-5 py-3 bg-gray-50 flex items-center gap-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 flex-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-sm font-bold text-gray-800">{cal}</span>
                  <span className="text-xs text-gray-400">kcal</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Beef className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-sm font-semibold text-gray-700">{protein}g</span>
                  <span className="text-xs text-gray-400">protein</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Wheat className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700">{carbs}g</span>
                  <span className="text-xs text-gray-400">carbs</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <Droplets className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-sm font-semibold text-gray-700">{fat}g</span>
                  <span className="text-xs text-gray-400">fat</span>
                </div>
                {perServing && (
                  <span className="text-xs text-gray-300 flex-shrink-0">/ serving</span>
                )}
              </div>

              {/* Quick Log button */}
              <div className="px-5 py-3">
                <Button
                  id={`log-recipe-${recipe.id}`}
                  onClick={() => handleQuickLog(recipe)}
                  disabled={isLogging || isLogged}
                  className={`w-full font-semibold rounded-xl py-2 text-sm transition-all
                    ${isLogged
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-sm'
                    }`}
                >
                  {isLogged ? (
                    <span className="flex items-center justify-center gap-2">✅ Logged!</span>
                  ) : isLogging ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Log ({cal} kcal)
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Navigation />
    </div>
  )
}
