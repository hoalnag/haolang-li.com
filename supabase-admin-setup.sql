-- Admin: folders + uploads. Run once in Supabase → SQL Editor.
-- Writes require a signed-in owner; reads are public.

-- ========== folders ==========
create table if not exists folders (
  id         uuid primary key default gen_random_uuid(),
  parent     uuid references folders(id) on delete cascade,   -- null = a top-level (big) folder
  name       text not null check (char_length(name) between 1 and 40),
  pos        int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists folders_tree on folders (parent, pos);

grant select on folders to anon, authenticated;
grant insert, update, delete on folders to authenticated;
alter table folders enable row level security;

drop policy if exists "folders read"  on folders;
drop policy if exists "folders write" on folders;
create policy "folders read"  on folders for select to anon, authenticated using (true);
create policy "folders write" on folders for all    to authenticated using (true) with check (true);

-- seed the current structure once (skipped automatically if folders already exist)
do $$
declare ai uuid; film uuid; wr uuid; rd uuid; ft uuid;
begin
  if not exists (select 1 from folders) then
    insert into folders (name, pos) values ('AI',0)          returning id into ai;
    insert into folders (name, pos) values ('FILM',1)        returning id into film;
    insert into folders (name, pos) values ('WRITINGS',2)    returning id into wr;
    insert into folders (name, pos) values ('READINGS',3)    returning id into rd;
    insert into folders (name, pos) values ('FLAT THINGS',4) returning id into ft;
    insert into folders (parent,name,pos) values
      (ai,'AVA Studio',0),(ai,'Test Footage',1),
      (film,'Short Films',0),(film,'Cinematography',1),(film,'Festival & Sales',2),(film,'Poster Design',3),
      (wr,'Self Talk',0),(wr,'Poems',1),
      (rd,'Reading Notes',0),(rd,'Papers',1),
      (ft,'Digital',0),(ft,'Celluloid',1),(ft,'Randomness',2),(ft,'Mappings',3);
  end if;
end $$;

-- ========== uploads (Storage bucket) ==========
-- create a public bucket named 'uploads' so materials can be listed/fetched;
-- only a signed-in owner can add or remove files.
insert into storage.buckets (id, name, public)
  values ('uploads','uploads', true)
  on conflict (id) do update set public = true;

drop policy if exists "uploads read"   on storage.objects;
drop policy if exists "uploads write"  on storage.objects;
drop policy if exists "uploads delete" on storage.objects;
create policy "uploads read"   on storage.objects for select to anon, authenticated using (bucket_id = 'uploads');
create policy "uploads write"  on storage.objects for insert to authenticated with check (bucket_id = 'uploads');
create policy "uploads delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads');
