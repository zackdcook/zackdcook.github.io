-- Additive, service-only API. No changes to existing journal/auth tables.
create schema if not exists private;
create table public.cypress_state (
  id boolean primary key default true check (id),
  approved_count bigint not null default 0 check (approved_count >= 0),
  version bigint not null default 1
);
insert into public.cypress_state default values;
create table public.guestbook_reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  state text not null check (state in ('held','pending','permanent','expired','released')),
  entry jsonb not null,
  x integer not null, y bigint not null,
  width integer not null default 216 check (width=216),
  height integer not null default 76 check (height=76),
  occupied_cells bigint[] not null check (cardinality(occupied_cells) between 1 and 1300),
  zone_top bigint not null, zone_bottom bigint not null,
  check (x>=0 and x+width<=720 and x%4=0 and y%4=0),
  check (y>=zone_top and y+height<=zone_bottom)
);
create index guest_reservation_cells on public.guestbook_reservations using gin(occupied_cells);
create index guest_reservation_expiry on public.guestbook_reservations(state,expires_at);
create table public.guestbook_entries (
  id uuid primary key references public.guestbook_reservations(id),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  public_sequence bigint unique,
  display_name text not null check (char_length(display_name) between 1 and 40),
  note text not null check (char_length(note)<=60),
  mode text not null check (mode in ('typed','drawn')),
  font text not null check (font in ('caveat','handlee','allura','kalam','patrickhand')),
  strokes jsonb,
  geometry jsonb not null,
  x integer not null, y bigint not null,
  width integer not null default 216, height integer not null default 76,
  section_id bigint generated always as (y/864) stored,
  occupied_cells bigint[] not null,
  notice_state text not null default 'waiting',
  check ((status='approved' and public_sequence is not null and approved_at is not null) or (status<>'approved' and public_sequence is null))
);
create index guest_entries_space on public.guestbook_entries(y) where status='approved';
create index guest_entries_name on public.guestbook_entries(lower(display_name)) where status='approved';
create index guest_entries_cells on public.guestbook_entries using gin(occupied_cells) where status='approved';
create table public.shoutout_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  name text not null check (char_length(name) between 1 and 80),
  summary text not null check (char_length(summary) between 1 and 240),
  url text not null check (char_length(url)<=2048 and url like 'https://%'),
  notice_state text not null default 'waiting'
);
create table private.submission_identity (
  kind text not null check (kind in ('guestbook','shoutout')),
  entry_id uuid not null,
  visitor_hash text not null,
  network_hash text not null,
  fingerprint text not null,
  created_at timestamptz not null default now(),
  primary key(kind,entry_id)
);
create index identity_visitor on private.submission_identity(kind,visitor_hash);
create index identity_fingerprint on private.submission_identity(kind,fingerprint);
create table private.submission_limits (
  key text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);
create table private.notification_limits (
  day date primary key,
  count integer not null default 0
);
alter table public.cypress_state enable row level security;
alter table public.guestbook_reservations enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.shoutout_suggestions enable row level security;
alter table private.submission_identity enable row level security;
alter table private.submission_limits enable row level security;
alter table private.notification_limits enable row level security;
revoke all on public.cypress_state, public.guestbook_reservations, public.guestbook_entries, public.shoutout_suggestions from public, anon, authenticated;
revoke all on private.submission_identity, private.submission_limits, private.notification_limits from public, anon, authenticated;
grant usage on schema private to service_role;
grant all on public.cypress_state, public.guestbook_reservations, public.guestbook_entries, public.shoutout_suggestions to service_role;
grant all on private.submission_identity, private.submission_limits, private.notification_limits to service_role;

create function public.cypress_rate_limit(p_kind text,p_network text,p_visitor text)
returns void language plpgsql security invoker set search_path='' as $$
declare n integer; k text;
begin
  if length(p_network)<>64 or length(p_visitor)<>64 then raise exception 'invalid identity'; end if;
  delete from private.submission_limits where expires_at<now();
  foreach k in array array[p_kind||':network:'||p_network,p_kind||':visitor:'||p_visitor||':'||current_date::text] loop
    insert into private.submission_limits(key,count,expires_at) values(k,1,now()+interval '25 hours')
    on conflict(key) do update set count=private.submission_limits.count+1 returning count into n;
    if (k like '%:network:%' and n>12) or (k like '%:visitor:%' and n>4) then raise exception 'signing limit'; end if;
  end loop;
end; $$;

create function public.cypress_expire_reservations()
returns void language plpgsql security invoker set search_path='' as $$
begin
  update public.guestbook_reservations set state='expired' where state in ('held','pending') and expires_at<=now();
  update public.guestbook_entries e set status='expired' from public.guestbook_reservations r where e.id=r.id and r.state='expired' and e.status='pending';
end; $$;

create function public.cypress_reserve(
 p_entry jsonb,p_x integer,p_y bigint,p_cells bigint[],p_network_hash text,p_visitor_hash text,p_fingerprint text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare h bigint; top_y bigint; r uuid; edge integer;
begin
  perform pg_advisory_xact_lock(724031);
  perform public.cypress_expire_reservations();
  perform public.cypress_rate_limit('guestbook',p_network_hash,p_visitor_hash);
  if length(p_fingerprint)<>64 or octet_length(p_entry::text)>250000 or jsonb_typeof(p_entry->'geometry')<>'object' then raise exception 'invalid entry'; end if;
  if exists(select 1 from private.submission_identity i join public.guestbook_reservations a on a.id=i.entry_id
    where i.kind='guestbook' and (i.visitor_hash=p_visitor_hash or i.fingerprint=p_fingerprint)
    and a.state in ('pending','permanent')) then raise exception 'already signed'; end if;
  select 1440+(approved_count/2)*288 into h from public.cypress_state where id;
  top_y=h-1440;
  -- Same frozen section-width formula as tree-space.ts, both ends checked.
  edge=(720-least(670,570+((p_y/864)/8)*12))/2+12;
  if p_x<edge or p_x+216>720-edge or p_y<top_y or p_y+76>h or p_x%4<>0 or p_y%4<>0 then raise exception 'outside active bark'; end if;
  edge=(720-least(670,570+(((p_y+76)/864)/8)*12))/2+12;
  if p_x<edge or p_x+216>720-edge then raise exception 'outside bark'; end if;
  if cardinality(p_cells) not between 1 and 1300 or exists(select 1 from unnest(p_cells) c where c<0 or c/180<p_y/4 or c/180>(p_y+76)/4 or c%180<p_x/4 or c%180>=(p_x+216)/4) then raise exception 'invalid footprint'; end if;
  -- A browser may replace its own unsubmitted hold; never another person's.
  update public.guestbook_reservations a set state='released' from private.submission_identity i
    where i.entry_id=a.id and i.kind='guestbook' and i.visitor_hash=p_visitor_hash and a.state='held';
  if exists(select 1 from public.guestbook_reservations where state in ('held','pending','permanent') and occupied_cells && p_cells) then raise exception 'bark occupied'; end if;
  insert into public.guestbook_reservations(state,expires_at,entry,x,y,occupied_cells,zone_top,zone_bottom)
    values('held',now()+interval '20 minutes',p_entry,p_x,p_y,p_cells,top_y,h) returning id into r;
  insert into private.submission_identity(kind,entry_id,visitor_hash,network_hash,fingerprint)
    values('guestbook',r,p_visitor_hash,p_network_hash,p_fingerprint);
  return jsonb_build_object('id',r,'expires_at',now()+interval '20 minutes');
end; $$;

create function public.cypress_submit(p_id uuid,p_visitor_hash text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare r public.guestbook_reservations; e jsonb;
begin
  perform pg_advisory_xact_lock(724031);
  perform public.cypress_expire_reservations();
  select a.* into r from public.guestbook_reservations a join private.submission_identity i on i.entry_id=a.id
    where a.id=p_id and i.kind='guestbook' and i.visitor_hash=p_visitor_hash for update of a;
  if not found then raise exception 'reservation not owned'; end if;
  if r.state='pending' then return r.id; end if;
  if r.state<>'held' then raise exception 'reservation expired'; end if;
  e=r.entry;
  insert into public.guestbook_entries(id,display_name,note,mode,font,strokes,geometry,x,y,occupied_cells)
    values(r.id,e->>'display_name',e->>'note',e->>'mode',e->>'font',e->'strokes',e->'geometry',r.x,r.y,r.occupied_cells);
  update public.guestbook_reservations set state='pending',expires_at=now()+interval '7 days' where id=r.id;
  return r.id;
end; $$;

create function public.cypress_moderate(p_id uuid,p_approve boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.guestbook_reservations; e public.guestbook_entries; n bigint;
begin
  perform pg_advisory_xact_lock(724031);
  perform public.cypress_expire_reservations();
  select * into e from public.guestbook_entries where id=p_id for update;
  if not found then raise exception 'entry missing'; end if;
  if e.status<>'pending' then return jsonb_build_object('status',e.status,'sequence',e.public_sequence); end if;
  select * into r from public.guestbook_reservations where id=e.id for update;
  if not p_approve then
    update public.guestbook_entries set status='rejected' where id=e.id;
    update public.guestbook_reservations set state='released' where id=e.id;
    return jsonb_build_object('status','rejected');
  end if;
  -- Original frontier remains valid while the reserved spot waits for review.
  if r.state<>'pending' or r.expires_at<=now() or e.x<>r.x or e.y<>r.y or e.y<r.zone_top or e.y+76>r.zone_bottom then raise exception 'reservation invalid'; end if;
  if exists(select 1 from public.guestbook_reservations where id<>r.id and state in ('held','pending','permanent') and occupied_cells && r.occupied_cells) then raise exception 'bark occupied'; end if;
  update public.cypress_state set approved_count=approved_count+1,version=version+1 where id returning approved_count into n;
  update public.guestbook_entries set status='approved',approved_at=now(),public_sequence=n where id=e.id;
  update public.guestbook_reservations set state='permanent',expires_at='infinity' where id=e.id;
  return jsonb_build_object('status','approved','sequence',n);
end; $$;

create function public.cypress_release_hold(p_id uuid,p_visitor_hash text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  perform pg_advisory_xact_lock(724031);
  update public.guestbook_reservations r set state='released' from private.submission_identity i
   where i.kind='guestbook' and i.entry_id=r.id and i.visitor_hash=p_visitor_hash and r.id=p_id and r.state='held';
end; $$;
create function public.cypress_my_carving(p_visitor_hash text)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('id',e.id,'status',case when e.status='pending' and r.expires_at<=now() then 'expired' else e.status end,'y',e.y,'expires_at',r.expires_at)
 from public.guestbook_entries e join public.guestbook_reservations r on r.id=e.id join private.submission_identity i on i.entry_id=e.id
 where i.kind='guestbook' and i.visitor_hash=p_visitor_hash order by e.created_at desc limit 1;
$$;
create function public.cypress_moderation_context(p_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('network_hint',left(network_hash,8),'browser_hint',left(visitor_hash,8),'same_network_submissions',
 (select count(*) from private.submission_identity x where x.network_hash=i.network_hash))
 from private.submission_identity i where i.entry_id=p_id limit 1;
$$;
create function public.submit_shoutout_suggestion(p_entry jsonb,p_network_hash text,p_visitor_hash text,p_fingerprint text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare r uuid;
begin
  perform pg_advisory_xact_lock(724032);
  perform public.cypress_rate_limit('shoutout',p_network_hash,p_visitor_hash);
  if exists(select 1 from private.submission_identity where kind='shoutout' and fingerprint=p_fingerprint) then raise exception 'duplicate recommendation'; end if;
  insert into public.shoutout_suggestions(name,summary,url) values(p_entry->>'name',p_entry->>'summary',p_entry->>'url') returning id into r;
  insert into private.submission_identity(kind,entry_id,visitor_hash,network_hash,fingerprint) values('shoutout',r,p_visitor_hash,p_network_hash,p_fingerprint);
  return r;
end; $$;
create function public.reserve_submission_notice(p_id uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  perform pg_advisory_xact_lock(724033);
  if not exists(select 1 from public.guestbook_entries where id=p_id and notice_state='waiting')
    and not exists(select 1 from public.shoutout_suggestions where id=p_id and notice_state='waiting') then return false; end if;
  insert into private.notification_limits(day,count) values(current_date,1)
    on conflict(day) do update set count=private.notification_limits.count+1 where private.notification_limits.count<20 returning count into n;
  if n is null then return false; end if;
  update public.guestbook_entries set notice_state='sending' where id=p_id and notice_state='waiting';
  update public.shoutout_suggestions set notice_state='sending' where id=p_id and notice_state='waiting';
  return true;
end; $$;
create function public.mark_submission_notice(p_id uuid,p_state text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_state not in ('sent','failed') then raise exception 'invalid notice'; end if;
  update public.guestbook_entries set notice_state=p_state where id=p_id;
  update public.shoutout_suggestions set notice_state=p_state where id=p_id;
end; $$;

-- Default EXECUTE grants must be removed only for these new functions.
do $$ declare fn record; begin
 for fn in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and (p.proname like 'cypress_%' or p.proname in ('submit_shoutout_suggestion','reserve_submission_notice','mark_submission_notice'))
 loop
  execute format('revoke all on function %s from public, anon, authenticated',fn.signature);
  execute format('grant execute on function %s to service_role',fn.signature);
 end loop;
end; $$;
