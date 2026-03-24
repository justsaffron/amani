/**
 * Generates rough cost estimates based on category, guest count, and city tier.
 * These are indicative ranges, not real quotes.
 */

// Very rough city tier multipliers
const CITY_TIERS: Record<string, number> = {
  'new york': 1.8, 'nyc': 1.8, 'manhattan': 2.0,
  'los angeles': 1.6, 'la': 1.6, 'san francisco': 1.7,
  'london': 1.7, 'dubai': 1.6, 'singapore': 1.5,
  'chicago': 1.3, 'miami': 1.4, 'boston': 1.4,
  'paris': 1.6, 'sydney': 1.4, 'toronto': 1.3,
  'manchester': 1.1, 'birmingham': 1.0,
}

function getCityMultiplier(city: string): number {
  const lower = city.toLowerCase()
  for (const [key, mult] of Object.entries(CITY_TIERS)) {
    if (lower.includes(key)) return mult
  }
  return 1.0
}

export function estimateCost(
  category: string,
  guestCount: number,
  city: string,
): { low: number; high: number; label: string } {
  const mult = getCityMultiplier(city)
  const g = Math.max(guestCount, 50) // minimum baseline

  switch (category.toLowerCase()) {
    case 'venue':
      return {
        low: Math.round(g * 45 * mult),
        high: Math.round(g * 120 * mult),
        label: 'per-head venue hire',
      }
    case 'catering':
      return {
        low: Math.round(g * 35 * mult),
        high: Math.round(g * 90 * mult),
        label: 'per-head catering',
      }
    case 'photography':
      return {
        low: Math.round(2000 * mult),
        high: Math.round(6000 * mult),
        label: 'full-day photography',
      }
    case 'decoration':
      return {
        low: Math.round(g * 20 * mult),
        high: Math.round(g * 65 * mult),
        label: 'decoration & florals',
      }
    case 'music':
      return {
        low: Math.round(1500 * mult),
        high: Math.round(4000 * mult),
        label: 'DJ or live music',
      }
    case 'cake':
      return {
        low: Math.round(g * 8 * mult),
        high: Math.round(g * 20 * mult),
        label: 'wedding cake/desserts',
      }
    default:
      return { low: Math.round(500 * mult), high: Math.round(3000 * mult), label: 'estimated cost' }
  }
}

export function midEstimate(low: number, high: number): number {
  return Math.round((low + high) / 2)
}
