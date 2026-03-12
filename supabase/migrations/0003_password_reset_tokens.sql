-- 0003_password_reset_tokens.sql
-- AUTH-04: Table to store password reset tokens (bcrypt-hashed).

create table if not exists public.password_reset_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  used        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists prt_user_id_idx    on public.password_reset_tokens (user_id);
create index if not exists prt_expires_at_idx on public.password_reset_tokens (expires_at);

alter table public.password_reset_tokens enable row level security;
-- No user-facing RLS policies — only the service-role key (server) accesses this table.
