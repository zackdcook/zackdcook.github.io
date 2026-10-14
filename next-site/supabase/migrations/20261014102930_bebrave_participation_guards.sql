-- Additive, shared release migration. Apply to TEST first; never copy test data.
-- No existing session, drawing, archive, code, reward or tree row is rewritten.
alter table public.bebrave_sessions add column retry_of uuid references public.bebrave_sessions(id) on delete restrict;
alter table public.bebrave_sessions add column attempt_root_id uuid references public.bebrave_sessions(id) on delete restrict;
create index bebrave_sessions_retry_idx on public.bebrave_sessions(retry_of) where retry_of is not null;
create index bebrave_sessions_root_idx on public.bebrave_sessions(attempt_root_id) where attempt_root_id is not null;

create table private.bebrave_participation_events (
  id uuid primary key default extensions.gen_random_uuid(),
  network_hash text not null check (network_hash ~ '^[0-9a-f]{64}$'),
  kind text not null check (kind in ('identity','start')),
  session_id uuid references public.bebrave_sessions(id) on delete restrict,
  attempt_root_id uuid references public.bebrave_sessions(id) on delete restrict,
  issued_height bigint not null,
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default (clock_timestamp()+interval '7 days')
);
create index bebrave_participation_network_idx on private.bebrave_participation_events(network_hash,kind,created_at desc);
create index bebrave_participation_expiry_idx on private.bebrave_participation_events(expires_at);
create index bebrave_participation_session_idx on private.bebrave_participation_events(session_id);
create index bebrave_participation_root_idx on private.bebrave_participation_events(attempt_root_id);

create table private.bebrave_network_windows (
  network_hash text primary key check (network_hash ~ '^[0-9a-f]{64}$'),
  anchor_height bigint not null,
  attempt_roots uuid[] not null check (cardinality(attempt_roots) between 1 and 4),
  expires_at timestamptz not null default (clock_timestamp()+interval '7 days')
);
create index bebrave_windows_expiry_idx on private.bebrave_network_windows(expires_at);

create table private.bebrave_session_connections (
  session_id uuid primary key references public.bebrave_sessions(id) on delete restrict,
  network_hash text not null check (network_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null default (clock_timestamp()+interval '7 days')
);
create index bebrave_connections_expiry_idx on private.bebrave_session_connections(expires_at);

create table private.bebrave_challenge_claims (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null default (clock_timestamp()+interval '10 minutes')
);
create index bebrave_claims_expiry_idx on private.bebrave_challenge_claims(expires_at);

alter table private.bebrave_participation_events enable row level security;
alter table private.bebrave_network_windows enable row level security;
alter table private.bebrave_session_connections enable row level security;
alter table private.bebrave_challenge_claims enable row level security;
revoke all on private.bebrave_participation_events,private.bebrave_network_windows,private.bebrave_session_connections,private.bebrave_challenge_claims from public,anon,authenticated;
grant select,insert,update,delete on private.bebrave_participation_events,private.bebrave_network_windows,private.bebrave_session_connections,private.bebrave_challenge_claims to service_role;

create function private.bebrave_prune_security_records() returns void
language sql security invoker set search_path='' as $$
  delete from private.bebrave_participation_events where expires_at<=clock_timestamp();
  delete from private.bebrave_network_windows where expires_at<=clock_timestamp();
  delete from private.bebrave_session_connections where expires_at<=clock_timestamp();
  delete from private.bebrave_challenge_claims where expires_at<=clock_timestamp();
$$;

create function public.bebrave_claim_challenge(p_token_hash text) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then return false; end if;
  delete from private.bebrave_challenge_claims where expires_at<=clock_timestamp();
  insert into private.bebrave_challenge_claims(token_hash) values(p_token_hash) on conflict do nothing;
  return found;
end;
$$;

-- Caller holds the NETWORK advisory lock before both checking and inserting.
-- Rolling windows do not refill at a clock boundary or when cookies change.
create function private.bebrave_participation_gate(p_network text,p_kind text,p_height bigint,p_root uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare recent integer; daily integer; w private.bebrave_network_windows; next_time timestamptz; now_at timestamptz:=clock_timestamp();
begin
  if p_kind='identity' then
    select count(*) filter(where created_at>now_at-interval '10 minutes'),count(*)
      into recent,daily from private.bebrave_participation_events
      where network_hash=p_network and kind='identity' and created_at>now_at-interval '24 hours';
    if recent>=4 or daily>=6 then
      select min(created_at)+case when daily>=6 then interval '24 hours' else interval '10 minutes' end into next_time
        from private.bebrave_participation_events where network_hash=p_network and kind='identity'
        and created_at>now_at-case when daily>=6 then interval '24 hours' else interval '10 minutes' end;
      return jsonb_build_object('error','participation_limit','retry_seconds',ceil(extract(epoch from next_time-now_at)));
    end if;
  else
    select count(*) filter(where created_at>now_at-interval '15 minutes'),count(*)
      into recent,daily from private.bebrave_participation_events
      where network_hash=p_network and kind='start' and created_at>now_at-interval '24 hours';
    if recent>=6 or daily>=12 then
      select min(created_at)+case when daily>=12 then interval '24 hours' else interval '15 minutes' end into next_time
        from private.bebrave_participation_events where network_hash=p_network and kind='start'
        and created_at>now_at-case when daily>=12 then interval '24 hours' else interval '15 minutes' end;
      return jsonb_build_object('error','participation_limit','retry_seconds',ceil(extract(epoch from next_time-now_at)));
    end if;
  end if;
  -- Four independent attempts cannot alone grow the tree five feet and refill
  -- their own allowance. A retry of the SAME blank attempt uses the same root.
  select * into w from private.bebrave_network_windows where network_hash=p_network and expires_at>now_at;
  -- A fixed cycle anchor is essential: a sliding per-start height window could
  -- release one old slot after each new carving and let one network self-refill.
  if found and p_height<w.anchor_height+1440 and cardinality(w.attempt_roots)>=4
    and (p_root is null or not p_root=any(w.attempt_roots)) then
    return jsonb_build_object('error','network_growth','growth_feet_remaining',ceil((w.anchor_height+1440-p_height)/288.0),'retry_seconds',600);
  end if;
  return null;
end;
$$;

create function private.bebrave_personal_growth(p_visitor uuid,p_height bigint) returns integer
language sql security invoker set search_path='' as $$
  select coalesce((select greatest(0,ceil((s.zone_bottom+1440-p_height)/288.0)::integer)
    from public.bebrave_sessions s join public.bebrave_visitors v on v.id=s.visitor_id
    where s.visitor_id=p_visitor and s.status='completed' and s.public_sequence>v.test_reset_sequence and s.zone_bottom is not null
    order by s.public_sequence desc limit 1),0);
$$;

create function public.bebrave_prepare_session(
  p_visitor_hash text,p_network_hash text,p_browser_hint text,
  p_roll_arrowhead integer,p_roll_nail integer,p_roll_key integer
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v public.bebrave_visitors; s public.bebrave_sessions; prior public.bebrave_sessions;
  h bigint; remaining integer; blocked jsonb; fresh boolean; result_id uuid;
begin
  if p_visitor_hash is null or p_network_hash is null or p_browser_hint is null
    or p_visitor_hash !~ '^[0-9a-f]{64}$' or p_network_hash !~ '^[0-9a-f]{64}$' or p_browser_hint !~ '^[0-9a-f]{64}$' then raise exception 'invalid identity'; end if;
  if p_roll_arrowhead is null or p_roll_nail is null or p_roll_key is null
    or p_roll_arrowhead not between 0 and 9999 or p_roll_nail not between 0 and 9999 or p_roll_key not between 0 and 9999 then raise exception 'invalid rolls'; end if;
  perform pg_advisory_xact_lock(731040,hashtext(p_network_hash));
  perform pg_advisory_xact_lock(731041,hashtext(p_visitor_hash));
  perform private.bebrave_take_limit('session:visitor:'||p_visitor_hash,8,3600);
  perform private.bebrave_take_limit('session:network:'||p_network_hash,24,3600);
  perform private.bebrave_prune_security_records();
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  fresh:=not found;
  if not fresh then
    select * into s from public.bebrave_sessions where visitor_id=v.id
      and status in ('tool_select','epic_color','ready','drawing') order by created_at desc limit 1 for update;
    if found and s.status='drawing' and s.drawing_deadline<=clock_timestamp() then
      perform private.bebrave_finalize_one(s.id);
      select * into s from public.bebrave_sessions where id=s.id;
    end if;
    if s.id is not null and s.status in ('tool_select','epic_color','ready','drawing') then result_id:=s.id; end if;
  end if;
  if result_id is null then
    select height into h from public.bebrave_tree_state where id=true;
    remaining:=case when fresh then 0 else private.bebrave_personal_growth(v.id,h) end;
    if remaining>0 then return jsonb_build_object('error','growth','growth_feet_remaining',remaining); end if;
    if fresh then
      blocked:=private.bebrave_participation_gate(p_network_hash,'identity',h);
      if blocked is not null then return blocked; end if;
      insert into public.bebrave_visitors(visitor_hash,browser_hint) values(p_visitor_hash,p_browser_hint) returning * into v;
      insert into private.bebrave_participation_events(network_hash,kind,issued_height) values(p_network_hash,'identity',h);
    end if;
    select * into prior from public.bebrave_sessions where visitor_id=v.id and status in ('empty','completed')
      order by drawing_finished_at desc nulls last,created_at desc limit 1;
    if prior.status='empty' then
      -- Clone into a new timer session; retain the immutable original attempt.
      -- Tree growth never discards the chosen tool, rolls, pigment or infusion.
      insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key,
        chosen_tool,chosen_rarity,chosen_color,effect_seed,chosen_effect,chosen_symbol,cache_code_id,legendary_code_id,status,retry_of,attempt_root_id)
      values(v.id,prior.roll_arrowhead,prior.roll_nail,prior.roll_key,
        prior.chosen_tool,prior.chosen_rarity,prior.chosen_color,prior.effect_seed,prior.chosen_effect,prior.chosen_symbol,
        prior.cache_code_id,prior.legendary_code_id,case when prior.chosen_color is not null then 'ready' when prior.chosen_tool='cache' then 'epic_color' else 'tool_select' end,
        prior.id,coalesce(prior.attempt_root_id,prior.id)) returning id into result_id;
      if prior.legendary_code_id is not null then
        update private.bebrave_legendary_unlocks set assigned_session_id=result_id
          where visitor_id=v.id and assigned_session_id=prior.id and consumed_at is null;
        if not found then raise exception 'legendary reward unavailable'; end if;
      end if;
    else
      insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key)
        values(v.id,p_roll_arrowhead,p_roll_nail,p_roll_key) returning id into result_id;
    end if;
  end if;
  insert into private.bebrave_session_connections(session_id,network_hash) values(result_id,p_network_hash)
    on conflict(session_id) do update set network_hash=excluded.network_hash,expires_at=clock_timestamp()+interval '7 days';
  return jsonb_build_object('session_id',result_id);
end;
$$;

create function public.bebrave_begin_drawing(p_session uuid,p_visitor_hash text,p_network_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.bebrave_sessions; v public.bebrave_visitors; t public.bebrave_tree_state;
  started timestamptz; remaining integer; blocked jsonb; root uuid;
begin
  if p_visitor_hash is null or p_network_hash is null or p_visitor_hash !~ '^[0-9a-f]{64}$' or p_network_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid identity'; end if;
  perform pg_advisory_xact_lock(731040,hashtext(p_network_hash));
  perform pg_advisory_xact_lock(731041,hashtext(p_visitor_hash));
  select * into v from public.bebrave_visitors where visitor_hash=p_visitor_hash;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v.id for update;
  if not found then raise exception 'session not owned'; end if;
  if s.status='drawing' then
    if s.drawing_deadline<=clock_timestamp() then
      perform private.bebrave_finalize_one(s.id);
      return jsonb_build_object('error','finished');
    end if;
    return jsonb_build_object('started_at',s.drawing_started_at,'deadline',s.drawing_deadline,'zone_top',s.zone_top,'zone_bottom',s.zone_bottom,'tree_revision',s.tree_revision);
  end if;
  if s.status<>'ready' or s.chosen_color is null or s.chosen_rarity is null then raise exception 'session not ready'; end if;
  select * into t from public.bebrave_tree_state where id=true for share;
  remaining:=private.bebrave_personal_growth(v.id,t.height);
  if remaining>0 then return jsonb_build_object('error','growth','growth_feet_remaining',remaining); end if;
  root:=coalesce(s.attempt_root_id,s.id);
  blocked:=private.bebrave_participation_gate(p_network_hash,'start',t.height,root);
  if blocked is not null then return blocked; end if;
  started:=clock_timestamp();
  insert into private.bebrave_network_windows(network_hash,anchor_height,attempt_roots) values(p_network_hash,t.height,array[root])
    on conflict(network_hash) do update set
      anchor_height=case when private.bebrave_network_windows.expires_at<=started or t.height>=private.bebrave_network_windows.anchor_height+1440 then t.height else private.bebrave_network_windows.anchor_height end,
      attempt_roots=case when private.bebrave_network_windows.expires_at<=started or t.height>=private.bebrave_network_windows.anchor_height+1440 then array[root]
        when root=any(private.bebrave_network_windows.attempt_roots) then private.bebrave_network_windows.attempt_roots
        else array_append(private.bebrave_network_windows.attempt_roots,root) end,
      expires_at=started+interval '7 days';
  insert into private.bebrave_participation_events(network_hash,kind,session_id,attempt_root_id,issued_height)
    values(p_network_hash,'start',s.id,root,t.height);
  insert into private.bebrave_session_connections(session_id,network_hash) values(s.id,p_network_hash)
    on conflict(session_id) do update set network_hash=excluded.network_hash,expires_at=clock_timestamp()+interval '7 days';
  update public.bebrave_sessions set status='drawing',drawing_started_at=started,drawing_deadline=started+interval '60 seconds',
    zone_top=t.active_top,zone_bottom=t.active_bottom,tree_revision=t.revision,updated_at=now() where id=s.id;
  return jsonb_build_object('started_at',started,'deadline',started+interval '60 seconds','zone_top',t.active_top,'zone_bottom',t.active_bottom,'tree_revision',t.revision);
end;
$$;

-- Keep legacy signatures guarded; there is no unmetered alternate start RPC.
create or replace function public.bebrave_create_or_resume_session(
  p_visitor_hash text,p_network_hash text,p_browser_hint text,p_roll_arrowhead integer,p_roll_nail integer,p_roll_key integer
) returns uuid language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
  result:=public.bebrave_prepare_session(p_visitor_hash,p_network_hash,p_browser_hint,p_roll_arrowhead,p_roll_nail,p_roll_key);
  if result->>'error'='growth' then raise exception 'growth:%',result->>'growth_feet_remaining'; end if;
  if result ? 'error' then raise exception 'participation limit'; end if;
  return (result->>'session_id')::uuid;
end;
$$;

create or replace function public.bebrave_start_drawing(p_session uuid,p_visitor_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare network text; s public.bebrave_sessions; result jsonb;
begin
  select * into s from public.bebrave_sessions where id=p_session
    and visitor_id=(select id from public.bebrave_visitors where visitor_hash=p_visitor_hash);
  if not found then raise exception 'session not owned'; end if;
  -- Sessions already running before rollout retain their original deadline.
  if s.status='drawing' and s.drawing_deadline>clock_timestamp() then
    return jsonb_build_object('started_at',s.drawing_started_at,'deadline',s.drawing_deadline,'zone_top',s.zone_top,'zone_bottom',s.zone_bottom,'tree_revision',s.tree_revision);
  end if;
  select network_hash into network from private.bebrave_session_connections where session_id=p_session and expires_at>clock_timestamp();
  if network is null then raise exception 'reload session before starting'; end if;
  result:=public.bebrave_begin_drawing(p_session,p_visitor_hash,network);
  if result->>'error'='growth' then raise exception 'growth:%',result->>'growth_feet_remaining'; end if;
  if result ? 'error' then raise exception 'participation limit'; end if;
  return result;
end;
$$;

do $$ declare signature regprocedure; begin
  for signature in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (n.nspname='private' and p.proname in ('bebrave_prune_security_records','bebrave_participation_gate','bebrave_personal_growth'))
       or (n.nspname='public' and p.proname in ('bebrave_claim_challenge','bebrave_prepare_session','bebrave_begin_drawing','bebrave_create_or_resume_session','bebrave_start_drawing'))
  loop
    execute format('revoke all on function %s from public,anon,authenticated',signature);
    execute format('grant execute on function %s to service_role',signature);
  end loop;
end $$;
select cron.schedule('bebrave-security-record-cleanup','17 * * * *','select private.bebrave_prune_security_records();');
