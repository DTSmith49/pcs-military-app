'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface NearbySchool {
  ncessch: string
  school_name: string
  city: string | null
  state_abbr: string
  rating_overall: number | null
  rating_military_friendly: number | null
  review_count: number | null
  is_dodea: boolean | null
  purple_star_school: boolean | null
  distance_miles: number
}

interface BaseResult {
  name: string
  state: string
  lat: number
  lng: number
}

function RatingDot({ score }: { score: number | null }) {
  if (score === null) return null
  const color =
    score >= 70 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} flex-shrink-0 mt-1`} />
  )
}

export default function BaseLookup() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [base, setBase] = useState<BaseResult | null | undefined>(undefined)
  const [schools, setSchools] = useState<NearbySchool[]>([])
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/bases/nearby?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setBase(data.base ?? null)
      setSchools(data.schools ?? [])
    } catch {
      setBase(null)
      setSchools([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <label htmlFor="base-search" className="sr-only">
          Search by duty station or base name
        </label>
        <div className="relative flex-1">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="base-search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Fort Liberty, Camp Pendleton, JBLM…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1.5 bg-[#1B2A4A] hover:bg-[#243860] disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          Search
        </button>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div className="mt-4">
          {base === null ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No duty station found matching &ldquo;{query}&rdquo;. Try a different name or{' '}
              <Link href={`/schools?q=${encodeURIComponent(query)}`} className="text-[#E8A020] underline">
                search all schools
              </Link>.
            </p>
          ) : base ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-[#E8A020] flex-shrink-0" />
                <span className="text-sm font-semibold text-[#1B2A4A]">
                  {base.name}
                </span>
                <span className="text-xs text-slate-400">· schools within 30 miles</span>
              </div>

              {schools.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No schools with location data found near {base.name} yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {schools.slice(0, 8).map((s) => (
                    <Link
                      key={s.ncessch}
                      href={`/schools/${s.ncessch}`}
                      className="flex items-start gap-3 bg-white border border-slate-100 hover:border-[#E8A020] rounded-xl p-3 transition-colors group"
                    >
                      <RatingDot score={s.rating_overall} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1B2A4A] truncate leading-snug">
                          {s.school_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {s.city ? `${s.city}, ` : ''}{s.state_abbr}
                          {' · '}
                          <span className="text-slate-500">{s.distance_miles.toFixed(1)} mi</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {s.is_dodea && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🎖️ DoDEA</span>
                          )}
                          {s.purple_star_school && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">⭐ Purple Star</span>
                          )}
                          {s.review_count && s.review_count > 0 ? (
                            <span className="text-xs text-amber-600">★ {s.review_count} review{s.review_count !== 1 ? 's' : ''}</span>
                          ) : (
                            <span className="text-xs text-slate-300">No reviews</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-300 group-hover:text-[#E8A020] transition-colors flex-shrink-0">→</span>
                    </Link>
                  ))}
                </div>
              )}

              {schools.length > 8 && (
                <div className="mt-3 text-center">
                  <Link
                    href={`/schools?q=${encodeURIComponent(base.name)}`}
                    className="text-sm text-[#E8A020] hover:underline font-medium"
                  >
                    See all {schools.length} schools near {base.name} →
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
