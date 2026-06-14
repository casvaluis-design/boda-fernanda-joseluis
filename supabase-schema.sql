-- ============================================================
-- SCHEMA BODA FERNANDA & JOSE LUIS
-- Ejecutar completo en Supabase SQL Editor
-- ============================================================

-- Tabla de invitados
create table guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,                          -- Para botón de WhatsApp
  guest_type text not null check (guest_type in ('individual', 'couple', 'family')),
  max_companions int not null default 0,
  token text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 32),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  hotel_assignment text check (hotel_assignment in ('hotel_alma', 'none')) default 'none',
  notes text default '',
  created_at timestamptz default now()
);

-- Tabla de respuestas RSVP
create table rsvp_responses (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  attending boolean not null,
  attendee_count int not null default 1,           -- cuántas personas vienen
  allergies text not null default '',              -- alergias del grupo
  events jsonb not null default '[]',              -- ["civil","ceremonia","tornaboda"]
  accommodation text check (accommodation in ('casa_begonias', 'otro', 'none')),
  message text,
  submitted_at timestamptz default now()
);

-- Índices
create index on guests(token);
create index on rsvp_responses(guest_id);

-- RLS
alter table guests enable row level security;
alter table rsvp_responses enable row level security;

create policy "guests_read_by_token" on guests
  for select using (true);

create policy "rsvp_insert" on rsvp_responses
  for insert with check (true);

create policy "rsvp_select" on rsvp_responses
  for select using (true);

-- Datos de ejemplo
insert into guests (name, phone, guest_type, max_companions) values
  ('María González',    '5211234567', 'individual', 0),
  ('Carlos y Ana López','5219876543', 'couple',     1),
  ('Familia Martínez',  '5215554433', 'family',     4);
