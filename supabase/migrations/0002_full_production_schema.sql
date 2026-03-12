-- =============================================================================
-- 0002_full_production_schema.sql
-- Tasks: DB-01, DB-02, DB-03
-- Covers: users, sessions, survey_responses, questions, answers,
--         score_snapshots, audit_log, all indexes, constraints, RLS policies.
-- Run AFTER 0001_create_schools_and_reviews.sql.
-- Safe to re-run (all statements use IF NOT EXISTS / DO blocks).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid() (already in 0001, harmless)
create extension if not exists "citext";     -- case-insensitive email storage

-- ---------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('reviewer', 'admin', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.response_status as enum ('draft', 'submitted', 'flagged', 'removed', 'linked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_type as enum (
    'likert_5',          -- 1-5 labeled scale
    'bipolar_5',         -- e.g. Much slower … Much faster
    'categorical',       -- Yes / No / etc.
    'categorical_comment',  -- categorical + free-text follow-up
    'ordinal_time',      -- Same day / 1-3 days / …
    'agreement_5',       -- Strongly disagree … Strongly agree
    'nps_0_10',          -- 0-10 numeric
    'open_text'          -- free text
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.military_relationship as enum (
    'active_duty', 'military_spouse', 'veteran', 'guard_reserve'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.military_branch as enum (
    'army', 'navy', 'air_force', 'marine_corps', 'coast_guard', 'space_force'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pcs_moves_range as enum ('1', '2-3', '4-5', '6+');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.audit_action as enum (
    'insert', 'update', 'delete', 'login', 'logout',
    'flag', 'moderate', 'link', 'export'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 3. USERS
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id                    uuid primary key default gen_random_uuid(),
  email                 citext not null,
  email_verified        boolean not null default false,
  email_verified_at     timestamptz,
  password_hash         text,                        -- null for SSO-only accounts
  role                  public.user_role not null default 'reviewer',
  is_active             boolean not null default true,
  deactivated_at        timestamptz,
  deactivated_by        uuid references public.users(id),
  last_login_at         timestamptz,
  failed_login_attempts smallint not null default 0,
  locked_until          timestamptz,
  -- demographic fields (optional — drives score weighting)
  military_relationship public.military_relationship,
  military_branch       public.military_branch,
  pcs_moves             public.pcs_moves_range,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists users_email_unique on public.users (email);
create index if not exists users_role_idx on public.users (role);
create index if not exists users_is_active_idx on public.users (is_active);

-- ---------------------------------------------------------------------------
-- 4. SESSIONS  (JWT refresh-token rotation store)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  refresh_token  text not null,
  issued_at      timestamptz not null default now(),
  expires_at     timestamptz not null,
  revoked_at     timestamptz,
  user_agent     text,
  ip_address     inet
);

create unique index if not exists sessions_refresh_token_unique on public.sessions (refresh_token);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

-- ---------------------------------------------------------------------------
-- 5. QUESTIONS  (seeded by DATA-03; static for v1)
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  section         text not null,             -- e.g. 'academic_experience'
  section_order   smallint not null,         -- ordering within the app sections
  question_order  smallint not null,         -- ordering within section
  question_text   text not null,
  question_type   public.question_type not null,
  response_options jsonb,                    -- ordered list of option labels
  is_required     boolean not null default true,
  is_scored       boolean not null default true,  -- false for open_text / demographic
  score_weight    numeric(4,3) not null default 1.000,
  validated_by    text,                      -- citation reference
  created_at      timestamptz not null default now()
);

create unique index if not exists questions_section_order_unique
  on public.questions (section, section_order, question_order);
create index if not exists questions_section_idx on public.questions (section);

-- ---------------------------------------------------------------------------
-- 6. SURVEY RESPONSES
-- ---------------------------------------------------------------------------
create table if not exists public.survey_responses (
  id                    uuid primary key default gen_random_uuid(),
  school_id             uuid references public.schools(id) on delete set null,
  -- school_id may be null when a response is submitted before the school
  -- exists in the directory ("unlinked" responses — ADMIN-02 workflow).
  user_id               uuid references public.users(id) on delete set null,
  -- user_id null = anonymous submission path (pre-auth gate)

  status                public.response_status not null default 'submitted',
  submitted_at          timestamptz,
  linked_at             timestamptz,
  linked_by             uuid references public.users(id),
  moderated_at          timestamptz,
  moderated_by          uuid references public.users(id),
  moderation_note       text,

  -- Reviewer verification fields (from survey section 7)
  reviewer_relationship public.military_relationship,
  reviewer_branch       public.military_branch,
  school_year           text check (school_year ~ '^[0-9]{4}-[0-9]{4}$'),
  pcs_moves             public.pcs_moves_range,

  -- Anchor & open-ended fields stored directly on the response
  anchor_text           text check (char_length(anchor_text) <= 5000),
  one_thing_text        text check (char_length(one_thing_text) <= 5000),

  -- Duplicate-prevention fingerprint (hash of school_id + user_id + school_year)
  dedup_hash            text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists survey_responses_school_id_idx
  on public.survey_responses (school_id);
create index if not exists survey_responses_user_id_idx
  on public.survey_responses (user_id);
create index if not exists survey_responses_status_idx
  on public.survey_responses (status);
create index if not exists survey_responses_submitted_at_idx
  on public.survey_responses (submitted_at desc);
create unique index if not exists survey_responses_dedup_unique
  on public.survey_responses (dedup_hash)
  where dedup_hash is not null;

-- ---------------------------------------------------------------------------
-- 7. ANSWERS  (one row per question per response)
-- ---------------------------------------------------------------------------
create table if not exists public.answers (
  id              uuid primary key default gen_random_uuid(),
  response_id     uuid not null references public.survey_responses(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete restrict,

  -- Exactly one of the following should be non-null
  answer_numeric  numeric(5,2),    -- for likert, bipolar, nps
  answer_text     text check (char_length(answer_text) <= 5000),  -- open text / comment
  answer_option   text,            -- selected option label for categoricals

  created_at      timestamptz not null default now()
);

create unique index if not exists answers_response_question_unique
  on public.answers (response_id, question_id);
create index if not exists answers_response_id_idx on public.answers (response_id);
create index if not exists answers_question_id_idx on public.answers (question_id);

-- Check: exactly one answer column populated
alter table public.answers
  add constraint answers_exactly_one_value check (
    (
      (answer_numeric is not null)::int +
      (answer_text    is not null)::int +
      (answer_option  is not null)::int
    ) = 1
  );

-- ---------------------------------------------------------------------------
-- 8. SCORE SNAPSHOTS
-- ---------------------------------------------------------------------------
create table if not exists public.score_snapshots (
  id                          uuid primary key default gen_random_uuid(),
  school_id                   uuid not null references public.schools(id) on delete cascade,

  -- Section scores (0-100)
  academic_experience_score          numeric(5,2),
  enrollment_transition_score        numeric(5,2),
  special_needs_support_score        numeric(5,2),
  community_belonging_score          numeric(5,2),
  communication_engagement_score     numeric(5,2),
  overall_military_friendly_score    numeric(5,2),

  -- Composite score (weighted, 0-100)
  composite_score             numeric(5,2),

  -- NPS (-100 to +100)
  nps_score                   numeric(6,2),

  -- Suppression flags
  is_suppressed               boolean not null default false,
  suppression_reason          text,

  -- Sample metadata
  response_count              integer not null default 0,
  scored_response_count       integer not null default 0,
  snapshot_period_start       date,
  snapshot_period_end         date,

  computed_at                 timestamptz not null default now()
);

create index if not exists score_snapshots_school_id_idx
  on public.score_snapshots (school_id);
create index if not exists score_snapshots_computed_at_idx
  on public.score_snapshots (computed_at desc);
-- Each school has at most one "current" snapshot (latest computed_at)
create index if not exists score_snapshots_school_latest_idx
  on public.score_snapshots (school_id, computed_at desc);

-- ---------------------------------------------------------------------------
-- 9. AUDIT LOG  (DB-03)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id           bigserial primary key,
  actor_id     uuid references public.users(id) on delete set null,
  action       public.audit_action not null,
  table_name   text,
  record_id    uuid,
  old_values   jsonb,
  new_values   jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index if not exists audit_log_actor_id_idx   on public.audit_log (actor_id);
create index if not exists audit_log_table_record_idx on public.audit_log (table_name, record_id);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- 10. updated_at TRIGGER FUNCTION
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$ begin
  create trigger trg_users_updated_at
    before update on public.users
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_survey_responses_updated_at
    before update on public.survey_responses
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- users
alter table public.users enable row level security;

create policy "users_self_read" on public.users
  for select using (auth.uid() = id);

create policy "users_admin_all" on public.users
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin', 'moderator')
    )
  );

-- sessions
alter table public.sessions enable row level security;

create policy "sessions_owner_read" on public.sessions
  for select using (user_id = auth.uid());

create policy "sessions_owner_delete" on public.sessions
  for delete using (user_id = auth.uid());

create policy "sessions_admin_all" on public.sessions
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- questions (public read, admin write)
alter table public.questions enable row level security;

create policy "questions_public_read" on public.questions
  for select using (true);

create policy "questions_admin_write" on public.questions
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- survey_responses
alter table public.survey_responses enable row level security;

create policy "responses_owner_read" on public.survey_responses
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin', 'moderator')
    )
  );

create policy "responses_public_insert" on public.survey_responses
  for insert with check (true);

create policy "responses_owner_update" on public.survey_responses
  for update using (user_id = auth.uid() and status = 'draft');

create policy "responses_admin_all" on public.survey_responses
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin', 'moderator')
    )
  );

-- answers
alter table public.answers enable row level security;

create policy "answers_public_read" on public.answers
  for select using (
    exists (
      select 1 from public.survey_responses r
      where r.id = response_id and r.status = 'submitted'
    )
  );

create policy "answers_public_insert" on public.answers
  for insert with check (true);

create policy "answers_admin_all" on public.answers
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin', 'moderator')
    )
  );

-- score_snapshots (public read)
alter table public.score_snapshots enable row level security;

create policy "snapshots_public_read" on public.score_snapshots
  for select using (not is_suppressed);

create policy "snapshots_admin_all" on public.score_snapshots
  for all using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- audit_log (admin only)
alter table public.audit_log enable row level security;

create policy "audit_log_admin_read" on public.audit_log
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 12. SEED: Question rows for all 26 spec questions
--     Uses ON CONFLICT DO NOTHING so re-runs are idempotent.
--     section_order maps to the 8-step wizard; question_order is within section.
-- ---------------------------------------------------------------------------
insert into public.questions
  (section, section_order, question_order, question_text, question_type,
   response_options, is_required, is_scored, validated_by)
values

-- Section 0: Anchor (step 1 of wizard — open text, not scored)
('anchor', 0, 1,
 'As a family navigating a PCS move, what information about this school do you wish you had known before enrolling your child?',
 'open_text', null, false, false,
 'Blue Star Families Lifestyle Survey; Millennium Cohort Family Study'),

-- Section 1: Academic Experience
('academic_experience', 1, 1,
 'How would you rate this school''s academic pace compared to your child''s previous school?',
 'bipolar_5',
 '["Much slower","Somewhat slower","About the same","Somewhat faster","Much faster"]',
 true, true,
 'MCEC SETS Study; Ruff & Keim (2011)'),

('academic_experience', 1, 2,
 'Did this school accept all of your child''s previously earned credits without requiring retesting or repeating coursework?',
 'categorical_comment',
 '["Yes","No","Partially"]',
 true, true,
 'MCEC SETS Study'),

('academic_experience', 1, 3,
 'How well did this school''s curriculum align with what your child had already learned?',
 'likert_5',
 '["Seamless","Mostly aligned","Moderate gaps","Significant gaps","Completely misaligned"]',
 true, true,
 'MCEC research on scope and sequence'),

('academic_experience', 1, 4,
 'Does this school offer Advanced Placement (AP), IB, or dual enrollment options?',
 'categorical',
 '["Yes","No","Unknown"]',
 true, true,
 'SchoolQuest'),

-- Section 2: Enrollment & Transition
('enrollment_transition', 2, 1,
 'How long did it take from your initial contact to your child''s first day of class?',
 'ordinal_time',
 '["Same day","1–3 days","1 week","2–3 weeks","More than 3 weeks"]',
 true, true,
 'Ruff & Keim (2011)'),

('enrollment_transition', 2, 2,
 'Did the school accommodate mid-year enrollment without penalizing your child for missed assignments or assessments?',
 'categorical',
 '["Yes","No","Partially"]',
 true, true,
 'Interstate Compact on Educational Opportunity for Military Children'),

('enrollment_transition', 2, 3,
 'Were you aware of the Interstate Compact on Educational Opportunity for Military Children before this PCS?',
 'categorical',
 '["Yes","No"]',
 true, false,
 'EdChoice Military Survey (2017)'),

('enrollment_transition', 2, 4,
 'Did the school demonstrate familiarity with the Interstate Compact on Educational Opportunity for Military Children?',
 'categorical',
 '["Yes","No","Unsure"]',
 true, true,
 'MCEC research on school staff military culture awareness'),

('enrollment_transition', 2, 5,
 'How would you rate the school''s front office/administrative staff in handling military family enrollment paperwork?',
 'likert_5',
 '["Very poor","Poor","Adequate","Good","Excellent"]',
 true, true,
 'Ruff & Keim (2011)'),

-- Section 3: Special Needs & Support
('special_needs_support', 3, 1,
 'Does this school have a dedicated School Liaison Officer (SLO) contact or military family point of contact?',
 'categorical',
 '["Yes","No","Unknown"]',
 true, true,
 'RAND 2025 Needs Assessment'),

('special_needs_support', 3, 2,
 'If your child has an IEP or 504 plan, was it honored promptly upon enrollment?',
 'categorical',
 '["Yes","No","Partially","Not applicable"]',
 true, true,
 'Interstate Compact; MCEC SETS Study'),

('special_needs_support', 3, 3,
 'Does this school hold a Purple Star designation?',
 'categorical',
 '["Yes","No","Unknown"]',
 true, true,
 'Military Spouse Advocacy Network'),

('special_needs_support', 3, 4,
 'How accessible and responsive is the school''s counseling or socio-emotional support staff for children experiencing transition stress?',
 'likert_5',
 '["Very inaccessible","Somewhat inaccessible","Neutral","Accessible","Very accessible"]',
 true, true,
 'RAND 2025; PFS-MF resilience construct'),

-- Section 4: Community & Belonging
('community_belonging', 4, 1,
 'How quickly did your child feel socially adjusted at this school?',
 'ordinal_time',
 '["Within the first week","Within 2–4 weeks","1–3 months","More than 3 months","Has not yet adjusted"]',
 true, true,
 'Ruff & Keim (2011)'),

('community_belonging', 4, 2,
 'Does the school have clubs, programs, or affinity groups that acknowledge or celebrate military family experiences?',
 'categorical',
 '["Yes","No","Unknown"]',
 true, true,
 'MCEC Student 2 Student program'),

('community_belonging', 4, 3,
 'How would you rate the school''s extracurricular variety for a child who may have developed interests at a previous school?',
 'likert_5',
 '["Very limited","Limited","Adequate","Good variety","Excellent variety"]',
 true, true,
 'MCEC SETS Study'),

('community_belonging', 4, 4,
 'This school is welcoming to military children who arrive mid-semester.',
 'agreement_5',
 '["Strongly disagree","Disagree","Neutral","Agree","Strongly agree"]',
 true, true,
 'Ruff & Keim (2011)'),

-- Section 5: Communication & Engagement
('communication_engagement', 5, 1,
 'How would you rate teacher responsiveness to parent questions or concerns?',
 'likert_5',
 '["Very unresponsive","Somewhat unresponsive","Adequate","Responsive","Very responsive"]',
 true, true,
 'Ruff & Keim (2011)'),

('communication_engagement', 5, 2,
 'Does the school use a digital platform (e.g., ParentVue, ClassDojo, Schoology) that made it easy to monitor your child''s progress remotely during the move?',
 'categorical_comment',
 '["Yes","No"]',
 true, true,
 'Practical community data'),

('communication_engagement', 5, 3,
 'How informed and involved did you feel as a parent during the transition period?',
 'likert_5',
 '["Not at all informed","Slightly informed","Moderately informed","Very informed","Extremely informed"]',
 true, true,
 'RAND 2025; PFS-MF parent engagement construct'),

-- Section 6: Overall Military-Family Fit
('overall_military_fit', 6, 1,
 'On a scale of 1–5, how military-family-friendly is this school overall?',
 'likert_5',
 '["Not at all friendly","Slightly friendly","Moderately friendly","Very friendly","Extremely friendly"]',
 true, true,
 'EdChoice Military Survey'),

('overall_military_fit', 6, 2,
 'Would you recommend this school to another military family PCSing to this area?',
 'categorical',
 '["Yes","No","With reservations"]',
 true, true,
 'Net Promoter Score methodology (Reichheld 2003)'),

('overall_military_fit', 6, 3,
 'On a scale of 0–10, how likely are you to recommend this school to another military family?',
 'nps_0_10', null,
 true, true,
 'Net Promoter Score'),

('overall_military_fit', 6, 4,
 'What is the one thing you would tell another military family about this school before they enroll?',
 'open_text', null,
 false, false,
 'Blue Star Families Lifestyle Survey; Millennium Cohort Family Study'),

-- Section 7: Reviewer Verification (not scored — demographic / trust metadata)
('reviewer_verification', 7, 1,
 'What is your relationship to the military?',
 'categorical',
 '["Active Duty Service Member","Military Spouse","Veteran","Guard/Reserve"]',
 true, false,
 'EdChoice Military Survey; Blue Star Families'),

('reviewer_verification', 7, 2,
 'What branch of service are you affiliated with?',
 'categorical',
 '["Army","Navy","Air Force","Marine Corps","Coast Guard","Space Force"]',
 true, false,
 'Standard military demographic collection; PFS-MF'),

('reviewer_verification', 7, 3,
 'When did your child attend this school?',
 'categorical',
 '["2024–2025","2023–2024","2022–2023","Earlier"]',
 true, false,
 'Dillman''s Principles — time referent required for recall-based items'),

('reviewer_verification', 7, 4,
 'How many PCS moves has your family completed?',
 'categorical',
 '["1","2–3","4–5","6+"]',
 true, false,
 'Ruff & Keim (2011)')

on conflict do nothing;
