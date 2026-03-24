import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { estimateCost, midEstimate } from '@/lib/vendorQuotes'
import { z } from 'zod'

const CATEGORY_QUERIES: Record<string, string> = {
  venue:       'wedding venue',
  catering:    'wedding catering service',
  photography: 'wedding photographer',
  decoration:  'wedding decorator florist',
  music:       'wedding DJ band entertainment',
  cake:        'wedding cake bakery',
}

const MAX_RESULTS: Record<string, number> = {
  venue: 10,
  catering: 5,
  photography: 5,
  decoration: 5,
  music: 5,
  cake: 5,
}

const schema = z.object({
  location: z.string().min(2),
  category: z.enum(['venue', 'catering', 'photography', 'decoration', 'music', 'cake']),
  guestCount: z.number().min(1).max(2000),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { location, category, guestCount } = schema.parse(body)

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      // Return a helpful error if key is not set
      return NextResponse.json(
        { error: 'Google Places API key not configured. Add GOOGLE_PLACES_API_KEY to your environment variables.' },
        { status: 503 }
      )
    }

    const textQuery = `${CATEGORY_QUERIES[category]} in ${location}`
    const maxResultCount = MAX_RESULTS[category] || 5

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.nationalPhoneNumber,places.photos',
      },
      body: JSON.stringify({ textQuery, maxResultCount }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Google Places error:', err)
      return NextResponse.json({ error: 'Failed to fetch from Google Places', details: err }, { status: 502 })
    }

    const data = await response.json()
    const places = data.places || []

    const { low, high, label } = estimateCost(category, guestCount, location)

    const results = places.map((place: any, i: number) => {
      // Vary quotes slightly per vendor for realism
      const variance = 0.75 + (i % 5) * 0.15
      const estLow = Math.round(low * variance)
      const estHigh = Math.round(high * variance)

      return {
        googlePlaceId: place.id,
        name: place.displayName?.text || 'Unknown',
        address: place.formattedAddress || '',
        phone: place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        rating: place.rating || null,
        reviewCount: place.userRatingCount || 0,
        priceLevel: place.priceLevel || null,
        estimatedCostLow: estLow,
        estimatedCostHigh: estHigh,
        estimatedCostMid: midEstimate(estLow, estHigh),
        estimatedCostLabel: label,
        photoUrl: place.photos?.[0]
          ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${apiKey}`
          : null,
      }
    })

    return NextResponse.json({ results, location, category, guestCount })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
