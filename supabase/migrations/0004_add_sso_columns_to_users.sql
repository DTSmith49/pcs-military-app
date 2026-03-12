-- =============================================================================
-- 0004_add_sso_columns_to_users.sql
-- Task: AUTH-SSO-03
-- Adds SSO provider columns to the users table so that Google OAuth accounts
-- can be linked and identified. All columns are nullable so existing
-- email/password-only accounts are unaffected.
-- Safe to re-run (uses IF NOT EXISTS / DO blocks).
-- =============================================================================

-- 1. Add sso_provider column (e.g. 'google')
alter table public.users
  add column if not exists sso_provider text
    check (sso_provider in ('google'))
    default null;

-- 2. Add sso_provider_user_id column (the 'sub' claim from Google's ID token)
alter table public.users
  add column if not exists sso_provider_user_id text
    default null;

-- 3. Unique partial index: one account per SSO provider+user combo
--    (prevents duplicate rows if a user somehow triggers the OAuth flow twice)
create unique index if not exists users_sso_provider_user_id_unique
  on public.users (sso_provider, sso_provider_user_id)
  where sso_provider is not null and sso_provider_user_id is not null;

-- 4. Index for fast lookup by provider (used in future account-linking queries)
create index if not exists users_sso_provider_idx
  on public.users (sso_provider)
  where sso_provider is not null;
