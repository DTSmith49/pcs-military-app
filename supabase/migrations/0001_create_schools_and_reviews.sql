-- 0001_create_schools_and_reviews.sql
-- Run this in the Supabase SQL editor or via supabase db push.
-- If you already ran the previous version of this migration, run the
-- "fixup" block at the bottom instead of the full script.

-- ── schools ──────────────────────────────────────────────────────────────────
create table if not exists public.schools (
  id          uuid primary key default gen_random_uuid(),
  -- name stored lowercase so plain unique index handles deduplication
  name        text not null,
  city        text,
  state       char(2) not null,
  created_at  timestamptz not null default now()
);

-- Plain unique constraint on (name, state).
-- name is always stored lowercase by the API, so this is effectively
-- case-insensitive without needing an expression index.
create unique index if not exists schools_name_state_unique
  on public.schools (name, state);

-- ── reviews ──────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id                        uuid primary key default gen_random_uuid(),
  school_id                 uuid not null references public.schools(id) on delete cascade,

  interstate_compact        text check (interstate_compact in ('yes','no','not_sure')),
  purple_star               text check (purple_star in ('yes','no','not_sure')),
  iep504_status             text check (iep504_status in ('honored_promptly','delayed','not_honored','not_applicable')),

  academic_experience       smallint check (academic_experience between 1 and 5),
  community_belonging       smallint check (community_belonging between 1 and 5),
  communication_engagement  smallint check (communication_engagement between 1 and 5),
  special_needs_support     smallint check (special_needs_support between 1 and 5),
  overall_fit               smallint check (overall_fit between 1 and 5),

  extra_notes               text check (char_length(extra_notes) <= 5000),

  created_at                timestamptz not null default now()
);

create index if not exists reviews_school_id_idx
  on public.reviews (school_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.schools enable row level security;
alter table public.reviews enable row level security;

create policy "schools_public_read" on public.schools
  for select using (true);

create policy "reviews_public_read" on public.reviews
  for select using (true);

create policy "reviews_public_insert" on public.reviews
  for insert with check (true);

-- ──────────────────────────────────────────────────────────────────────
-- FIXUP: run this block ONLY if you already applied the previous version
-- of this migration (which had the expression index on lower(name),state).
-- Skip this block if you are running the migration fresh.
-- ──────────────────────────────────────────────────────────────────────
-- drop expression index, replace with plain unique index
-- drop index if exists public.schools_name_state_unique;
-- create unique index schools_name_state_unique on public.schools (name, state);
