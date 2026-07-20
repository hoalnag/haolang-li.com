-- Guest Book — run this once in Supabase → SQL Editor.
-- Safe to re-run: brings an existing `drawings` table up to the moderated spec.

-- table (created earlier without the review column in some setups)
create table if not exists drawings (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  src        text not null,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

-- the review column, if the table predates it
alter table drawings add column if not exists approved boolean not null default false;

-- guardrails, so a public endpoint can't be used to dump junk into the table
alter table drawings drop constraint if exists name_len;
alter table drawings add  constraint name_len  check (char_length(name) between 1 and 60);
alter table drawings drop constraint if exists src_is_png;
alter table drawings add  constraint src_is_png check (src like 'data:image/png;base64,%');
alter table drawings drop constraint if exists src_size;
alter table drawings add  constraint src_size  check (char_length(src) <= 900000);  -- ~650 KB

create index if not exists drawings_recent
  on drawings (created_at desc) where approved;

alter table drawings enable row level security;

-- replace any earlier permissive policies with the moderated pair
drop policy if exists "anyone can read"  on drawings;
drop policy if exists "anyone can sign"  on drawings;
drop policy if exists "read approved"    on drawings;
drop policy if exists "anyone may sign"  on drawings;

-- visitors read only what you have approved
create policy "read approved" on drawings
  for select using (approved = true);

-- visitors may sign the book, but cannot approve their own page
create policy "anyone may sign" on drawings
  for insert with check (approved = false);

-- No update or delete policy exists, so nobody can edit or wipe the book.
-- Moderate from Table Editor → drawings: tick `approved` to publish, or
-- delete the row to reject.

-- clear the probe row from testing, if present
delete from drawings where name = 'probe test';
