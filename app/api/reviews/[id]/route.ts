import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'
import { validateCsrf } from '@/lib/auth/csrf'

const EDIT_WINDOW_MS = 48 * 60 * 60 * 1000 // 48 hours

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userId: string
  try {
    const payload = await verifyAccessToken(token)
    userId = payload.sub as string
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = (await cookies()).get('access_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // CSRF check
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  let userId: string
  try {
    const payload = await verifyAccessToken(token)
    userId = payload.sub as string
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Cast to any to avoid generated-type errors until the DB migration
  // adds edit_count + last_edited_at to the reviews table.
  const { data: existing, error: fetchError } = await supabase
    .from('reviews')
    .select('id, user_id, created_at, edit_count')
    .eq('id', id)
    .eq('user_id', userId)
    .single() as unknown as {
      data: {
        id: string
        user_id: string
        created_at: string
        edit_count: number | null
      } | null
      error: unknown
    }

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  // Enforce 48-hour edit window (PERM-03)
  const createdAt = new Date(existing.created_at).getTime()
  if (Date.now() > createdAt + EDIT_WINDOW_MS) {
    return NextResponse.json(
      { error: 'Edit window has expired. Reviews can only be edited within 48 hours of submission.' },
      { status: 403 }
    )
  }

  // Enforce once-only edit rule (edit_count max 1)
  if ((existing.edit_count ?? 0) >= 1) {
    return NextResponse.json(
      { error: 'This review has already been edited. Only one edit is allowed per review.' },
      { status: 403 }
    )
  }

  type EditableFields = {
    academic_experience?: number | null
    community_belonging?: number | null
    communication_engagement?: number | null
    special_needs_support?: number | null
    overall_fit?: number | null
    extra_notes?: string | null
  }

  let body: EditableFields
  try {
    body = (await req.json()) as EditableFields
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Whitelist only editable fields
  const updates: EditableFields & { edit_count: number; last_edited_at: string } = {
    edit_count: (existing.edit_count ?? 0) + 1,
    last_edited_at: new Date().toISOString(),
  }

  const numericFields = [
    'academic_experience',
    'community_belonging',
    'communication_engagement',
    'special_needs_support',
    'overall_fit',
  ] as const

  for (const field of numericFields) {
    if (field in body) {
      const val = body[field]
      if (val !== null && val !== undefined) {
        const n = Number(val)
        if (!Number.isInteger(n) || n < 1 || n > 5) {
          return NextResponse.json(
            { error: `Invalid value for ${field}: must be integer 1-5` },
            { status: 400 }
          )
        }
        updates[field] = n
      } else {
        updates[field] = null
      }
    }
  }

  if ('extra_notes' in body) {
    const notes = body.extra_notes
    if (notes !== null && notes !== undefined) {
      if (typeof notes !== 'string' || notes.length > 500) {
        return NextResponse.json(
          { error: 'extra_notes must be a string of 500 characters or fewer' },
          { status: 400 }
        )
      }
      updates.extra_notes = notes.trim()
    } else {
      updates.extra_notes = null
    }
  }

  const { error: updateError } = await supabase
    .from('reviews')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .eq('user_id', userId)

  if (updateError) {
    console.error('PATCH /api/reviews/[id] error', updateError)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
