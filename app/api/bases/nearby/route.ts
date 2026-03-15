import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findBase } from '@/lib/bases'

const RADIUS_MILES = 30

// Haversine distance in miles
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const base = findBase(q)
  if (!base) {
    return NextResponse.json({ base: null, schools: [] })
  }

  const supabase = await createClient()

  // Pull schools with lat/lng — bounding box first for efficiency
  const latDelta = RADIUS_MILES / 69.0
  const lngDelta = RADIUS_MILES / (69.0 * Math.cos((base.lat * Math.PI) / 180))

  const { data: candidates, error } = await supabase
    .from('schools')
    .select(
      'ncessch, school_name, city, state_abbr, rating_overall, rating_military_friendly, review_count, is_dodea, purple_star_school, lat, lng'
    )
    .gte('lat', base.lat - latDelta)
    .lte('lat', base.lat + latDelta)
    .gte('lng', base.lng - lngDelta)
    .lte('lng', base.lng + lngDelta)
    .limit(200)

  if (error) {
    console.error('Base lookup error', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Filter precisely by Haversine and attach distance
  const nearby = (candidates ?? [])
    .map((s) => ({
      ...s,
      distance_miles: haversine(base.lat, base.lng, s.lat ?? 0, s.lng ?? 0),
    }))
    .filter((s) => s.lat && s.lng && s.distance_miles <= RADIUS_MILES)
    .sort((a, b) => a.distance_miles - b.distance_miles)
    .slice(0, 30)

  return NextResponse.json({
    base: { name: base.name, state: base.state, lat: base.lat, lng: base.lng },
    schools: nearby,
  })
}
