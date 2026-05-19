create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  active boolean not null default true,
  draw_pool text not null default 'present' check (draw_pool in ('present', 'all')),
  timezone text not null default 'America/Tijuana',
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  employee_number text not null,
  name text not null,
  region text not null default '',
  plaza text not null default '',
  store text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, employee_number)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  employee_number text not null,
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (event_id, employee_number)
);

create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_id uuid not null references public.attendees(id) on delete cascade,
  employee_number text not null,
  pool text not null check (pool in ('present', 'all')),
  created_at timestamptz not null default now()
);

create index if not exists idx_events_active on public.events(active);
create index if not exists idx_attendees_event on public.attendees(event_id);
create index if not exists idx_attendance_event on public.attendance(event_id);
create index if not exists idx_attendance_attendee on public.attendance(attendee_id);
create index if not exists idx_draws_event on public.draws(event_id);

alter table public.events enable row level security;
alter table public.attendees enable row level security;
alter table public.attendance enable row level security;
alter table public.draws enable row level security;
