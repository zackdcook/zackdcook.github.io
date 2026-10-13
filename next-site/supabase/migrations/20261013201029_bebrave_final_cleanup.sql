-- TEST first. Only new enchantment choices change; stored drawings/codes remain intact.
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
