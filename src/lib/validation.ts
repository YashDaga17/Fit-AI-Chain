const USERNAME_MAX_LENGTH = 100
const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

type NutritionPayload = {
  protein?: unknown
  carbs?: unknown
  fat?: unknown
  fiber?: unknown
  sugar?: unknown
}

export function normalizeUsername(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  if (!normalized || normalized.length > USERNAME_MAX_LENGTH) {
    return null
  }

  return normalized
}

export function sanitizePagination(
  limit: unknown,
  offset: unknown,
  defaults: { limit?: number; maxLimit?: number } = {}
) {
  const resolvedLimit = clampInteger(limit, defaults.limit ?? DEFAULT_PAGE_SIZE, 1, defaults.maxLimit ?? MAX_PAGE_SIZE)
  const resolvedOffset = clampInteger(offset, 0, 0, Number.MAX_SAFE_INTEGER)

  return {
    limit: resolvedLimit,
    offset: resolvedOffset,
  }
}

export function sanitizeString(value: unknown, maxLength = 255): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  return trimmed.slice(0, maxLength)
}

export function sanitizeStringArray(value: unknown, maxItems = 20, maxLength = 100): string[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const sanitized = value
    .map((item) => sanitizeString(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems)

  return sanitized.length > 0 ? sanitized : null
}

export function sanitizeNutrition(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const payload = value as NutritionPayload
  const nutrition = {
    protein: sanitizeString(payload.protein, 50) ?? '0g',
    carbs: sanitizeString(payload.carbs, 50) ?? '0g',
    fat: sanitizeString(payload.fat, 50) ?? '0g',
    fiber: sanitizeString(payload.fiber, 50) ?? '0g',
  }

  const sugar = sanitizeString(payload.sugar, 50)

  return sugar ? { ...nutrition, sugar } : nutrition
}

export function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value), 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}
