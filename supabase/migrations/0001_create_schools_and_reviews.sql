-- Create schools table
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  city text,
  created_at timestamptz default now()
);

-- Unique index on name + state
drop index if exists public.schools_name_state_unique;
create unique index schools_name_state_unique on public.schools (name, state);

-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Index on school_id for fast lookups
create index if not exists reviews_school_id_idx on public.reviews (school_id);

-- Enable RLS
alter table public.schools enable row level security;
alter table public.reviews enable row level security;

-- Policies for schools
drop policy if exists "schools_public_read" on public.schools;
create policy "schools_public_read" on public.schools
  for select using (true);

drop policy if exists "schools_public_insert" on public.schools;
create policy "schools_public_insert" on public.schools
  for insert with check (true);

-- Policies for reviews
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

drop policy if exists "reviews_public_insert" on public.reviews;
create policy "reviews_public_insert" on public.reviews
  for insert with check (true);
