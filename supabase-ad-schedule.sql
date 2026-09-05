-- AD Schedule — the live shooting board under FILMS.
-- One row per shoot day. Anyone may READ the board (that is the point: the
-- page is public), but only someone holding the day's write key may change
-- it, so a visitor can watch the day unfold and nobody can vandalise it.
--
-- The table itself is unreachable through the API: RLS is on with no policies
-- and no grants, so PostgREST can't select, insert, update or delete it. The
-- only way in is the two security-definer functions below, and only one of
-- them writes — and only against a matching key. The key never appears in the
-- site's JavaScript; it lives in the URL you bookmark.
--
-- Run once in Supabase → SQL Editor.

create table if not exists shoot_state (
  id         text primary key,                     -- 'advene-2026fall-d1'
  title      text not null default '',
  state      jsonb not null default '{}'::jsonb,   -- the whole board
  write_key  text not null,
  updated_at timestamptz not null default now()
);

alter table shoot_state enable row level security;
-- deliberately no policies and no grants to anon/authenticated:
-- the table is reachable only through the functions below.
revoke all on table shoot_state from anon, authenticated;

-- ---------- read: public ----------
create or replace function shoot_get(p_id text)
returns table (state jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.state, s.updated_at from shoot_state s where s.id = p_id;
$$;

-- ---------- write: needs the day's key ----------
create or replace function shoot_put(p_id text, p_key text, p_state jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare ts timestamptz;
begin
  if p_key is null or length(p_key) < 12 then
    raise exception 'bad key';
  end if;
  if length(p_state::text) > 200000 then
    raise exception 'state too large';
  end if;

  update shoot_state
     set state = p_state, updated_at = now()
   where id = p_id and write_key = p_key
   returning updated_at into ts;

  if ts is null then
    raise exception 'bad key';        -- also covers "no such day"
  end if;
  return ts;
end
$$;

revoke all on function shoot_get(text)               from public;
revoke all on function shoot_put(text, text, jsonb)  from public;
grant execute on function shoot_get(text)              to anon, authenticated;
grant execute on function shoot_put(text, text, jsonb) to anon, authenticated;

-- ---------- seed Day 1 with a fresh random key ----------
-- Printed by the select at the bottom. Copy it once: it is the only thing
-- that lets a device write to the board.
insert into shoot_state (id, title, write_key)
values ('advene-2026fall-d1',
        'ADVEVE 2026 Fall — Day 1',
        encode(gen_random_bytes(16), 'hex'))
on conflict (id) do nothing;

select id, title, write_key,
       'https://haolang-li.com/films/ad-schedule#k=' || write_key as bookmark_this
  from shoot_state
 where id = 'advene-2026fall-d1';
