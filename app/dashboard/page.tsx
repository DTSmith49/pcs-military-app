import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'
import Link from 'next/link'
import DeleteReviewButton from '@/components/DeleteReviewButton'
import EditReviewModal from '@/components/EditReviewModal'

export const dynamic = 'force-dynamic'

const RATING_LABELS: Record<string, string> = {
  academic_experience: 'Academic',
  community_belonging: 'Community',
  communication_engagement: 'Communication',
  special_needs_support: 'Special Needs',
  overall_fit: 'Overall Fit',
}

function RatingDot({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-300 text-xs">—</span>
  return (
    <span
      className={`inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
        value >= 4
          ? 'bg-green-100 text-green-700'
          : value === 3
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {value}
    </span>
  )
}

function EditWindowBadge({ createdAt }: { createdAt: string }) {
  const submittedMs = new Date(createdAt).getTime()
  const windowEndsMs = submittedMs + 48 * 60 * 60 * 1000
  const nowMs = Date.now()
  const open = nowMs < windowEndsMs
  if (!open) return null
  const hoursLeft = Math.max(1, Math.ceil((windowEndsMs - nowMs) / (60 * 60 * 1000)))
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
      ✏️ Editable · {hoursLeft}h left
    </span>
  )
}

export default async function DashboardPage() {
  const jar = await cookies()
  const token = jar.get('access_token')?.value
  if (!token) redirect('/login')

  let userId: string
  let userEmail: string | undefined
  try {
    const payload = await verifyAccessToken(token)
    userId = payload.sub as string
    userEmail = payload.email as string | undefined
  } catch {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      overall_fit,
      academic_experience,
      community_belonging,
      communication_engagement,
      special_needs_support,
      extra_notes,
      created_at,
      school_id,
      schools(school_name, state_abbr, city)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) console.error('Dashboard fetch error', error)

  const now = Date.now()

  return (
    <div className="bg-[#F8F7F4] min-h-screen">
      <AppNav />
      <div className="mx-auto max-w-3xl py-10 px-4">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1B2A4A]">My Dashboard</h1>
            {userEmail && (
              <p className="text-slate-500 text-sm mt-0.5">{userEmail}</p>
            )}
          </div>
          <Link
            href="/review"
            className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            + Write a Review
          </Link>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-[#1B2A4A]">{reviews?.length ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">Reviews submitted</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-[#1B2A4A]">
              {reviews && reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + (r.overall_fit ?? 0), 0) / reviews.filter(r => r.overall_fit).length).toFixed(1)
                : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Avg overall fit rating</p>
          </div>
        </div>

        {/* Review list */}
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-3">Your Reviews</h2>

        {!reviews || reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">📋</span>
            <p className="text-slate-600 font-medium">You haven&apos;t submitted any reviews yet.</p>
            <Link
              href="/review"
              className="mt-2 bg-[#1B2A4A] hover:bg-[#243860] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Write your first review
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => {
              const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
              const submittedDate = r.created_at
                ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—'
              const withinEditWindow =
                r.created_at && now < new Date(r.created_at).getTime() + 48 * 60 * 60 * 1000

              const ratingKeys = [
                'academic_experience',
                'community_belonging',
                'communication_engagement',
                'special_needs_support',
                'overall_fit',
              ] as const

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#1B2A4A] text-base">
                          {school?.school_name ?? 'Unknown School'}
                        </p>
                        {r.created_at && <EditWindowBadge createdAt={r.created_at} />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[school?.city, school?.state_abbr].filter(Boolean).join(', ') || '—'}
                        &nbsp;·&nbsp;Submitted {submittedDate}
                      </p>
                    </div>
                    <Link
                      href={`/schools/${r.school_id}`}
                      className="text-xs text-[#1B2A4A] font-medium underline underline-offset-2 hover:text-blue-700 whitespace-nowrap"
                    >
                      View school →
                    </Link>
                  </div>

                  {/* Rating pills */}
                  <div className="flex flex-wrap gap-3 mb-3">
                    {ratingKeys.map((key) => {
                      const val = r[key] as number | null
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <RatingDot value={val} />
                          <span className="text-xs text-slate-500">{RATING_LABELS[key]}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Notes */}
                  {r.extra_notes && (
                    <p className="text-sm text-slate-600 italic bg-slate-50 rounded-lg px-3 py-2 mb-3 line-clamp-2">
                      &ldquo;{r.extra_notes}&rdquo;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {withinEditWindow && (
                      <EditReviewModal review={r} />
                    )}
                    <DeleteReviewButton reviewId={r.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
