-- Experimental test database only. All privileged operations remain server-only.
-- Codes are high-entropy, domain-separated SHA-256 verifiers, never plaintext.
create table private.bebrave_legendary_effects (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  created_at timestamptz not null default now()
);
insert into private.bebrave_legendary_effects(id) values ('will-o-wisp-v1');

create table private.bebrave_legendary_codes (
  id uuid primary key default extensions.gen_random_uuid(),
  code_digest text not null unique check (code_digest ~ '^[0-9a-f]{64}$'),
  effect_id text references private.bebrave_legendary_effects(id),
  campaign text not null check (char_length(campaign) between 1 and 120),
  created_at timestamptz not null default now(),
  disabled_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid references public.bebrave_visitors(id) on delete restrict,
  check ((redeemed_at is null) = (redeemed_by is null))
);
create index bebrave_legendary_codes_visitor_idx on private.bebrave_legendary_codes(redeemed_by);
create index bebrave_legendary_codes_effect_idx on private.bebrave_legendary_codes(effect_id);

create table private.bebrave_legendary_unlocks (
  code_id uuid primary key references private.bebrave_legendary_codes(id) on delete restrict,
  visitor_id uuid not null references public.bebrave_visitors(id) on delete restrict,
  effect_id text not null references private.bebrave_legendary_effects(id),
  effect_seed integer not null check (effect_seed between 0 and 2147483646),
  assigned_session_id uuid references public.bebrave_sessions(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_session_id uuid references public.bebrave_sessions(id) on delete set null
);
create index bebrave_legendary_unlocks_pending_idx on private.bebrave_legendary_unlocks(visitor_id,redeemed_at) where consumed_at is null;
create index bebrave_legendary_unlocks_assigned_idx on private.bebrave_legendary_unlocks(assigned_session_id);
create index bebrave_legendary_unlocks_consumed_idx on private.bebrave_legendary_unlocks(consumed_session_id);
create index bebrave_legendary_unlocks_effect_idx on private.bebrave_legendary_unlocks(effect_id);
create index if not exists bebrave_rate_limits_expiry_idx on private.bebrave_rate_limits(window_ends);

alter table private.bebrave_legendary_codes enable row level security;
alter table private.bebrave_legendary_effects enable row level security;
alter table private.bebrave_legendary_unlocks enable row level security;
revoke all on private.bebrave_legendary_codes,private.bebrave_legendary_effects,private.bebrave_legendary_unlocks from public,anon,authenticated;
grant all on private.bebrave_legendary_codes,private.bebrave_legendary_effects,private.bebrave_legendary_unlocks to service_role;

alter table public.bebrave_sessions drop constraint bebrave_sessions_chosen_rarity_check;
alter table public.bebrave_sessions add constraint bebrave_sessions_chosen_rarity_check check (chosen_rarity is null or chosen_rarity in ('common','uncommon','superior','epic','legendary'));
alter table public.bebrave_sessions add column chosen_effect text;
alter table public.bebrave_sessions add column legendary_code_id uuid references private.bebrave_legendary_codes(id) on delete restrict;
create index bebrave_sessions_legendary_code_idx on public.bebrave_sessions(legendary_code_id);
alter table public.bebrave_visitors add column test_reset_sequence bigint not null default 0 check (test_reset_sequence>=0);

-- Return false, rather than raising, so failed guesses commit their attempt count.
create function private.bebrave_legendary_limit(p_key text,p_limit integer,p_window integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  delete from private.bebrave_rate_limits where window_ends < now()-interval '1 day';
  insert into private.bebrave_rate_limits(key,count,window_ends) values(p_key,1,now()+make_interval(secs=>p_window))
  on conflict(key) do update set
    count=case when private.bebrave_rate_limits.window_ends<=now() then 1 else least(private.bebrave_rate_limits.count+1,p_limit+1) end,
    window_ends=case when private.bebrave_rate_limits.window_ends<=now() then now()+make_interval(secs=>p_window) else private.bebrave_rate_limits.window_ends end
  returning count into n;
  return n<=p_limit;
end;
$$;

create function public.bebrave_redeem_legendary(p_session uuid,p_visitor_hash text,p_network_hash text,p_code_digest text,p_seed integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v public.bebrave_visitors; c private.bebrave_legendary_codes; visitor_allowed boolean; network_allowed boolean; effect text; h bigint; previous_height bigint;
begin
  if p_visitor_hash is null or p_network_hash is null or p_code_digest is null
     or p_visitor_hash !~ '^[0-9a-f]{64}$' or p_network_hash !~ '^[0-9a-f]{64}$'
     or p_code_digest !~ '^[0-9a-f]{64}$' or p_seed is null or p_seed not between 0 and 2147483646 then return false; end if;
  visitor_allowed:=private.bebrave_legendary_limit('legendary:visitor:'||p_visitor_hash,10,900);
  network_allowed:=private.bebrave_legendary_limit('legendary:network:'||p_network_hash,30,900);
  if not visitor_allowed or not network_allowed then return false; end if;
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  if not found then return false; end if;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v.id for update;
  if not found or s.status<>'tool_select' or s.chosen_tool is not null then return false; end if;
  select height into h from public.bebrave_tree_state where id=true;
  select zone_bottom into previous_height from public.bebrave_sessions where visitor_id=v.id and status='completed' and public_sequence>v.test_reset_sequence order by public_sequence desc limit 1;
  if previous_height is not null and h<previous_height+1440 then return false; end if;
  -- The row lock serializes every claimant. The permanent code state is separate
  -- from sessions; deleting or resetting a session can never make a code reusable.
  select * into c from private.bebrave_legendary_codes where code_digest=p_code_digest for update;
  if not found or c.disabled_at is not null or c.redeemed_at is not null then return false; end if;
  effect:=coalesce(c.effect_id,'will-o-wisp-v1');
  update private.bebrave_legendary_codes set redeemed_at=now(),redeemed_by=v.id where id=c.id;
  insert into private.bebrave_legendary_unlocks(code_id,visitor_id,effect_id,effect_seed,assigned_session_id) values(c.id,v.id,effect,p_seed,s.id);
  update public.bebrave_sessions set chosen_tool='cache',chosen_rarity='legendary',chosen_effect=effect,chosen_color=null,effect_seed=p_seed,legendary_code_id=c.id,status='epic_color',updated_at=now() where id=s.id;
  return true;
end;
$$;

-- Reattach a saved reward only after the normal create/resume eligibility gate.
create function public.bebrave_apply_legendary_unlock(p_session uuid,p_visitor_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v uuid; u private.bebrave_legendary_unlocks;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found then return false; end if;
  if s.legendary_code_id is not null then return true; end if;
  if s.status<>'tool_select' or s.chosen_tool is not null then return false; end if;
  select * into u from private.bebrave_legendary_unlocks pending
    where pending.visitor_id=v and pending.consumed_at is null and
      (pending.assigned_session_id is null or exists(select 1 from public.bebrave_sessions prior where prior.id=pending.assigned_session_id and prior.status in ('empty','cancelled')))
    order by pending.redeemed_at,pending.code_id limit 1 for update skip locked;
  if not found then return false; end if;
  update private.bebrave_legendary_unlocks set assigned_session_id=s.id where code_id=u.code_id;
  update public.bebrave_sessions set chosen_tool='cache',chosen_rarity='legendary',chosen_effect=u.effect_id,chosen_color=null,effect_seed=u.effect_seed,legendary_code_id=u.code_id,status='epic_color',updated_at=now() where id=s.id;
  return true;
end;
$$;

create or replace function public.bebrave_choose_epic_color(p_session uuid,p_visitor_hash text,p_color text)
returns void language plpgsql security invoker set search_path='' as $$
declare v uuid;
begin
  if p_color is null or p_color !~ '^#[0-9A-Fa-f]{6}$' then raise exception 'invalid color'; end if;
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  update public.bebrave_sessions set chosen_color=p_color,status='ready',updated_at=now()
    where id=p_session and visitor_id=v and chosen_tool='cache' and chosen_rarity in ('epic','legendary') and status='epic_color';
  if not found then raise exception 'session not choosing color'; end if;
end;
$$;

create function private.bebrave_consume_legendary()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.status='completed' and old.status<>'completed' and new.legendary_code_id is not null then
    update private.bebrave_legendary_unlocks set consumed_at=coalesce(new.drawing_finished_at,now()),consumed_session_id=new.id
      where code_id=new.legendary_code_id and visitor_id=new.visitor_id and assigned_session_id=new.id and consumed_at is null;
    if not found then raise exception 'legendary reward unavailable'; end if;
  end if;
  return new;
end;
$$;
create trigger bebrave_consume_legendary after update of status on public.bebrave_sessions for each row execute function private.bebrave_consume_legendary();

-- Ordinary tools can never roll Legendary. Align the database with the intended
-- 42/35/18/5 TypeScript distribution (the baseline SQL used outdated thresholds).
create or replace function private.bebrave_roll_tier(p_roll integer)
returns text language sql immutable security invoker set search_path='' as $$
  select case when p_roll<4200 then 'common' when p_roll<7700 then 'uncommon' when p_roll<9500 then 'superior' else 'epic' end;
$$;

-- The Next.js route checks the isolated test project and environment before this
-- service-only RPC. Preserve identity, historical carvings and unspent rewards.
create function public.bebrave_test_reset_limit(p_visitor_hash text)
returns void language plpgsql security invoker set search_path='' as $$
declare v uuid; sequence bigint;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  if not found then return; end if;
  update public.bebrave_sessions set status='cancelled',updated_at=now() where visitor_id=v and status in ('tool_select','epic_color','ready','drawing');
  select completed_count into sequence from public.bebrave_tree_state where id=true;
  update public.bebrave_visitors set test_reset_sequence=sequence where id=v;
end;
$$;

revoke all on function private.bebrave_legendary_limit(text,integer,integer),private.bebrave_consume_legendary(),public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text),public.bebrave_test_reset_limit(text) from public,anon,authenticated;
grant execute on function private.bebrave_legendary_limit(text,integer,integer),private.bebrave_consume_legendary(),public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text),public.bebrave_test_reset_limit(text) to service_role;

-- Existing eligibility functions, with an explicit test reset watermark.
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
    and public_sequence>v.test_reset_sequence
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
    and public_sequence>v.test_reset_sequence
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

