-- Release verification only. Every temporary code, session and reward rolls back.
begin;
set local role service_role;
do $$
declare
 h1 text:=encode(extensions.gen_random_bytes(32),'hex');
 h2 text:=encode(extensions.gen_random_bytes(32),'hex');
 network text:=encode(extensions.gen_random_bytes(32),'hex');
 d1 text:=encode(extensions.gen_random_bytes(32),'hex');
 d2 text:=encode(extensions.gen_random_bytes(32),'hex');
 v1 uuid;v2 uuid;s1 uuid;s2 uuid;s3 uuid;s4 uuid;c1 uuid;c2 uuid;started jsonb;
begin
 assert to_regprocedure('public.bebrave_test_reset_limit(text)') is null,'production reset RPC present';
 assert not has_table_privilege('anon','private.bebrave_legendary_codes','select'),'public verifier access';
 assert not has_function_privilege('anon','public.bebrave_choose_enchantment(uuid,text,text,integer)','execute'),'public enchantment write';
 insert into public.bebrave_visitors(visitor_hash) values(h1) returning id into v1;
 insert into public.bebrave_visitors(visitor_hash) values(h2) returning id into v2;
 insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v1,0,0,0) returning id into s1;
 insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v2,0,0,0) returning id into s2;
 insert into private.bebrave_legendary_codes(code_digest,campaign) values(d1,'rollback-live-verification') returning id into c1;
 insert into private.bebrave_legendary_codes(code_digest,campaign,effect_id,reusable) values(d2,'rollback-live-verification','blood-v1',true) returning id into c2;
 assert not public.bebrave_redeem_legendary(s1,h2,network,d1,42),'foreign session accepted';
 assert public.bebrave_redeem_legendary(s1,h1,network,d1,42),'ordinary redemption failed';
 assert not public.bebrave_redeem_legendary(s2,h2,network,d1,43),'single-use replay accepted';
 perform public.bebrave_choose_enchantment(s1,h1,'#FF2BD6',9760);
 assert (select chosen_color='#FF2BD6' and chosen_symbol=9760 and status='ready' from public.bebrave_sessions where id=s1),'enchantment not saved';
 started:=public.bebrave_start_drawing(s1,h1);
 assert (started->>'deadline')::timestamptz-(started->>'started_at')::timestamptz=interval '60 seconds','timer changed';
 assert public.bebrave_finish_session(s1,h1)='empty','empty session failed';
 s3:=public.bebrave_create_or_resume_session(h1,network,h1,0,0,0);
 assert public.bebrave_apply_legendary_unlock(s3,h1),'empty-session reward lost';
 assert public.bebrave_redeem_legendary(s2,h2,network,d2,44),'personal redemption failed';
 perform public.bebrave_choose_enchantment(s2,h2,'#C51D36',128481);
 insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v1,0,0,0) returning id into s4;
 assert public.bebrave_redeem_legendary(s4,h1,network,d2,45),'personal reusable policy lost';
 assert (select count(*)=2 from private.bebrave_legendary_unlocks where code_id=c2),'personal rewards not independent';
end;
$$;
rollback;
