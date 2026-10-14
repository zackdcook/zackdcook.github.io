-- Production release of the independently tested, additive enchantment changes.
-- No test-reset RPC, fixture code, draft drawing or test archive is installed.
-- Existing sessions, archives, codes, rewards, eligibility and grants are retained.
begin;
do $$
begin
  assert to_regprocedure('public.bebrave_test_reset_limit(text)') is null, 'Production must have no test-reset RPC';
end;
$$;
-- Additive effect metadata. Code verifiers and redemption history are untouched.
alter table private.bebrave_legendary_effects add column if not exists description text;
update private.bebrave_legendary_effects
set description='Luminous carving with orbiting will-o-wisp lights and faceted glints.'
where id='will-o-wisp-v1' and description is null;
insert into private.bebrave_legendary_effects(id,description) values
  ('hearts-v1','Enchanted aura with glowing heart particles that lift, flutter, and softly fade.'),
  ('rainbow-v1','A flowing rainbow carving and aura with prismatic motes and sparkling energy trails.'),
  ('blood-v1','Crimson red strokes with a pulsing black aura and falling dark red blood droplets.')
on conflict(id) do update set description=excluded.description;
alter table private.bebrave_legendary_effects alter column description set not null;
comment on column private.bebrave_legendary_effects.description is
  'Human-readable appearance of the versioned effect assigned to each private Legendary code.';


-- Private opt-in only; preserve prior rewards and original code verifiers.
alter table private.bebrave_legendary_codes add column reusable boolean not null default false;
alter table private.bebrave_legendary_unlocks add column id uuid not null default extensions.gen_random_uuid();
alter table private.bebrave_legendary_unlocks drop constraint bebrave_legendary_unlocks_pkey;
alter table private.bebrave_legendary_unlocks add primary key(id);
create index bebrave_legendary_unlocks_code_idx on private.bebrave_legendary_unlocks(code_id);
create unique index bebrave_legendary_unlocks_session_idx on private.bebrave_legendary_unlocks(assigned_session_id) where assigned_session_id is not null;
comment on column private.bebrave_legendary_codes.reusable is 'Private personal code opt-in: its existing high-entropy code permits repeated redemption by its holder. Ordinary codes remain single-use. Owned-session checks, growth eligibility and abuse limits still apply.';
create or replace function public.bebrave_redeem_legendary(p_session uuid,p_visitor_hash text,p_network_hash text,p_code_digest text,p_seed integer)
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
  -- Only an explicitly reusable private code can be used again.
  -- Every redemption retains a separate reward row and owned session.
  select * into c from private.bebrave_legendary_codes where code_digest=p_code_digest for update;
  if not found or c.disabled_at is not null or (c.redeemed_at is not null and not c.reusable) then return false; end if;
  effect:=coalesce(c.effect_id,'will-o-wisp-v1');
  update private.bebrave_legendary_codes set redeemed_at=coalesce(redeemed_at,now()),redeemed_by=coalesce(redeemed_by,v.id) where id=c.id;
  insert into private.bebrave_legendary_unlocks(code_id,visitor_id,effect_id,effect_seed,assigned_session_id) values(c.id,v.id,effect,p_seed,s.id);
  update public.bebrave_sessions set chosen_tool='cache',chosen_rarity='legendary',chosen_effect=effect,chosen_color=null,effect_seed=p_seed,legendary_code_id=c.id,status='epic_color',updated_at=now() where id=s.id;
  return true;
end;
$$;

create or replace function public.bebrave_apply_legendary_unlock(p_session uuid,p_visitor_hash text)
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
  update private.bebrave_legendary_unlocks set assigned_session_id=s.id where id=u.id;
  update public.bebrave_sessions set chosen_tool='cache',chosen_rarity='legendary',chosen_effect=u.effect_id,chosen_color=null,effect_seed=u.effect_seed,legendary_code_id=u.code_id,status='epic_color',updated_at=now() where id=s.id;
  return true;
end;
$$;
revoke all on function public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text) from public,anon,authenticated;
grant execute on function public.bebrave_redeem_legendary(uuid,text,text,text,integer),public.bebrave_apply_legendary_unlock(uuid,text) to service_role;


-- Additive. Old archives and existing color-only clients are retained.
alter table public.bebrave_sessions add column chosen_symbol integer;
alter table public.bebrave_sessions add constraint bebrave_symbol_choice_check check (
  chosen_symbol is null or chosen_symbol in (9733,9824,9827,9829,9830,9728,9760,9834,9880,9883,10022,10087,9752,9753,9835,9889,10024,10048,128481)
);

create function public.bebrave_choose_enchantment(p_session uuid,p_visitor_hash text,p_color text,p_symbol integer)
returns void language plpgsql security invoker set search_path='' as $$
declare v uuid; s public.bebrave_sessions;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found or s.chosen_tool is distinct from 'cache' or coalesce(s.chosen_rarity,'') not in ('epic','legendary') or coalesce(s.status,'') not in ('epic_color','ready') then
    raise exception 'session not enchanting';
  end if;
  if s.chosen_effect='blood-v1' then
    if p_color is distinct from '#C51D36' or p_symbol is distinct from 128481 then raise exception 'invalid personal enchantment'; end if;
  else
    if p_color is null or p_color not in ('#F3E7CB','#41DCE8','#FFB5D0','#FFE46B','#B3EE86','#6AEDD0','#FFC09D','#00F5FF','#FF2BD6','#FFF44F','#39FF14','#FF7A00','#3D7BFF')
      or p_symbol is null or p_symbol not in (9733,9824,9827,9829,9830,9728,9760,9834,9880,9883,10022,10087,9752,9753,9835,9889,10024,10048) then
      raise exception 'invalid enchantment';
    end if;
  end if;
  update public.bebrave_sessions set chosen_color=p_color,chosen_symbol=p_symbol,status='ready',updated_at=now() where id=s.id;
end;
$$;
revoke all on function public.bebrave_choose_enchantment(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.bebrave_choose_enchantment(uuid,text,text,integer) to service_role;

create function public.bebrave_completed_in_section_v2(p_section integer,p_before bigint default null,p_cutoff bigint default null)
returns table(id uuid,public_sequence bigint,chosen_rarity text,chosen_color text,effect_seed integer,chosen_effect text,zone_top bigint,zone_bottom bigint,chosen_symbol integer)
language sql stable security invoker set search_path='' as $$
  select s.id,s.public_sequence,s.chosen_rarity,s.chosen_color,s.effect_seed,s.chosen_effect,s.zone_top,s.zone_bottom,s.chosen_symbol
  from public.bebrave_sessions s
  where p_section between 0 and 1000000 and s.status='completed' and s.public_sequence is not null
    and int8range(s.zone_top,s.zone_bottom,'[)') && int8range(p_section::bigint*864,(p_section::bigint+1)*864,'[)')
    and (p_before is null or s.public_sequence<p_before) and (p_cutoff is null or s.public_sequence<=p_cutoff)
  order by s.public_sequence desc limit 12;
$$;
revoke all on function public.bebrave_completed_in_section_v2(integer,bigint,bigint) from public,anon,authenticated;
grant execute on function public.bebrave_completed_in_section_v2(integer,bigint,bigint) to service_role;

update private.bebrave_legendary_effects set description='Crimson red strokes with a pulsing black aura, monochrome U+1F5E1 dagger particles, and curling dark-red blood-energy trails.' where id='blood-v1';
notify pgrst,'reload schema';


-- Only new enchantment choices change; stored drawings/codes remain intact.
create or replace function public.bebrave_choose_enchantment(p_session uuid,p_visitor_hash text,p_color text,p_symbol integer)
returns void language plpgsql security invoker set search_path='' as $$
declare v uuid; s public.bebrave_sessions;
begin
  select id into v from public.bebrave_visitors where visitor_hash=p_visitor_hash for update;
  select * into s from public.bebrave_sessions where id=p_session and visitor_id=v for update;
  if not found or s.chosen_tool is distinct from 'cache' or coalesce(s.chosen_rarity,'') not in ('epic','legendary') or coalesce(s.status,'') not in ('epic_color','ready') then
    raise exception 'session not enchanting';
  end if;
  if s.chosen_effect='blood-v1' then
    if p_color is distinct from '#C51D36' or p_symbol is distinct from 128481 then raise exception 'invalid personal enchantment'; end if;
  else
    if p_color is null or p_color not in ('#00F5FF','#FF2BD6','#FFF44F','#39FF14','#FF7A00','#3D7BFF')
      or p_symbol is null or p_symbol not in (9733,9824,9827,9829,9830,9728,9760,9834,9880,9883,10022,10087,9752,9753,9835,9889,10024,10048) then
      raise exception 'invalid enchantment';
    end if;
  end if;
  update public.bebrave_sessions set chosen_color=p_color,chosen_symbol=p_symbol,status='ready',updated_at=now() where id=s.id;
end;
$$;
revoke all on function public.bebrave_choose_enchantment(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.bebrave_choose_enchantment(uuid,text,text,integer) to service_role;

update private.bebrave_legendary_effects set description='Crimson red strokes with a pulsing black aura, monochrome U+1FAB6 feather and U+1F5E1 dagger particles, and curling dark-red energy trails.' where id='blood-v1';
notify pgrst,'reload schema';

update private.bebrave_legendary_effects set description='Crimson red strokes with a pulsing black aura, larger feather and dagger particles that emit in every direction, and curling dark-red energy trails.' where id='blood-v1';
notify pgrst,'reload schema';
commit;
