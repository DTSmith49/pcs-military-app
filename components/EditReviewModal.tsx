'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReviewFields = {
  id: string
  academic_experience: number | null
  community_belonging: number | null
  communication_engagement: number | null
  special_needs_support: number | null
  overall_fit: number | null
  extra_notes: string | null
}

const RATING_FIELDS: { key: keyof Omit<ReviewFields, 'id' | 'extra_notes'>; label: string }[] = [
  { key: 'academic_experience', label: 'Academic Experience' },
  { key: 'community_belonging', label: 'Community Belonging' },
  { key: 'communication_engagement', label: 'Communication & Engagement' },
  { key: 'special_needs_support', label: 'Special Needs Support' },
  { key: 'overall_fit', label: 'Overall Military-Family Fit' },
]

export default function EditReviewModal({ review }: { review: ReviewFields }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<{
    academic_experience: string
    community_belonging: string
    communication_engagement: string
    special_needs_support: string
    overall_fit: string
    extra_notes: string
  }>({
    academic_experience: review.academic_experience?.toString() ?? '',
    community_belonging: review.community_belonging?.toString() ?? '',
    communication_engagement: review.communication_engagement?.toString() ?? '',
    special_needs_support: review.special_needs_support?.toString() ?? '',
    overall_fit: review.overall_fit?.toString() ?? '',
    extra_notes: review.extra_notes ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const csrf = document.cookie
      .split('; ')
      .find((c) => c.startsWith('csrf_token='))
      ?.split('=')[1] ?? ''

    const payload: Record<string, number | string | null> = {
      extra_notes: form.extra_notes.trim() || null,
    }

    for (const { key } of RATING_FIELDS) {
      const val = form[key]
      payload[key] = val ? Number(val) : null
    }

    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save edit')
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-[#1B2A4A] border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
      >
        Edit Review
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B2A4A]">Edit Review</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              ⚠️ You can only edit a review once. This action cannot be undone.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {RATING_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">{label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, [key]: n.toString() }))}
                        className={`w-9 h-9 rounded-full text-sm font-bold border transition-colors ${
                          form[key] === n.toString()
                            ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-[#1B2A4A]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, [key]: '' }))}
                      className="text-xs text-slate-400 hover:text-slate-600 ml-1"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  Additional Notes <span className="text-slate-400 font-normal">(optional, max 500 chars)</span>
                </label>
                <textarea
                  value={form.extra_notes}
                  onChange={(e) => setForm((f) => ({ ...f, extra_notes: e.target.value }))}
                  maxLength={500}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30"
                  placeholder="What else would you like military families to know?"
                />
                <p className="text-xs text-slate-400 text-right mt-0.5">{form.extra_notes.length}/500</p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-medium py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1B2A4A] hover:bg-[#243860] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
