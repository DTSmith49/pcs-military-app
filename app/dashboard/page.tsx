import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'
import Link from 'next/link'
import DeleteReviewButton from '@/components/DeleteReviewButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Auth guard
  const jar = await cookies()
  const token = jar.get('access_token')?.value
  if (!token) redirect('/login')

  let userId: string
  try {
    const payload = await verifyAccessToken(token)
    userId = payload.sub as string
  } catch {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, overall_fit, created_at, schools(school_name, state_abbr)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) console.error('Dashboard fetch error', error)

  return (
    <div className="bg-[#F8F7F4] min-h-screen">
      <AppNav />
      <div className="mx-auto max-w-3xl py-10 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1B2A4A]">My Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Your submitted school reviews.</p>
          </div>
          <Link
            href="/review"
            className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            + Write a Review
          </Link>
        </div>

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
              const school = Array.isArray(r.schools) ? r.schools[0] : r.schools;
              const submittedDate = r.created_at
                ? new Date(r.created_at).toLocaleDateString()
                : '—';
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#1B2A4A]">{school?.school_name ?? '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {school?.state_abbr ?? '—'} &middot; Submitted {submittedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#1B2A4A]">
                        {r.overall_fit ? `${r.overall_fit}/5` : '—'}
                      </span>
                      <p className="text-xs text-slate-400">Overall Fit</p>
                    </div>
                    <DeleteReviewButton reviewId={r.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}