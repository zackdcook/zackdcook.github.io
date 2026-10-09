-- Isolated test database only. Up to 100,000 synthetic metadata rows; all roll back.
-- No user artwork, cooldown or tree state is changed. Tests lookup, not browser FPS.
begin;
set local statement_timeout='25s';
set local role service_role;
do $$
declare v uuid;population integer;previous integer:=0;i integer;section integer;started timestamptz;rows_loaded integer;results jsonb:='[]';plan jsonb;expected jsonb;actual jsonb;
begin
 insert into public.bebrave_visitors(visitor_hash) values(encode(extensions.gen_random_bytes(32),'hex')) returning id into v;
 foreach population in array array[100,1000,10000,100000] loop
  insert into public.bebrave_sessions(visitor_id,status,roll_arrowhead,roll_nail,roll_key,chosen_tool,chosen_rarity,chosen_color,effect_seed,zone_top,zone_bottom,public_sequence)
  select v,'completed',0,0,0,'key','common','#8A5A3A',42,8640+n::bigint*288,10080+n::bigint*288,100000000+n from generate_series(previous+1,population) n;
  section:=floor((8640+population*144)/864.0)::integer;
  select jsonb_agg(id order by public_sequence desc) into actual from public.bebrave_completed_in_section(section,null,null);
  select jsonb_agg(id order by public_sequence desc) into expected from(select id,public_sequence from public.bebrave_sessions where status='completed' and public_sequence is not null and zone_bottom>section::bigint*864 and zone_top<(section::bigint+1)*864 order by public_sequence desc limit 12) legacy;
  assert actual is not distinct from expected,'viewport differs from legacy geometry';
  started:=clock_timestamp();
  for i in 1..40 loop select count(*) into rows_loaded from public.bebrave_completed_in_section(section,null,null);end loop;
  assert rows_loaded between 1 and 12,'viewport exceeded budget';
  results:=results||jsonb_build_array(jsonb_build_object('population',population,'visible_sessions',rows_loaded,'mean_query_ms',round(extract(epoch from(clock_timestamp()-started))*1000/40,3)));
  previous:=population;
 end loop;
 execute format('explain (analyze,buffers,format json) select id,public_sequence from public.bebrave_sessions s where status=''completed'' and public_sequence is not null and int8range(zone_top,zone_bottom,''[)'') && int8range(%s,%s,''[)'') order by public_sequence desc limit 12',section::bigint*864,(section::bigint+1)*864) into plan;
 perform set_config('reimagining.scale_result',jsonb_build_object('measurements',results,'plan',plan)::text,true);
end $$;
select current_setting('reimagining.scale_result')::jsonb as scale_result;
rollback;
