'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/schools?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/schools')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-xl"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search by city, state, or school name
      </label>
      <input
        id="hero-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by city, state, or school name..."
        className="flex-1 rounded-lg px-4 py-3 text-white bg-transparent placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020] border border-blue-400"
      />
      <button
        type="submit"
        className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
      >
        Find Schools
      </button>
    </form>
  )
}
