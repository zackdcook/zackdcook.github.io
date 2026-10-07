-- Five-foot Be Brave re-carve gate.
-- Apply to the isolated development database first.

create or replace function private.bebrave_finalize_one(p_session uuid)
returns text language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; seq bigint; finished timestamptz;
begin
  select * into s from public.bebrave_sessions where id=p_session for update;
  if not found then return 'missing'; end if;
  if s.status in ('completed','empty','cancelled') then return s.status; end if;
  if s.status <> 'drawing' or s.drawing_deadline is null or s.drawing_deadline > clock_timestamp() then return s.status; end if;

  finished := s.drawing_deadline;

  if s.point_count > 0 then
    perform pg_advisory_xact_lock(731001);

    update public.bebrave_tree_state
      set completed_count=completed_count+1,
          pending_growth_carvings=pending_growth_carvings+1,
          updated_at=now()
      where id=true
      returning completed_count into seq;

    update public.bebrave_sessions
      set status='completed',
          drawing_finished_at=finished,
          public_sequence=seq,
          updated_at=now()
      where id=s.id;

    update public.bebrave_visitors
      set last_carved_at=finished,last_seen_at=now()
      where id=s.visitor_id;
  else
    update public.bebrave_sessions
      set status='empty',drawing_finished_at=finished,updated_at=now()
      where id=s.id;

    update public.bebrave_visitors set last_seen_at=now() where id=s.visitor_id;
  end if;

  return case when s.point_count > 0 then 'completed' else 'empty' end;
end;
$$;

create or replace function public.bebrave_create_or_resume_session(
  p_visitor_hash text,p_network_hash text,p_browser_hint text,
  p_roll_arrowhead integer,p_roll_nail integer,p_roll_key integer
) returns uuid language plpgsql security invoker set search_path='' as $$
declare
  v public.bebrave_visitors;
  s public.bebrave_sessions;
  h bigint;
  last_height bigint;
  remaining integer;
begin
  if length(p_visitor_hash)<>64 or length(p_network_hash)<>64 or length(p_browser_hint)<>64 then raise exception 'invalid identity'; end if;
  if p_roll_arrowhead not between 0 and 9999 or p_roll_nail not between 0 and 9999 or p_roll_key not between 0 and 9999 then raise exception 'invalid rolls'; end if;

  perform private.bebrave_take_limit('session:visitor:'||p_visitor_hash,8,3600);
  perform private.bebrave_take_limit('session:network:'||p_network_hash,24,3600);
  perform private.bebrave_finalize_overdue();

  insert into public.bebrave_visitors(visitor_hash,browser_hint)
    values(p_visitor_hash,p_browser_hint)
    on conflict(visitor_hash)
    do update set last_seen_at=now(),browser_hint=excluded.browser_hint;

  select * into v
  from public.bebrave_visitors
  where visitor_hash=p_visitor_hash
  for update;

  select * into s
  from public.bebrave_sessions
  where visitor_id=v.id
    and status in ('tool_select','epic_color','ready','drawing')
  order by created_at desc
  limit 1
  for update;

  if found then return s.id; end if;

  select height into h from public.bebrave_tree_state where id=true;

  select zone_bottom into last_height
  from public.bebrave_sessions
  where visitor_id=v.id
    and status='completed'
    and zone_bottom is not null
  order by public_sequence desc
  limit 1;

  if last_height is not null and h < last_height + 1440 then
    remaining := ceil((last_height + 1440 - h) / 288.0)::integer;
    raise exception 'growth:%',remaining;
  end if;

  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key)
    values(v.id,p_roll_arrowhead,p_roll_nail,p_roll_key)
    returning * into s;

  return s.id;
end;
$$;

create or replace function public.bebrave_start_drawing(
  p_session uuid,p_visitor_hash text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  s public.bebrave_sessions;
  v public.bebrave_visitors;
  t public.bebrave_tree_state;
  started timestamptz;
  last_height bigint;
  remaining integer;
begin
  perform private.bebrave_finalize_overdue();

  select * into v
  from public.bebrave_visitors
  where visitor_hash=p_visitor_hash
  for update;

  select * into s
  from public.bebrave_sessions
  where id=p_session and visitor_id=v.id
  for update;

  if not found then raise exception 'session not owned'; end if;

  if s.status='drawing' then
    return jsonb_build_object(
      'started_at',s.drawing_started_at,
      'deadline',s.drawing_deadline,
      'zone_top',s.zone_top,
      'zone_bottom',s.zone_bottom,
      'tree_revision',s.tree_revision
    );
  end if;

  if s.status<>'ready' or s.chosen_color is null or s.chosen_rarity is null then
    raise exception 'session not ready';
  end if;

  select * into t from public.bebrave_tree_state where id=true for share;

  select zone_bottom into last_height
  from public.bebrave_sessions
  where visitor_id=v.id
    and status='completed'
    and zone_bottom is not null
  order by public_sequence desc
  limit 1;

  if last_height is not null and t.height < last_height + 1440 then
    remaining := ceil((last_height + 1440 - t.height) / 288.0)::integer;
    raise exception 'growth:%',remaining;
  end if;

  started := clock_timestamp();

  update public.bebrave_sessions
  set status='drawing',
      drawing_started_at=started,
      drawing_deadline=started+interval '60 seconds',
      zone_top=t.active_top,
      zone_bottom=t.active_bottom,
      tree_revision=t.revision,
      updated_at=now()
  where id=s.id;

  return jsonb_build_object(
    'started_at',started,
    'deadline',started+interval '60 seconds',
    'zone_top',t.active_top,
    'zone_bottom',t.active_bottom,
    'tree_revision',t.revision
  );
end;
$$;

-- Deleting one session in Supabase now also removes its stroke chunks
-- and any cache-redemption row belonging to it.
alter table public.bebrave_cache_redemptions
  drop constraint if exists bebrave_cache_redemptions_session_id_fkey;

alter table public.bebrave_cache_redemptions
  add constraint bebrave_cache_redemptions_session_id_fkey
  foreign key (session_id)
  references public.bebrave_sessions(id)
  on delete cascade;

-- Calendar cooldown is no longer part of the data model.
alter table public.bebrave_visitors
  drop column if exists next_carve_at;
