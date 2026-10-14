-- Isolated test project only. This fixture and every redemption roll back.
begin;
set local role service_role;
do $$
declare
  h1 text:=encode(extensions.gen_random_bytes(32),'hex');
  h2 text:=encode(extensions.gen_random_bytes(32),'hex');
  h3 text:=encode(extensions.gen_random_bytes(32),'hex');
  network text:=encode(extensions.gen_random_bytes(32),'hex');
  code_verifier text:=encode(extensions.gen_random_bytes(32),'hex');
  v1 uuid;v2 uuid;v3 uuid;s1 uuid;s2 uuid;s3 uuid;c uuid;
  prior_reward jsonb;
begin
  assert not has_table_privilege('anon','private.bebrave_legendary_codes','SELECT');
  assert not has_function_privilege('anon','public.bebrave_redeem_legendary(uuid,text,text,text,integer)','EXECUTE');
  insert into public.bebrave_visitors(visitor_hash) values(h1) returning id into v1;
  insert into public.bebrave_visitors(visitor_hash) values(h2) returning id into v2;
  insert into public.bebrave_visitors(visitor_hash) values(h3) returning id into v3;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v1,0,0,0) returning id into s1;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v2,0,0,0) returning id into s2;
  insert into public.bebrave_sessions(visitor_id,roll_arrowhead,roll_nail,roll_key) values(v3,0,0,0) returning id into s3;
  insert into private.bebrave_legendary_codes(code_digest,campaign) values(code_verifier,'rollback-reset-fixture') returning id into c;
  assert public.bebrave_redeem_legendary(s1,h1,network,code_verifier,42),'first use';
  select to_jsonb(u) into prior_reward from private.bebrave_legendary_unlocks u where u.code_id=c;
  assert not public.bebrave_redeem_legendary(s2,h2,network,code_verifier,43),'single-use before reset';
  update private.bebrave_legendary_codes set redeemed_at=null,redeemed_by=null where id=c;
  assert public.bebrave_redeem_legendary(s2,h2,network,code_verifier,43),'same code works after reset';
  assert exists(select 1 from private.bebrave_legendary_unlocks u where to_jsonb(u)=prior_reward),'old reward changed';
  assert (select count(*)=2 from private.bebrave_legendary_unlocks where code_id=c),'new reward is separate';
  assert not public.bebrave_redeem_legendary(s3,h3,network,code_verifier,44),'reset does not enable unlimited reuse';
  assert (select code_digest=code_verifier and not reusable from private.bebrave_legendary_codes where id=c),'code identity and policy';
end;
$$;
rollback;
