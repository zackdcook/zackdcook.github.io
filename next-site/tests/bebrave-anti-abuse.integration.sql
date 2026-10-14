-- TEST PROJECT qkkgcoejkqvthbjcldcw ONLY. Everything below rolls back.
-- Do not run this suite on production, even with ROLLBACK.
begin;
set local role service_role;
do $$
declare
  network text:=encode(extensions.gen_random_bytes(32),'hex');
  network2 text:=encode(extensions.gen_random_bytes(32),'hex');
  daily_network text:=encode(extensions.gen_random_bytes(32),'hex');
  actor text:=encode(extensions.gen_random_bytes(32),'hex');
  token text:=encode(extensions.gen_random_bytes(32),'hex');
  other text; prepared jsonb; start1 jsonb; start2 jsonb;
  session1 uuid; retry uuid; ready uuid; root uuid; visitor uuid; code uuid;
  before_empty jsonb; saved_rolls jsonb; chunks bigint; height_before bigint; h bigint; i integer; result text;
  household text[]:='{}';
begin
  assert not has_table_privilege('anon','private.bebrave_participation_events','select'),'public participation read';
  assert not has_table_privilege('authenticated','private.bebrave_challenge_claims','insert'),'public challenge write';
  assert not has_function_privilege('anon','public.bebrave_prepare_session(text,text,text,integer,integer,integer)','execute'),'public prepare RPC';
  assert not has_function_privilege('authenticated','public.bebrave_begin_drawing(uuid,text,text)','execute'),'public start RPC';
  assert public.bebrave_claim_challenge(token),'first challenge rejected';
  assert not public.bebrave_claim_challenge(token),'challenge replay accepted';
  assert not public.bebrave_claim_challenge(null),'null challenge accepted';

  prepared:=public.bebrave_prepare_session(actor,network,actor,900,5000,9800);
  session1:=(prepared->>'session_id')::uuid;
  assert session1 is not null,'session preparation failed';
  prepared:=public.bebrave_prepare_session(actor,network,actor,9999,9999,9999);
  assert (prepared->>'session_id')::uuid=session1,'refresh rerolled session';
  assert (select roll_arrowhead=900 and roll_nail=5000 and roll_key=9800 from public.bebrave_sessions where id=session1),'refresh changed rolls';
  perform public.bebrave_choose_tool(session1,actor,'nail','#FF2BD6',42);
  start1:=public.bebrave_begin_drawing(session1,actor,network);
  start2:=public.bebrave_begin_drawing(session1,actor,network);
  assert start1=start2,'restart extended deadline';
  assert (start1->>'deadline')::timestamptz-(start1->>'started_at')::timestamptz=interval '60 seconds','incorrect timer';
  assert (select count(*)=1 from private.bebrave_participation_events where session_id=session1 and kind='start'),'restart spent another allowance';
  assert public.bebrave_finish_session(session1,actor)='empty','blank finish failed';
  select to_jsonb(s) into before_empty from public.bebrave_sessions s where id=session1;
  select height into height_before from public.bebrave_tree_state where id=true;
  -- Simulate later growth inside TEST rollback only. No production query does this.
  update public.bebrave_tree_state set height=height+1440,active_top=active_top+1440,active_bottom=active_bottom+1440 where id=true;
  prepared:=public.bebrave_prepare_session(actor,network,actor,9999,0,0);
  retry:=(prepared->>'session_id')::uuid;
  assert retry<>session1,'original empty attempt was rewritten';
  assert (select retry_of=session1 and attempt_root_id=session1 and chosen_tool='nail' and chosen_rarity='uncommon'
    and chosen_color='#FF2BD6' and effect_seed=42 and roll_arrowhead=900 and roll_nail=5000 and roll_key=9800
    and drawing_deadline is null and status='ready' from public.bebrave_sessions where id=retry),'empty retry lost locked tool/effect/rolls';
  assert (select to_jsonb(s)=before_empty from public.bebrave_sessions s where id=session1),'original empty row changed';
  begin
    perform public.bebrave_choose_tool(retry,actor,'key','#00F5FF',99);
    raise exception 'TEST: different tool unexpectedly allowed';
  exception when others then
    assert sqlerrm='tool already chosen','different tool accepted or unexpected error';
  end;
  start1:=public.bebrave_begin_drawing(retry,actor,network);
  assert not (start1 ? 'error'),'same-tool blank retry blocked';
  perform public.bebrave_append_chunk(retry,actor,extensions.gen_random_uuid(),0,0,
    jsonb_build_array(jsonb_build_array(10,(start1->>'zone_top')::bigint+10),jsonb_build_array(20,(start1->>'zone_top')::bigint+20)));
  assert public.bebrave_finish_session(retry,actor)='completed','valid retry did not publish';
  assert (select height=height_before+1728 from public.bebrave_tree_state where id=true),'blank attempt incorrectly grew tree';
  prepared:=public.bebrave_prepare_session(actor,network,actor,9999,0,0);
  assert prepared->>'error'='growth','completed carving bypassed five-foot gate';

  -- Household allowance: four distinct owners, never one silently merged owner.
  select height into h from public.bebrave_tree_state where id=true;
  for i in 1..4 loop
    other:=encode(extensions.gen_random_bytes(32),'hex');
    household:=array_append(household,other);
    prepared:=public.bebrave_prepare_session(other,network2,other,0,0,0);
    ready:=(prepared->>'session_id')::uuid;
    assert ready is not null,'household identity denied';
    perform public.bebrave_choose_tool(ready,other,'arrowhead','#40271C',i);
    assert not (public.bebrave_begin_drawing(ready,other,network2) ? 'error'),'household drawing denied';
    perform public.bebrave_append_chunk(ready,other,extensions.gen_random_uuid(),0,0,
      jsonb_build_array(jsonb_build_array(10,h-1440+10),jsonb_build_array(20,h-1440+20)));
    assert public.bebrave_finish_session(ready,other)='completed','household publication failed';
    select height into h from public.bebrave_tree_state where id=true;
  end loop;
  -- Age only our new-identity fixtures out of the SHORT window. The growth gate
  -- must still stop a fifth player, despite four accepted one-foot publications.
  update private.bebrave_participation_events set created_at=clock_timestamp()-interval '11 minutes'
    where network_hash=network2 and kind='identity';
  other:=encode(extensions.gen_random_bytes(32),'hex');
  prepared:=public.bebrave_prepare_session(other,network2,other,0,0,0);
  assert prepared->>'error'='network_growth','network grew and refilled its own allowance';
  assert not exists(select 1 from public.bebrave_visitors where visitor_hash=other),'denied fresh identity inserted';
  assert (prepared->>'growth_feet_remaining')::integer=1,'wrong household wait';
  -- One unrelated contribution opens the next fixed cycle. Four of our own
  -- contributions must not release individual slots and open a fifth again.
  update public.bebrave_tree_state set height=height+288,active_top=active_top+288,active_bottom=active_bottom+288 where id=true;
  update private.bebrave_participation_events set created_at=clock_timestamp()-interval '16 minutes'
    where network_hash=network2 and kind='start';
  for i in 1..4 loop
    other:=household[i];
    prepared:=public.bebrave_prepare_session(other,network2,other,0,0,0);
    ready:=(prepared->>'session_id')::uuid;
    assert ready is not null,'returning household identity denied';
    perform public.bebrave_choose_tool(ready,other,'arrowhead','#40271C',i);
    start1:=public.bebrave_begin_drawing(ready,other,network2);
    assert not (start1 ? 'error'),'returning household drawing denied';
    perform public.bebrave_append_chunk(ready,other,extensions.gen_random_uuid(),0,0,
      jsonb_build_array(jsonb_build_array(10,(start1->>'zone_top')::bigint+10),jsonb_build_array(20,(start1->>'zone_top')::bigint+20)));
    assert public.bebrave_finish_session(ready,other)='completed','returning household publication failed';
  end loop;
  select height into h from public.bebrave_tree_state where id=true;
  assert private.bebrave_participation_gate(network2,'identity',h)->>'error'='network_growth','sliding slots let network self-refill';

  -- Long rolling window survives expiry of the short window.
  for i in 1..6 loop
    insert into private.bebrave_participation_events(network_hash,kind,issued_height,created_at)
      values(daily_network,'identity',h,clock_timestamp()-interval '11 minutes');
  end loop;
  prepared:=public.bebrave_prepare_session(encode(extensions.gen_random_bytes(32),'hex'),daily_network,actor,0,0,0);
  assert prepared->>'error'='participation_limit','24-hour identity allowance bypassed';
  for i in 1..12 loop
    insert into private.bebrave_participation_events(network_hash,kind,issued_height,session_id,attempt_root_id,created_at)
      values(daily_network,'start',h,retry,session1,clock_timestamp()-interval '16 minutes');
  end loop;
  assert private.bebrave_participation_gate(daily_network,'start',h,session1)->>'error'='participation_limit','24-hour start allowance bypassed';

  -- Claimed tokens stay claimed across cookies; expired private records purge.
  update private.bebrave_challenge_claims set expires_at=clock_timestamp()-interval '1 second' where token_hash=token;
  perform private.bebrave_prune_security_records();
  assert not exists(select 1 from private.bebrave_challenge_claims where token_hash=token),'expired challenge retained';
  actor:=encode(extensions.gen_random_bytes(32),'hex');network:=encode(extensions.gen_random_bytes(32),'hex');
  prepared:=public.bebrave_prepare_session(actor,network,actor,0,0,0);session1:=(prepared->>'session_id')::uuid;
  perform public.bebrave_choose_tool(session1,actor,'key','#40271C',7);
  start1:=public.bebrave_begin_drawing(session1,actor,network);
  update public.bebrave_sessions set drawing_deadline=clock_timestamp()-interval '1 second' where id=session1;
  begin
    perform public.bebrave_append_chunk(session1,actor,extensions.gen_random_uuid(),0,0,
      jsonb_build_array(jsonb_build_array(10,(start1->>'zone_top')::bigint+10),jsonb_build_array(20,(start1->>'zone_top')::bigint+20)));
    raise exception 'TEST: late stroke accepted';
  exception when others then assert sqlerrm='deadline passed','late stroke not rejected correctly'; end;
  assert public.bebrave_begin_drawing(session1,actor,network)->>'error'='finished','expired timer restarted';
  assert (select status='empty' and drawing_deadline<clock_timestamp() from public.bebrave_sessions where id=session1),'expired session got more time';

  -- Legendary empty retries retain the EXACT aura/infusion and reward ownership.
  actor:=encode(extensions.gen_random_bytes(32),'hex');network:=encode(extensions.gen_random_bytes(32),'hex');
  prepared:=public.bebrave_prepare_session(actor,network,actor,1,2,3);session1:=(prepared->>'session_id')::uuid;
  insert into private.bebrave_legendary_codes(code_digest,campaign) values(encode(extensions.gen_random_bytes(32),'hex'),'anti-abuse-test-rollback') returning id into code;
  assert public.bebrave_redeem_legendary(session1,actor,network,(select code_digest from private.bebrave_legendary_codes where id=code),4242),'legendary fixture rejected';
  perform public.bebrave_choose_enchantment(session1,actor,'#FF2BD6',9760);
  perform public.bebrave_begin_drawing(session1,actor,network);
  assert public.bebrave_finish_session(session1,actor)='empty','legendary blank failed';
  prepared:=public.bebrave_prepare_session(actor,network,actor,9999,9999,9999);retry:=(prepared->>'session_id')::uuid;
  assert public.bebrave_apply_legendary_unlock(retry,actor),'legendary reward missing';
  assert (select chosen_tool='cache' and chosen_rarity='legendary' and chosen_color='#FF2BD6' and chosen_symbol=9760 and effect_seed=4242
    and legendary_code_id=code and roll_arrowhead=1 and roll_nail=2 and roll_key=3 from public.bebrave_sessions where id=retry),'legendary empty retry changed enchantment';
  start1:=public.bebrave_begin_drawing(retry,actor,network);
  perform public.bebrave_append_chunk(retry,actor,extensions.gen_random_uuid(),0,0,
    jsonb_build_array(jsonb_build_array(10,(start1->>'zone_top')::bigint+10),jsonb_build_array(20,(start1->>'zone_top')::bigint+20)));
  assert public.bebrave_finish_session(retry,actor)='completed','legendary retry did not publish';
  assert (select consumed_session_id=retry and consumed_at is not null from private.bebrave_legendary_unlocks where code_id=code),'legendary reward consumed incorrectly';
end;
$$;
rollback;
