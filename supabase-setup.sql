-- Guest Book — one shared public canvas.
-- Every mark (a pen stroke, a line of text, a photo) is one row; the board is
-- replayed from these in time order. Run once in Supabase → SQL Editor.

create table if not exists board (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('path','text','photo')),
  payload    jsonb not null,
  created_at timestamptz not null default now()
);

-- keep a single row small (a downscaled photo is the largest case)
alter table board drop constraint if exists payload_size;
alter table board add  constraint payload_size check (length(payload::text) <= 400000);

create index if not exists board_order on board (created_at);

-- API roles reach the table; RLS still governs what they may do
grant select, insert on board to anon, authenticated;
alter table board enable row level security;

drop policy if exists "read board" on board;
drop policy if exists "draw on board" on board;

-- it is a public wall: anyone may read the whole board and add to it
create policy "read board"    on board for select to anon, authenticated using (true);
create policy "draw on board" on board for insert to anon, authenticated with check (true);

-- No update or delete policy, so visitors can't erase the wall.
-- To wipe it yourself: run  delete from board;  here in the SQL editor.

-- The old per-drawing table is no longer used; uncomment to remove it:
-- drop table if exists drawings;
