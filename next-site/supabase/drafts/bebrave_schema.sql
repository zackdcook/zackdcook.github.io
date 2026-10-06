-- DRAFT: run `supabase migration new be_brave_tree` and copy this file into the
-- generated migration before applying it. This deliberately keeps all browser
-- access behind Next.js route handlers using the service key.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

grant usage on schema private to service_role;

create table if not exists public.bebrave_tree_state (
  id boolean primary key default true check (id),
  height bigint not null default 8640 check (height >= 1440),
  active_top bigint not null default 7200 check (active_top >= 0),
  active_bottom bigint not null default 8640 check (active_bottom > active_top),
  revision bigint not null default 1 check (revision >= 1),
  completed_count bigint not null default 0 check (completed_count >= 0),
  pending_growth_carvings integer not null default 0 check (pending_growth_carvings >= 0),
  last_growth_interval timestamptz not null default (date_trunc('hour', now()) - interval '1 hour'),
  updated_at timestamptz not null default now(),
  check (active_bottom = height),
  check (active_bottom - active_top = 1440)
);
insert into public.bebrave_tree_state(id) values(true) on conflict(id) do nothing;

create table if not exists public.bebrave_visitors (
  id uuid primary key default extensions.gen_random_uuid(),
  visitor_hash text not null unique check (length(visitor_hash) = 64),
  browser_hint text check (browser_hint is null or length(browser_hint) = 64),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_carved_at timestamptz,
  next_carve_at timestamptz
);

create table if not exists public.bebrave_cache_codes (
  id uuid primary key default extensions.gen_random_uuid(),
  code_digest text not null unique check (length(code_digest) = 64),
  campaign text not null default 'unspecified' check (char_length(campaign) between 1 and 120),
  source text not null default 'manual' check (char_length(source) between 1 and 120),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  max_redemptions integer default 1 check (max_redemptions is null or max_redemptions >= 1),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  last_redeemed_at timestamptz,
  disabled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.bebrave_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  visitor_id uuid not null references public.bebrave_visitors(id) on delete restrict,
  created_at timestamptz not null default now(),
  status text not null default 'tool_select' check (status in ('tool_select','epic_color','ready','drawing','completed','empty','cancelled')),
  roll_arrowhead integer not null check (roll_arrowhead between 0 and 9999),
  roll_nail integer not null check (roll_nail between 0 and 9999),
  roll_key integer not null check (roll_key between 0 and 9999),
  chosen_tool text check (chosen_tool is null or chosen_tool in ('arrowhead','nail','key','cache')),
  chosen_rarity text check (chosen_rarity is null or chosen_rarity in ('common','uncommon','superior','epic')),
  chosen_color text check (chosen_color is null or chosen_color ~ '^#[0-9A-Fa-f]{6}$'),
  effect_seed integer,
  cache_code_id uuid references public.bebrave_cache_codes(id) on delete set null,
  drawing_started_at timestamptz,
  drawing_deadline timestamptz,
  drawing_finished_at timestamptz,
  zone_top bigint,
  zone_bottom bigint,
  tree_revision bigint,
  public_sequence bigint unique,
  chunk_count integer not null default 0 check (chunk_count >= 0),
  point_count integer not null default 0 check (point_count >= 0),
  updated_at timestamptz not null default now(),
  check (zone_top is null or zone_top >= 0),
  check (zone_bottom is null or zone_bottom > zone_top)
);

create index if not exists bebrave_sessions_visitor_status_idx on public.bebrave_sessions(visitor_id,status,created_at desc);
create index if not exists bebrave_sessions_zone_idx on public.bebrave_sessions(zone_top,zone_bottom) where public_sequence is not null;
create index if not exists bebrave_sessions_public_sequence_idx on public.bebrave_sessions(public_sequence desc) where public_sequence is not null;
create index if not exists bebrave_sessions_deadline_idx on public.bebrave_sessions(drawing_deadline) where status='drawing';

create table if not exists public.bebrave_stroke_chunks (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.bebrave_sessions(id) on delete cascade,
  stroke_id uuid not null,
  stroke_order integer not null check (stroke_order between 0 and 1024),
  chunk_index integer not null check (chunk_index between 0 and 2048),
  points jsonb not null check (jsonb_typeof(points) = 'array'),
  created_at timestamptz not null default now(),
  unique(session_id,stroke_id,chunk_index)
);
create index if not exists bebrave_chunks_session_order_idx on public.bebrave_stroke_chunks(session_id,stroke_order,chunk_index);

create table if not exists public.bebrave_cache_redemptions (
  id bigint generated always as identity primary key,
  code_id uuid not null references public.bebrave_cache_codes(id) on delete restrict,
  visitor_id uuid not null references public.bebrave_visitors(id) on delete restrict,
  session_id uuid not null unique references public.bebrave_sessions(id) on delete restrict,
  redeemed_at timestamptz not null default now()
);
create index if not exists bebrave_cache_redemptions_code_idx on public.bebrave_cache_redemptions(code_id,redeemed_at desc);

create table if not exists private.bebrave_rate_limits (
  key text primary key,
  count integer not null check (count >= 0),
  window_ends timestamptz not null
);

alter table public.bebrave_tree_state enable row level security;
alter table public.bebrave_visitors enable row level security;
alter table public.bebrave_cache_codes enable row level security;
alter table public.bebrave_sessions enable row level security;
alter table public.bebrave_stroke_chunks enable row level security;
alter table public.bebrave_cache_redemptions enable row level security;

revoke all on public.bebrave_tree_state, public.bebrave_visitors, public.bebrave_cache_codes,
  public.bebrave_sessions, public.bebrave_stroke_chunks, public.bebrave_cache_redemptions
  from public, anon, authenticated;
grant all on public.bebrave_tree_state, public.bebrave_visitors, public.bebrave_cache_codes,
  public.bebrave_sessions, public.bebrave_stroke_chunks, public.bebrave_cache_redemptions
  to service_role;
grant usage, select on all sequences in schema public to service_role;
revoke all on private.bebrave_rate_limits from public, anon, authenticated;
grant all on private.bebrave_rate_limits to service_role;

create or replace function private.bebrave_roll_tier(p_roll integer)
returns text language sql immutable security invoker set search_path='' as $$
  select case
    when p_roll < 5000 then 'common'
    when p_roll < 8000 then 'uncommon'
    when p_roll < 9500 then 'superior'
    else 'epic'
  end;
$$;

create or replace function private.bebrave_take_limit(p_key text,p_limit integer,p_window_seconds integer)
returns void language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_key) > 220 then raise exception 'invalid rate limit'; end if;
  delete from private.bebrave_rate_limits where window_ends < now() - interval '1 day';
  insert into private.bebrave_rate_limits(key,count,window_ends)
    values(p_key,1,now()+make_interval(secs=>p_window_seconds))
  on conflict(key) do update set
    count = case when private.bebrave_rate_limits.window_ends <= now() then 1 else private.bebrave_rate_limits.count + 1 end,
    window_ends = case when private.bebrave_rate_limits.window_ends <= now() then now()+make_interval(secs=>p_window_seconds) else private.bebrave_rate_limits.window_ends end
  returning count into n;
  if n > p_limit then raise exception 'rate limit'; end if;
end;
$$;

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
      set status='completed',drawing_finished_at=finished,public_sequence=seq,updated_at=now()
      where id=s.id;
  else
    update public.bebrave_sessions
      set status='empty',drawing_finished_at=finished,updated_at=now()
      where id=s.id;
  end if;
  update public.bebrave_visitors
    set last_carved_at=finished,next_carve_at=finished+interval '28 days',last_seen_at=now()
    where id=s.visitor_id;
  return case when s.point_count > 0 then 'completed' else 'empty' end;
end;
$$;

create or replace function private.bebrave_finalize_overdue()
returns integer language plpgsql security invoker set search_path='' as $$
declare r record; n integer := 0;
begin
  for r in select id from public.bebrave_sessions where status='drawing' and drawing_deadline <= clock_timestamp() order by drawing_deadline for update skip locked loop
    perform private.bebrave_finalize_one(r.id);
    n := n + 1;
  end loop;
  return n;
end;
$$;

create or replace function public.bebrave_turnstile_limit(p_visitor_hash text,p_network_hash text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if length(p_visitor_hash)<>64 or length(p_network_hash)<>64 then raise exception 'invalid identity'; end if;
  perform private.bebrave_take_limit('turnstile:visitor:'||p_visitor_hash,12,3600);
  perform private.bebrave_take_limit('turnstile:network:'||p_network_hash,40,3600);
end;
$$;

create or replace function public.bebrave_create_or_resume_session(
  p_visitor_hash text,p_network_hash text,p_browser_hint text,
  p_roll_arrowhead integer,p_roll_nail integer,p_roll_key integer
) returns uuid language plpgsql security invoker set search_path='' as $$
declare v public.bebrave_visitors; s public.bebrave_sessions;
begin
  if length(p_visitor_hash)<>64 or length(p_network_hash)<>64 or length(p_browser_hint)<>64 then raise exception 'invalid identity'; end if;
  if p_roll_arrowhead not between 0 and 9999 or p_roll_nail not between 0 and 9999 or p_roll_key not between 0 and 9999 then raise exception 'invalid rolls'; end if;
  perform private.bebrave_take_limit('session:visitor:'||p_visitor_hash,8,3600);
  perform private.bebrave_take_limit('session:network:'||p_network_hash,24,3600);
  perform private.bebrave_finalize_overdue();
  insert into public.bebrave_visitors(visitor_hash,browser_hint)
    values(p_visitor_hash,p_browser_hint)
    on conflict(visitor_hash) do update set last_seen_at=now(),browser_hint=excluded.browser_hint;
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  if v.next_carve_at is not null and v.next_carve_at > now() then raise exception 'cooldown:%',v.next_carve_at; end if;
  select * into s from public.bebrave_sessions
    where visitor_id=v.id and status in ('tool_select','epic_color','ready','drawing')
    order by created_at desc limit 1 for update;
  if found then return s.id; end if;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key)
    values(v.id,p_roll_arrowhead,p_roll_nail,p_roll_key) returning * into s;
  return s.id;
end;
$$;

create or replace function public.bebrave_choose_tool(
  p_session uuid,p_visitor_hash text,p_tool text,p_color text,p_seed integer
) returns text language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v uuid; r text;
begin
  if p_tool not in ('arrowhead','nail','key') or p_color !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'invalid choice'; end if;
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found then raise exception 'session not owned'; end if;
  if s.chosen_tool is not null then
    if s.chosen_tool<>p_tool then raise exception 'tool already chosen'; end if;
    return s.chosen_rarity;
  end if;
  if s.status<>'tool_select' then raise exception 'session not choosing'; end if;
  r := private.bebrave_roll_tier(case p_tool when 'arrowhead' then s.roll_arrowhead when 'nail' then s.roll_nail else s.roll_key end);
  update public.bebrave_sessions set chosen_tool=p_tool,chosen_rarity=r,chosen_color=p_color,effect_seed=p_seed,status='ready',updated_at=now() where id=s.id;
  return r;
end;
$$;

create or replace function public.bebrave_redeem_cache(
  p_session uuid,p_visitor_hash text,p_network_hash text,p_code_digest text,p_seed integer
) returns boolean language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v public.bebrave_visitors; c public.bebrave_cache_codes;
begin
  perform private.bebrave_take_limit('cache:visitor:'||p_visitor_hash,10,900);
  perform private.bebrave_take_limit('cache:network:'||p_network_hash,30,900);
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v.id for update;
  if not found or s.status<>'tool_select' or s.chosen_tool is not null then raise exception 'session not choosing'; end if;
  select * into c from public.bebrave_cache_codes where code_digest=p_code_digest for update;
  if not found or c.disabled_at is not null or (c.expires_at is not null and c.expires_at<=now()) or (c.max_redemptions is not null and c.redemption_count>=c.max_redemptions) then return false; end if;
  update public.bebrave_cache_codes set redemption_count=redemption_count+1,last_redeemed_at=now() where id=c.id;
  insert into public.bebrave_cache_redemptions(code_id,visitor_id,session_id) values(c.id,v.id,s.id);
  update public.bebrave_sessions set chosen_tool='cache',chosen_rarity='epic',chosen_color=null,effect_seed=p_seed,cache_code_id=c.id,status='epic_color',updated_at=now() where id=s.id;
  return true;
end;
$$;

create or replace function public.bebrave_choose_epic_color(p_session uuid,p_visitor_hash text,p_color text)
returns void language plpgsql security invoker set search_path='' as $$
declare v uuid;
begin
  if p_color !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'invalid color'; end if;
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  update public.bebrave_sessions set chosen_color=p_color,status='ready',updated_at=now()
    where id=p_session and visitor_id=v and chosen_tool='cache' and chosen_rarity='epic' and status='epic_color';
  if not found then raise exception 'session not choosing color'; end if;
end;
$$;

create or replace function public.bebrave_start_drawing(p_session uuid,p_visitor_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v public.bebrave_visitors; t public.bebrave_tree_state; started timestamptz;
begin
  perform private.bebrave_finalize_overdue();
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v.id for update;
  if not found then raise exception 'session not owned'; end if;
  if s.status='drawing' then return jsonb_build_object('started_at',s.drawing_started_at,'deadline',s.drawing_deadline,'zone_top',s.zone_top,'zone_bottom',s.zone_bottom,'tree_revision',s.tree_revision); end if;
  if s.status<>'ready' or s.chosen_color is null or s.chosen_rarity is null then raise exception 'session not ready'; end if;
  if v.next_carve_at is not null and v.next_carve_at>now() then raise exception 'cooldown:%',v.next_carve_at; end if;
  select * into t from public.bebrave_tree_state where id=true for share;
  started := clock_timestamp();
  update public.bebrave_sessions set status='drawing',drawing_started_at=started,drawing_deadline=started+interval '60 seconds',zone_top=t.active_top,zone_bottom=t.active_bottom,tree_revision=t.revision,updated_at=now() where id=s.id;
  return jsonb_build_object('started_at',started,'deadline',started+interval '60 seconds','zone_top',t.active_top,'zone_bottom',t.active_bottom,'tree_revision',t.revision);
end;
$$;

create or replace function public.bebrave_append_chunk(
  p_session uuid,p_visitor_hash text,p_stroke_id uuid,p_stroke_order integer,p_chunk_index integer,p_points jsonb
) returns text language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v uuid; item jsonb; x numeric; y numeric; n integer;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found or s.status<>'drawing' then raise exception 'session not drawing'; end if;
  if clock_timestamp()>s.drawing_deadline then raise exception 'deadline passed'; end if;
  if p_stroke_order not between 0 and 1024 or p_chunk_index not between 0 and 2048 then raise exception 'invalid stroke'; end if;
  if exists(select 1 from public.bebrave_stroke_chunks where session_id=s.id and stroke_id=p_stroke_id and chunk_index=p_chunk_index) then return 'duplicate'; end if;
  if jsonb_typeof(p_points)<>'array' then raise exception 'invalid points'; end if;
  n := jsonb_array_length(p_points);
  if n not between 2 and 160 then raise exception 'invalid points'; end if;
  for item in select value from jsonb_array_elements(p_points) loop
    if jsonb_typeof(item)<>'array' or jsonb_array_length(item)<>2 or jsonb_typeof(item->0)<>'number' or jsonb_typeof(item->1)<>'number' then raise exception 'invalid point'; end if;
    x := (item->>0)::numeric; y := (item->>1)::numeric;
    if x<0 or x>720 or y<s.zone_top or y>s.zone_bottom then raise exception 'outside active zone'; end if;
  end loop;
  perform private.bebrave_take_limit('stroke:'||s.id::text,240,60);
  update public.bebrave_sessions set chunk_count=chunk_count+1,point_count=point_count+n,updated_at=now()
    where id=s.id and chunk_count<320 and point_count+n<=30000;
  if not found then raise exception 'drawing too large'; end if;
  insert into public.bebrave_stroke_chunks(session_id,stroke_id,stroke_order,chunk_index,points)
    values(s.id,p_stroke_id,p_stroke_order,p_chunk_index,p_points);
  return 'stored';
end;
$$;

create or replace function public.bebrave_finish_session(p_session uuid,p_visitor_hash text)
returns text language plpgsql security invoker set search_path='' as $$
declare v uuid; s public.bebrave_sessions;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found then raise exception 'session not owned'; end if;
  if s.status in ('completed','empty') then return s.status; end if;
  if s.status<>'drawing' or s.drawing_deadline is null then raise exception 'session not drawing'; end if;
  if clock_timestamp()<s.drawing_deadline then raise exception 'drawing still active'; end if;
  return private.bebrave_finalize_one(s.id);
end;
$$;

create or replace function public.bebrave_process_hourly_growth()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare t public.bebrave_tree_state; bucket timestamptz; grew boolean := false;
begin
  perform pg_advisory_xact_lock(731002);
  perform private.bebrave_finalize_overdue();
  bucket := date_trunc('hour',now());
  select * into t from public.bebrave_tree_state where id=true for update;
  if t.last_growth_interval>=bucket then
    return jsonb_build_object('grew',false,'already_processed',true,'height',t.height,'pending',t.pending_growth_carvings,'revision',t.revision);
  end if;
  if t.pending_growth_carvings>=2 then
    update public.bebrave_tree_state set
      height=height+288,
      active_top=active_top+288,
      active_bottom=active_bottom+288,
      pending_growth_carvings=pending_growth_carvings-2,
      revision=revision+1,
      last_growth_interval=bucket,
      updated_at=now()
      where id=true returning * into t;
    grew := true;
  else
    update public.bebrave_tree_state set last_growth_interval=bucket,updated_at=now() where id=true returning * into t;
  end if;
  return jsonb_build_object('grew',grew,'already_processed',false,'height',t.height,'pending',t.pending_growth_carvings,'revision',t.revision);
end;
$$;

-- Default EXECUTE privileges on public functions must not become a browser API.
do $$ declare fn record; begin
  for fn in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'bebrave_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated',fn.signature);
    execute format('grant execute on function %s to service_role',fn.signature);
  end loop;
end $$;

-- The hourly growth check runs inside Postgres, so retries are protected by the
-- state-row lock and last_growth_interval. Extra completed drawings stay banked.
create extension if not exists pg_cron with schema extensions;
do $$ declare j record; begin
  for j in select jobid from cron.job where jobname='bebrave-hourly-growth' loop
    perform cron.unschedule(j.jobid);
  end loop;
  perform cron.schedule('bebrave-hourly-growth','5 * * * *','select public.bebrave_process_hourly_growth();');
end $$;
