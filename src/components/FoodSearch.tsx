'use client'

import { useState, useCallback } from 'react'
import { Search, X, AlertCircle, Loader2, Copy } from 'lucide-react'
import type { FoodEntry } from '@/types/tracker'

interface SearchFilters {
  searchTerm: string
  startDate: string
  endDate: string
  mealType: string
}

interface FoodSearchProps {
  username: string
  onSelectResult?: (entry: FoodEntry) => void
  onRelogEntry?: (entry: FoodEntry) => void
  onClose?: () => void
}

/**
 * FoodSearch Component
 * Allows users to search past food entries by name, date range, and meal type
 * Shows results in a scrollable list with re-log functionality
 */
export default function FoodSearch({
  username,
  onSelectResult,
  onRelogEntry,
  onClose,
}: FoodSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    startDate: '',
    endDate: '',
    mealType: 'all',
  })

  const [results, setResults] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const performSearch = useCallback(async () => {
    // Validate filters
    if (
      !filters.searchTerm &&
      !filters.startDate &&
      !filters.endDate &&
      filters.mealType === 'all'
    ) {
      setError('Please enter at least one search filter')
      return
    }

    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      setError('Start date must be before end date')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      params.append('username', username)

      if (filters.searchTerm) {
        params.append('search', filters.searchTerm)
      }

      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }

      if (filters.mealType !== 'all') {
        params.append('mealType', filters.mealType)
      }

      const response = await fetch(`/api/food-logs?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to search food entries')
        setResults([])
        return
      }

      setResults(
  (data.logs || []).map((log: any) => ({
    ...log,

    food: log.food ?? log.foodName ?? 'Unknown Food',

    image: log.image ?? log.imageUrl ?? '/placeholder-food.jpg',

    xp: log.xp ?? log.xpEarned,

    timestamp: log.timestamp ?? log.createdAt,
  }))
)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [filters, username])

  const [isRelogging, setIsRelogging] = useState(false)

  const handleRelogEntry = useCallback(
  async (entry: FoodEntry) => {
    if (onRelogEntry && !isRelogging) {
      setIsRelogging(true)

      try {
        await onRelogEntry(entry)
      } finally {
        setIsRelogging(false)
      }
    }
  },
  [onRelogEntry, isRelogging]
)

  const clearSearch = useCallback(() => {
    setFilters({
      searchTerm: '',
      startDate: '',
      endDate: '',
      mealType: 'all',
    })
    setResults([])
    setHasSearched(false)
    setError(null)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Search Past Meals</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Filters Section */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Food Name Search */}
        <div>
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">
            Food Name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              id="search-term"
              type="text"
              placeholder="e.g., chicken, salad, pasta..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  performSearch()
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Date Range Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date (Optional)
            </label>
            <input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Meal Type Filter */}
        <div>
          <label htmlFor="meal-type" className="block text-sm font-medium text-gray-700 mb-2">
            Meal Type (Optional)
          </label>
          <select
            id="meal-type"
            value={filters.mealType}
            onChange={(e) => handleFilterChange('mealType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="meal">Meal</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={performSearch}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>

          {hasSearched && (
            <button
              onClick={clearSearch}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {loading ? 'Searching...' : `Results (${results.length})`}
          </h3>

          {/* Empty State */}
          {!loading && results.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg font-medium">No meals found</p>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your search filters or try different keywords
              </p>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {results.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Food Image */}
                  {entry.image && (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={entry.image}
                        alt={entry.food || 'Food'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Food Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {entry.food || 'Unknown'}
                    </p>

                    <div className="flex gap-3 text-sm text-gray-600 mt-1">
                      {entry.calories && (
                        <span>
                          <span className="font-medium">{entry.calories}</span> cal
                        </span>
                      )}

                      {entry.mealType && (
                        <span className="capitalize">
                          <span className="font-medium">{entry.mealType}</span>
                        </span>
                      )}

                      {entry.timestamp && (
                        <span>
                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    {entry.nutrients && (
                      <div className="flex gap-2 text-xs text-gray-500 mt-1">
                        {entry.nutrients.protein != null && (
                          <span>P: {entry.nutrients.protein}</span>
                          )}
                        {entry.nutrients.carbs != null && (
                          <span>C: {entry.nutrients.carbs}</span>
                          )}
                        {entry.nutrients.fat != null && (
                          <span>F: {entry.nutrients.fat}</span>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Re-log Button */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRelogEntry(entry)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors whitespace-nowrap"
                      title="Re-log this meal with today's date"
                    >
                      <Copy className="w-4 h-4" />
                      Re-log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
