import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PGlite} from "@electric-sql/pglite";
import {treeBounds,treeLandmark,validPlacement,typedGeometry,collisionMask,footprintAt,collides,type FontGeometry} from "../lib/tree-space";
import {validateGuestbook,validateStrokes} from "../lib/guestbook";

test("growth appends a foot every two approvals; historical landmarks never change",()=>{
 assert.deepEqual(treeBounds(0),{height:1440,active_top:0,active_bottom:1440});
 assert.equal(treeBounds(1).height,1440);assert.equal(treeBounds(2).height,1728);
 assert.equal(treeBounds(1000).height,145440);
 const landmark=treeLandmark(2);treeBounds(1000);assert.deepEqual(treeLandmark(2),landmark);
 assert.equal(validPlacement(160,0,treeBounds(2)),false);
 assert.equal(validPlacement(160,400,treeBounds(2)),true);
 assert.equal(validPlacement(0,400,treeBounds(2)),false);
});
test("numeric drawing validation rejects SVG, nonfinite coordinates, and oversized marks",()=>{
 assert.throws(()=>validateStrokes("<svg onload='alert(1)'/>"));
 assert.throws(()=>validateStrokes([[[0,0],[Infinity,2]]]));
 assert.throws(()=>validateStrokes([[[0,0],[601,2]]]));
 assert.throws(()=>validateStrokes([Array.from({length:1201},()=>[1,1])]));
 assert.equal(validateGuestbook({mode:"typed",display_name:"  Zack   Cook  ",note:"Hello",font:"kalam"}).display_name,"Zack Cook");
});
test("collision uses literal ink, including thin strokes; empty parts remain available",async()=>{
 const font=JSON.parse(await readFile("public/fonts/geometry/caveat.json","utf8")) as FontGeometry;
 const shape=typedGeometry("Jennifer","Glad I wandered in.",font),mask=collisionMask(shape);
 assert.ok(mask.length>10&&mask.length<1026,"ink should not consume its entire rectangle");
 const a=footprintAt(mask,160,320),b=footprintAt(mask,160,320);
 assert.equal(collides(b,new Set(a)),true);
 assert.equal(collides(footprintAt(mask,400,320),new Set(a)),false);
 assert.ok(collisionMask({contours:[],lines:[[[0,50],[599,50]]]}).length>80,"thin lines must never disappear");
 assert.ok(collisionMask({contours:[],lines:[[[10,10],[10,10]]]}).length>0,"a literal dot is a valid mark");
});

test("real Postgres: reservations, moderation, frontier movement, expiry and RLS",async t=>{
 const db=new PGlite();
 await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
 await db.exec(await readFile("supabase/migrations/20261002133511_living_cypress_guestbook.sql","utf8"));
 const network="n".repeat(64);
 const entry=(name:string)=>JSON.stringify({mode:"typed",display_name:name,note:"Hello",font:"caveat",strokes:null,geometry:{contours:[[[10,10],[20,10],[20,20]]],lines:[]}});
 let person=0;
 const reserve=async(x:number,y:number,name="Guest")=>{
   const visitor=(++person).toString(16).padStart(64,"0"),fingerprint=(person+900).toString(16).padStart(64,"0");
   const cells=[(y/4+3)*180+x/4+3];
   const rows=await db.query<{r:{id:string}}>("select public.cypress_reserve($1::jsonb,$2,$3,$4::bigint[],$5,$6,$7) r",[entry(name),x,y,cells,network,visitor,fingerprint]);
   return {id:rows.rows[0].r.id,visitor,cells};
 };
 const submit=(r:{id:string;visitor:string})=>db.query("select public.cypress_submit($1,$2)",[r.id,r.visitor]);
 const approve=(id:string)=>db.query<{r:{status:string;sequence:number}}>("select public.cypress_moderate($1,true) r",[id]);
 try{
  await t.test("simultaneous overlapping requests can secure only one footprint",async()=>{
   const attempts=await Promise.allSettled([reserve(160,100,"A"),reserve(160,100,"B")]);
   assert.equal(attempts.filter(result=>result.status==="fulfilled").length,1);
   assert.equal((await db.query<{n:number}>("select count(*)::int n from public.guestbook_reservations where state='held'")).rows[0].n,1);
  });
  await t.test("a pending location above the advancing frontier is preserved on approval",async()=>{
   const early=await reserve(360,120,"Early");await submit(early);
   for(const [x,y] of [[160,360],[360,360]]){
     const r=await reserve(x,y);await submit(r);await approve(r.id);
   }
   assert.equal((await db.query<{n:number}>("select approved_count::int n from public.cypress_state")).rows[0].n,2);
   assert.equal((await approve(early.id)).rows[0].r.status,"approved");
   const saved=(await db.query("select x,y::int y,public_sequence::int n from public.guestbook_entries where id=$1",[early.id])).rows[0];
   assert.deepEqual(saved,{x:360,y:120,n:3});
   await approve(early.id);
   assert.equal((await db.query<{n:number}>("select approved_count::int n from public.cypress_state")).rows[0].n,3,"repeat approval must not grow twice");
   await assert.rejects(reserve(440,120),/outside active bark/);
  });
  await t.test("another browser cannot finalize a reservation; rejection releases it",async()=>{
   const r=await reserve(160,700,"Rejected");
   await assert.rejects(db.query("select public.cypress_submit($1,$2)",[r.id,"x".repeat(64)]),/not owned/);
   await submit(r);await db.query("select public.cypress_moderate($1,false)",[r.id]);
   await reserve(160,700,"Replacement");
   assert.equal((await db.query<{status:string}>("select status from public.guestbook_entries where id=$1",[r.id])).rows[0].status,"rejected");
  });
  await t.test("expired pending holds release without publishing or consuming a guest number",async()=>{
   const r=await reserve(360,700,"Expired");await submit(r);
   await db.query("update public.guestbook_reservations set expires_at=now()-interval '1 second' where id=$1",[r.id]);
   assert.equal((await approve(r.id)).rows[0].r.status,"expired");
   await reserve(360,700,"Fresh spot");
   assert.equal((await db.query<{n:number}>("select approved_count::int n from public.cypress_state")).rows[0].n,3);
  });
  await t.test("anonymous and authenticated database roles cannot see queues or invoke placement",async()=>{
   for(const role of ["anon","authenticated"]){
     await db.exec("set role "+role);
     await assert.rejects(db.query("select * from public.guestbook_entries"),/permission denied/);
     await assert.rejects(db.query("select public.cypress_my_carving($1)",["x".repeat(64)]),/permission denied/);
     await assert.rejects(db.query("select * from private.submission_identity"),/permission denied/);
     await db.exec("reset role");
   }
   const tables=(await db.query<{rowsecurity:boolean}>("select rowsecurity from pg_tables where schemaname in ('public','private')")).rows;
   assert.ok(tables.every(row=>row.rowsecurity));
  });
  await t.test("notification volume is capped in the database",async()=>{
   for(let i=0;i<21;i++){
     const id=(await db.query<{id:string}>("insert into public.shoutout_suggestions(name,summary,url) values ('Guest','Hello','https://example.com') returning id")).rows[0].id;
     assert.equal((await db.query<{ok:boolean}>("select public.reserve_submission_notice($1) ok",[id])).rows[0].ok,i<20);
     if(i===0)assert.equal((await db.query<{ok:boolean}>("select public.reserve_submission_notice($1) ok",[id])).rows[0].ok,false,"repeat notification must not use quota");
   }
  });
  await t.test("a felled cutoff excludes later approvals without moving old neighbors",async()=>{
    const before=(await db.query("select id,x,y,public_sequence from public.guestbook_entries where status='approved' and public_sequence<=3 order by public_sequence")).rows;
    const r=await reserve(360,1000,"Later guest");await submit(r);await approve(r.id);
    const after=(await db.query("select id,x,y,public_sequence from public.guestbook_entries where status='approved' and public_sequence<=3 order by public_sequence")).rows;
    assert.deepEqual(after,before);
    assert.equal((await db.query<{n:number}>("select approved_count::int n from public.cypress_state")).rows[0].n,4,"the communal tree keeps growing");
  });
 }finally{await db.close();}
});
