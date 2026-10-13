-- Additive, TEST first. Old archives and existing color-only clients are retained.
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
