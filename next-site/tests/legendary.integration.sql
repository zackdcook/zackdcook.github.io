-- Run only against the isolated test database. Every fixture and tree change rolls back.
begin;
set local role service_role;
do $$
declare
  h1 text:=encode(extensions.gen_random_bytes(32),'hex');
  h2 text:=encode(extensions.gen_random_bytes(32),'hex');
  h3 text:=encode(extensions.gen_random_bytes(32),'hex');
  network text:=encode(extensions.gen_random_bytes(32),'hex');
  network3 text:=encode(extensions.gen_random_bytes(32),'hex');
  digest1 text:=encode(extensions.gen_random_bytes(32),'hex');
  digest2 text:=encode(extensions.gen_random_bytes(32),'hex');
  v1 uuid;v2 uuid;v3 uuid;s1 uuid;s2 uuid;s3 uuid;s4 uuid;c1 uuid;c2 uuid;
  start_state jsonb;t public.bebrave_tree_state;before_count bigint;before_height bigint;result text;blocked boolean:=false;i integer;
begin
  assert not has_table_privilege('anon','private.bebrave_legendary_codes','SELECT'),'anon verifier access';
  assert not has_table_privilege('authenticated','private.bebrave_legendary_unlocks','SELECT'),'authenticated entitlement access';
  assert not has_function_privilege('anon','public.bebrave_redeem_legendary(uuid,text,text,text,integer)','EXECUTE'),'anon redemption access';
  assert not has_function_privilege('authenticated','public.bebrave_test_reset_limit(text)','EXECUTE'),'browser reset access';
  assert private.bebrave_roll_tier(4199)='common' and private.bebrave_roll_tier(4200)='uncommon' and private.bebrave_roll_tier(7700)='superior' and private.bebrave_roll_tier(9500)='epic','rarity thresholds';
  insert into public.bebrave_visitors(visitor_hash) values(h1) returning id into v1;
  insert into public.bebrave_visitors(visitor_hash) values(h2) returning id into v2;
  insert into public.bebrave_visitors(visitor_hash) values(h3) returning id into v3;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v1,0,4200,9500) returning id into s1;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v2,0,0,0) returning id into s2;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v3,0,0,0) returning id into s3;
  insert into private.bebrave_legendary_codes(code_digest,campaign) values(digest1,'rollback-integration-fixture') returning id into c1;
  insert into private.bebrave_legendary_codes(code_digest,campaign,effect_id) values(digest2,'rollback-integration-fixture','will-o-wisp-v1') returning id into c2;

  assert not public.bebrave_redeem_legendary(s1,h2,network,digest1,42),'foreign session accepted';
  assert not public.bebrave_redeem_legendary(s1,h1,network,repeat('0',64),42),'invalid verifier accepted';
  assert (select redeemed_at is null from private.bebrave_legendary_codes where id=c1),'failure consumed code';
  assert public.bebrave_redeem_legendary(s1,h1,network,digest1,42),'valid redemption rejected';
  assert not public.bebrave_redeem_legendary(s1,h1,network,digest1,42),'same-visitor replay accepted';
  assert not public.bebrave_redeem_legendary(s2,h2,network,digest1,42),'cross-visitor replay accepted';
  assert (select chosen_rarity='legendary' and chosen_effect='will-o-wisp-v1' and effect_seed=42 and status='epic_color' from public.bebrave_sessions where id=s1),'reward not persisted';
  assert (select count(*)=1 from private.bebrave_legendary_unlocks where code_id=c1),'duplicate reward';

  perform public.bebrave_choose_epic_color(s1,h1,'#00A9C7');
  start_state:=public.bebrave_start_drawing(s1,h1);
  assert (start_state->>'deadline')::timestamptz-(start_state->>'started_at')::timestamptz=interval '60 seconds','timer changed';
  assert public.bebrave_finish_session(s1,h1)='empty','empty session not finished';
  assert (select consumed_at is null from private.bebrave_legendary_unlocks where code_id=c1),'empty attempt spent reward';
  s4:=public.bebrave_create_or_resume_session(h1,network,h1,0,0,0);
  assert s4<>s1 and public.bebrave_apply_legendary_unlock(s4,h1),'saved reward not restored';
  assert (select effect_seed=42 and legendary_code_id=c1 from public.bebrave_sessions where id=s4),'reward seed changed';
  perform public.bebrave_choose_epic_color(s4,h1,'#00A9C7');
  start_state:=public.bebrave_start_drawing(s4,h1);
  select * into t from public.bebrave_tree_state where id=true;
  before_count:=t.completed_count;before_height:=t.height;
  result:=public.bebrave_append_chunk(s4,h1,extensions.gen_random_uuid(),0,0,jsonb_build_array(jsonb_build_array(40,t.active_top+40),jsonb_build_array(80,t.active_top+80)));
  assert result='stored','stroke not stored';
  assert public.bebrave_finish_session(s4,h1)='completed','carving not published';
  assert (select height=before_height+288 and completed_count=before_count+1 from public.bebrave_tree_state where id=true),'growth changed';
  assert (select consumed_at is not null and consumed_session_id=s4 from private.bebrave_legendary_unlocks where code_id=c1),'published reward not spent';
  assert public.bebrave_finish_session(s4,h1)='completed','finish retry not idempotent';
  begin
    perform public.bebrave_create_or_resume_session(h1,network,h1,0,0,0);
  exception when others then
    if sqlerrm like 'growth:%' then blocked:=true;else raise;end if;
  end;
  assert blocked,'Legendary bypassed five-foot cooldown';
  perform public.bebrave_test_reset_limit(h1);
  assert (select id=v1 from public.bebrave_visitors where visitor_hash=h1),'reset changed identity';
  assert (select status='completed' from public.bebrave_sessions where id=s4),'reset deleted carving';
  s4:=public.bebrave_create_or_resume_session(h1,network,h1,0,0,0);
  assert not public.bebrave_apply_legendary_unlock(s4,h1),'spent reward restored';
  assert not public.bebrave_redeem_legendary(s4,h1,network,digest1,42),'reset made code reusable';

  for i in 1..10 loop
    assert not public.bebrave_redeem_legendary(s3,h3,network3,repeat('0',64),1),'invalid guess accepted';
  end loop;
  assert not public.bebrave_redeem_legendary(s3,h3,network3,digest2,1),'visitor brute-force limit failed';
  assert (select count=11 from private.bebrave_rate_limits where key='legendary:visitor:'||h3),'failed guesses not retained';
  assert (select redeemed_at is null from private.bebrave_legendary_codes where id=c2),'throttled attempt consumed code';
end;
$$;
rollback;
