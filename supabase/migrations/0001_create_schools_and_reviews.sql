-- 0001_create_schools_and_reviews.sql
-- Run this in the Supabase SQL editor or via supabase db push.

-- ── schools ──────────────────────────────────────────────────────────────────
create table if not exists public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  state       char(2) not null,
  created_at  timestamptz not null default now()
);

-- Case-insensitive unique index used by the upsert in the API route.
-- Allows "Smith Elementary" and "smith elementary" to resolve to the same row.
create unique index if not exists schools_name_state_unique
  on public.schools (lower(name), state);

-- ── reviews ──────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id                        uuid primary key default gen_random_uuid(),
  school_id                 uuid not null references public.schools(id) on delete cascade,

  -- Enrollment questions
  interstate_compact        text check (interstate_compact in ('yes','no','not_sure')),
  purple_star               text check (purple_star in ('yes','no','not_sure')),
  iep504_status             text check (iep504_status in ('honored_promptly','delayed','not_honored','not_applicable')),

  -- Numeric ratings 1–5
  academic_experience       smallint check (academic_experience between 1 and 5),
  community_belonging       smallint check (community_belonging between 1 and 5),
  communication_engagement  smallint check (communication_engagement between 1 and 5),
  special_needs_support     smallint check (special_needs_support between 1 and 5),
  overall_fit               smallint check (overall_fit between 1 and 5),

  -- Free text
  extra_notes               text check (char_length(extra_notes) <= 5000),

  created_at                timestamptz not null default now()
);

-- Index for fast school-level review queries (used by /schools/[id])
create index if not exists reviews_school_id_idx
  on public.reviews (school_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Reviews are anonymous: anyone can insert, only the service role can update/delete.
alter table public.schools enable row level security;
alter table public.reviews enable row level security;

-- Schools: public read, no direct client writes (API route handles inserts)
create policy "schools_public_read" on public.schools
  for select using (true);

-- Reviews: public read + insert via anon key; no update/delete from client
create policy "reviews_public_read" on public.reviews
  for select using (true);

create policy "reviews_public_insert" on public.reviews
  for insert with check (true);
