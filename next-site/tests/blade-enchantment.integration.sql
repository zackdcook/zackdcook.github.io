-- Isolated TEST database only. Every visitor, session and selection rolls back.
begin;
set local role service_role;
do $$
declare
  h text:=encode(extensions.gen_random_bytes(32),'hex');
  other text:=encode(extensions.gen_random_bytes(32),'hex');
  v uuid; s uuid; personal uuid; ordinary uuid; blocked boolean;
begin
  insert into public.bebrave_visitors(visitor_hash) values(h) returning id into v;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key,chosen_tool,chosen_rarity,chosen_effect,status)
    values(v,0,0,0,'cache','legendary','will-o-wisp-v1','epic_color') returning id into s;
  perform public.bebrave_choose_enchantment(s,h,'#6AEDD0',9760);
  assert (select chosen_color='#6AEDD0' and chosen_symbol=9760 and status='ready' from public.bebrave_sessions where id=s),'selection not saved';
  perform public.bebrave_choose_enchantment(s,h,'#FFB5D0',9829);
  assert (select chosen_color='#FFB5D0' and chosen_symbol=9829 from public.bebrave_sessions where id=s),'ready selection not editable';
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(s,other,'#41DCE8',9733); exception when others then blocked:=true; end;
  assert blocked,'foreign visitor accepted';
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(s,h,'#B026FF',9733); exception when others then blocked:=true; end;
  assert blocked,'purple accepted';
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(s,h,'#41DCE8',128512); exception when others then blocked:=true; end;
  assert blocked,'unavailable symbol accepted';
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key,chosen_tool,chosen_rarity,chosen_effect,status)
    values(v,0,0,0,'cache','legendary','blood-v1','epic_color') returning id into personal;
  perform public.bebrave_choose_enchantment(personal,h,'#C51D36',128481);
  assert (select chosen_symbol=128481 and chosen_color='#C51D36' from public.bebrave_sessions where id=personal),'personal dagger not saved';
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(personal,h,'#41DCE8',128481); exception when others then blocked:=true; end;
  assert blocked,'personal color changed';
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(personal,h,'#C51D36',10046); exception when others then blocked:=true; end;
  assert blocked,'personal symbol changed';
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key,chosen_tool,chosen_rarity,status)
    values(v,0,0,0,'nail','epic','ready') returning id into ordinary;
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(ordinary,h,'#41DCE8',9733); exception when others then blocked:=true; end;
  assert blocked,'ordinary tool changed';
  update public.bebrave_sessions set status='drawing' where id=s;
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(s,h,'#41DCE8',9733); exception when others then blocked:=true; end;
  assert blocked,'drawing selection changed';
  update public.bebrave_sessions set status='completed' where id=s;
  blocked:=false;
  begin perform public.bebrave_choose_enchantment(s,h,'#41DCE8',9733); exception when others then blocked:=true; end;
  assert blocked,'completed selection changed';
  assert not has_function_privilege('anon','public.bebrave_choose_enchantment(uuid,text,text,integer)','EXECUTE'),'anonymous write access';
  assert not has_function_privilege('authenticated','public.bebrave_choose_enchantment(uuid,text,text,integer)','EXECUTE'),'authenticated write access';
end;
$$;
rollback;
