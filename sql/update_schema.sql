-- Schema update for RH Physio

-- Extensions
create extension if not exists "pgcrypto";

-- Clinics table
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  cabins_count int,
  color text,
  created_at timestamptz default now()
);

-- Therapists table
create table if not exists public.therapists (
  id uuid primary key default gen_random_uuid(),
  initials text not null,
  full_name text,
  contract_percent int,
  notes text,
  created_at timestamptz default now()
);

-- Cabins table
create table if not exists public.cabins (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Allocations table
create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  therapist_id uuid references therapists(id) on delete cascade,
  date date not null,
  half_day text check (half_day in ('morning','afternoon')),
  is_homecare boolean default false,
  created_at timestamptz default now()
);

-- Weeks helper table (optional)
create table if not exists public.weeks (
  week_start date primary key
);

-- Indexes
create index if not exists cabins_clinic_id_idx on cabins(clinic_id);
create index if not exists allocations_date_halfday_idx on allocations(date, half_day);
create index if not exists allocations_therapist_idx on allocations(therapist_id);

-- Row Level Security
alter table clinics enable row level security;
alter table therapists enable row level security;
alter table cabins enable row level security;
alter table allocations enable row level security;
alter table weeks enable row level security;

-- Policies (authenticated users)
-- Clinics
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'clinics_select_auth') then
    create policy clinics_select_auth on clinics for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'clinics_modify_auth') then
    create policy clinics_modify_auth on clinics for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
-- Therapists
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'therapists_select_auth') then
    create policy therapists_select_auth on therapists for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'therapists_modify_auth') then
    create policy therapists_modify_auth on therapists for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
-- Cabins
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'cabins_select_auth') then
    create policy cabins_select_auth on cabins for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'cabins_modify_auth') then
    create policy cabins_modify_auth on cabins for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
-- Allocations
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'allocations_select_auth') then
    create policy allocations_select_auth on allocations for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'allocations_modify_auth') then
    create policy allocations_modify_auth on allocations for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
-- Weeks

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'weeks_select_auth') then
    create policy weeks_select_auth on weeks for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'weeks_modify_auth') then
    create policy weeks_modify_auth on weeks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- View for weekly balance
create or replace view public.v_week_balance as
select clinic_id, therapist_id, date_trunc('week', date) as week_start,
       count(*) as half_days
from allocations
group by clinic_id, therapist_id, week_start;

-- Seeds (idempotent)
insert into clinics (id, name, city, cabins_count, color)
values
  ('00000000-0000-0000-0000-000000000001','Bulle','Bulle',2,'#ff0000'),
  ('00000000-0000-0000-0000-000000000002','Vuadens','Vuadens',2,'#00ff00'),
  ('00000000-0000-0000-0000-000000000003','La Tour-de-Trême','La Tour-de-Trême',1,'#0000ff')
on conflict (id) do nothing;

insert into therapists (id, initials, full_name, contract_percent)
values
  ('00000000-0000-0000-0000-000000000101','AB','Ana Bravo',100),
  ('00000000-0000-0000-0000-000000000102','CD','Carlos Dias',80),
  ('00000000-0000-0000-0000-000000000103','EF','Eva Fonseca',60),
  ('00000000-0000-0000-0000-000000000104','GH','Guilherme Hora',40)
on conflict (id) do nothing;

insert into cabins (id, clinic_id, name, is_active)
values
  ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000001','Sala 1',true),
  ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000001','Sala 2',true),
  ('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000002','Sala 1',true)
on conflict (id) do nothing;

-- End of script
