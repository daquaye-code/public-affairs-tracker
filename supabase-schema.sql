-- ============================================================
-- Report Tracker: Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Officers table
create table if not exists officers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  area_office text not null,
  created_at timestamp with time zone default now()
);

-- 2. Report types table
create table if not exists report_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- 3. Report submissions table
create table if not exists report_submissions (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid not null references officers(id) on delete cascade,
  report_type_id uuid not null references report_types(id) on delete cascade,
  report_month text not null,
  submitted boolean default false,
  notes text,
  file_url text,
  submitted_at timestamp with time zone,
  updated_at timestamp with time zone default now(),
  unique(officer_id, report_type_id, report_month)
);

-- Indexes for common query patterns
create index if not exists idx_submissions_month on report_submissions(report_month);
create index if not exists idx_submissions_officer on report_submissions(officer_id);

-- ============================================================
-- Row Level Security (RLS)
-- For an internal tool with anon key access, we allow all ops.
-- Tighten these policies when you add authentication.
-- ============================================================

alter table officers enable row level security;
alter table report_types enable row level security;
alter table report_submissions enable row level security;

-- Allow all operations for anon role (internal tool)
create policy "Allow all on officers" on officers for all using (true) with check (true);
create policy "Allow all on report_types" on report_types for all using (true) with check (true);
create policy "Allow all on report_submissions" on report_submissions for all using (true) with check (true);
