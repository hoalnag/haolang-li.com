-- Guest Book — run this once in Supabase → SQL Editor
-- Public board with review: anyone may sign it, nothing shows until approved.

create table if not exists drawings (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  src        text not null,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

-- Guardrails, so a public endpoint can't be used to dump junk into the table
alter table drawings add constraint name_len
  check (char_length(name) between 1 and 60);
alter table drawings add constraint src_is_png
  check (src like 'data:image/png;base64,%');
alter table drawings add constraint src_size
  check (char_length(src) <= 900000);           -- ~650 KB per page

create index if not exists drawings_recent
  on drawings (created_at desc) where approved;

alter table drawings enable row level security;

-- Visitors read only what you have approved
create policy "read approved" on drawings
  for select using (approved = true);

-- Visitors may sign the book, but cannot approve their own page
create policy "anyone may sign" on drawings
  for insert with check (approved = false);

-- No update or delete policy exists, so nobody can edit or wipe the book.
-- You moderate from the Supabase dashboard: Table Editor → drawings →
-- tick `approved` to publish a page, or delete the row to reject it.
