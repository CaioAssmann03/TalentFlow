-- HireLens Ético — schema inicial
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- (Project -> SQL Editor -> New query -> cole o conteúdo -> Run)

create extension if not exists "pgcrypto";

-- ---------- sessions ----------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status text not null default 'lobby'
    check (status in ('lobby', 'voting', 'closed', 'revealed', 'finished')),
  current_dilemma_index integer not null default 0,
  created_at timestamptz not null default now(),
  finalized_at timestamptz
);

-- ---------- participants ----------
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  nickname text not null default 'Participante',
  created_at timestamptz not null default now()
);

-- ---------- votes ----------
-- dilemma_id and option_id reference the static config in src/data/dilemmas.ts
-- (not separate tables), since dilemma content is versioned in code, not the DB.
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  dilemma_id text not null,
  participant_id uuid not null references public.participants(id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  -- a participant can only vote once per dilemma
  unique (participant_id, dilemma_id)
);

create index if not exists votes_session_dilemma_idx on public.votes (session_id, dilemma_id);
create index if not exists participants_session_idx on public.participants (session_id);

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.votes;

-- ---------- Row Level Security ----------
-- This is a classroom demo with no personal data and a shared admin password
-- enforced at the application layer, so RLS is opened for anon read/write on
-- these three tables. If you need stricter guarantees (e.g. public deploy
-- left running unattended), tighten these policies or move mutations behind
-- a Supabase Edge Function.

alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.votes enable row level security;

create policy "sessions_select_all" on public.sessions for select using (true);
create policy "sessions_insert_all" on public.sessions for insert with check (true);
create policy "sessions_update_all" on public.sessions for update using (true);

create policy "participants_select_all" on public.participants for select using (true);
create policy "participants_insert_all" on public.participants for insert with check (true);
create policy "participants_delete_all" on public.participants for delete using (true);

create policy "votes_select_all" on public.votes for select using (true);
create policy "votes_insert_all" on public.votes for insert with check (true);
create policy "votes_delete_all" on public.votes for delete using (true);
