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
