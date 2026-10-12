begin;
-- Reviewed production release. All privileged operations remain server-only.
-- No test-reset RPC is installed; the legacy production eligibility gates stay.
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

revoke all on function private.bebrave_legendary_limit(text,integer,integer),private.bebrave_consume_legendary(),public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text) from public,anon,authenticated;
grant execute on function private.bebrave_legendary_limit(text,integer,integer),private.bebrave_consume_legendary(),public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text) to service_role;


alter table public.bebrave_visitors add constraint bebrave_production_reset_disabled check (test_reset_sequence=0);
-- Range indexing makes historical viewport lookup independent of total tree height.
-- Filename reconciled to the isolated test database's applied migration ledger.
-- Raw chunks remain the canonical, backward-compatible source at this milestone.
create index bebrave_completed_zone_gist_idx on public.bebrave_sessions
using gist (int8range(zone_top,zone_bottom,'[)'))
where status='completed' and public_sequence is not null;

create function public.bebrave_completed_in_section(p_section integer,p_before bigint default null,p_cutoff bigint default null)
returns table(id uuid,public_sequence bigint,chosen_rarity text,chosen_color text,effect_seed integer,chosen_effect text,zone_top bigint,zone_bottom bigint)
language sql stable security invoker set search_path='' as $$
 select s.id,s.public_sequence,s.chosen_rarity,s.chosen_color,s.effect_seed,s.chosen_effect,s.zone_top,s.zone_bottom
 from public.bebrave_sessions s
 where p_section between 0 and 1000000
   and s.status='completed' and s.public_sequence is not null
   and int8range(s.zone_top,s.zone_bottom,'[)') && int8range(p_section::bigint*864,(p_section::bigint+1)*864,'[)')
   and (p_before is null or s.public_sequence<p_before)
   and (p_cutoff is null or s.public_sequence<=p_cutoff)
 order by s.public_sequence desc limit 12;
$$;
revoke all on function public.bebrave_completed_in_section(integer,bigint,bigint) from public,anon,authenticated;
grant execute on function public.bebrave_completed_in_section(integer,bigint,bigint) to service_role;
-- Original chunk rows are replaced only by a lossless, checksummed archive,
-- after server-side round-trip verification.
-- Session/visitor/eligibility/reward records and all publication metadata stay.
create table public.bebrave_completed_archives (
  session_id uuid primary key references public.bebrave_sessions(id) on delete cascade,
  version smallint not null default 1 check (version=1),
  geometry_gzip bytea not null check (octet_length(geometry_gzip) between 20 and 4194304),
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  source_bytes integer not null check (source_bytes between 1 and 8388608),
  chunk_count integer not null check (chunk_count between 1 and 320),
  point_count integer not null check (point_count between 2 and 30000),
  render_version smallint not null default 1 check (render_version=1),
  render_strokes jsonb not null check (jsonb_typeof(render_strokes)='array'),
  archived_at timestamptz not null default now()
);
alter table public.bebrave_completed_archives enable row level security;
revoke all on public.bebrave_completed_archives from public,anon,authenticated;
grant select,insert,update,delete on public.bebrave_completed_archives to service_role;

create function private.bebrave_archive_document(p_session uuid) returns text
language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('version',1,'sessionId',p_session,'chunks',jsonb_agg(to_jsonb(c) order by c.id))::text
  from public.bebrave_stroke_chunks c where c.session_id=p_session
  having count(*)>0;
$$;

create function public.bebrave_archive_source(p_session uuid)
returns table(document text,source_sha256 text)
language sql stable security invoker set search_path='' as $$
  select d.document,encode(extensions.digest(convert_to(d.document,'UTF8'),'sha256'),'hex')
  from public.bebrave_sessions s
  cross join lateral (select private.bebrave_archive_document(s.id) document) d
  where s.id=p_session and s.status='completed' and s.public_sequence is not null
    and d.document is not null
    and not exists(select 1 from public.bebrave_completed_archives a where a.session_id=s.id);
$$;

create function public.bebrave_store_archive(
  p_session uuid,p_source_sha256 text,p_gzip_base64 text,p_payload_sha256 text,p_render_strokes jsonb
) returns boolean language plpgsql security invoker set search_path='' as $$
declare
  s public.bebrave_sessions;
  existing_hash text;
  source text;
  source_json jsonb;
  payload bytea;
  chunks integer;
  points integer;
  strokes integer;
begin
  select * into s from public.bebrave_sessions where id=p_session for update;
  if not found or s.status<>'completed' or s.public_sequence is null then raise exception 'archive requires completed carving'; end if;
  select source_sha256 into existing_hash from public.bebrave_completed_archives where session_id=p_session;
  if found then
    if existing_hash<>p_source_sha256 then raise exception 'archive checksum conflict'; end if;
    return true;
  end if;
  source:=private.bebrave_archive_document(p_session);
  if source is null or octet_length(source)>8388608 or p_source_sha256 is null or
     encode(extensions.digest(convert_to(source,'UTF8'),'sha256'),'hex')<>p_source_sha256 then
    raise exception 'archive source changed';
  end if;
  source_json:=source::jsonb;
  chunks:=jsonb_array_length(source_json->'chunks');
  select sum(jsonb_array_length(c->'points')),count(distinct c->>'stroke_id') into points,strokes
  from jsonb_array_elements(source_json->'chunks') c;
  if chunks<>s.chunk_count or points<>s.point_count then raise exception 'archive chunk ledger mismatch'; end if;
  if p_render_strokes is null or jsonb_typeof(p_render_strokes)<>'array' or
     jsonb_array_length(p_render_strokes)<>strokes or octet_length(p_render_strokes::text)>4194304 then
    raise exception 'invalid archive projection';
  end if;
  if (select count(distinct e->>'strokeId') from jsonb_array_elements(p_render_strokes) e)<>strokes or exists(
    select 1 from jsonb_array_elements(p_render_strokes) e
    where coalesce(jsonb_typeof(e),'')<>'object' or coalesce(jsonb_typeof(e->'geometry'),'')<>'object' or not exists(
      select 1 from public.bebrave_stroke_chunks c where c.session_id=p_session and c.stroke_id::text=e->>'strokeId' and c.stroke_order=(e->>'strokeOrder')::integer
    )
  ) then raise exception 'archive projection changed stroke identity or order'; end if;
  if p_gzip_base64 is null or length(p_gzip_base64)>5592408 then raise exception 'invalid archive payload'; end if;
  payload:=decode(p_gzip_base64,'base64');
  if substring(payload from 1 for 3)<>decode('1f8b08','hex') or p_payload_sha256 is null or
     encode(extensions.digest(payload,'sha256'),'hex')<>p_payload_sha256 then raise exception 'archive payload changed'; end if;
  insert into public.bebrave_completed_archives(session_id,geometry_gzip,source_sha256,payload_sha256,source_bytes,chunk_count,point_count,render_strokes)
  values(p_session,payload,p_source_sha256,p_payload_sha256,octet_length(source),chunks,points,p_render_strokes);
  -- Same transaction: any insert/validation/delete failure rolls back together.
  -- Original rows are recoverable byte-for-byte from the canonical container.
  delete from public.bebrave_stroke_chunks where session_id=p_session;
  return true;
end;
$$;

revoke all on function private.bebrave_archive_document(uuid),public.bebrave_archive_source(uuid),public.bebrave_store_archive(uuid,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function private.bebrave_archive_document(uuid),public.bebrave_archive_source(uuid),public.bebrave_store_archive(uuid,text,text,text,jsonb) to service_role;

commit;
