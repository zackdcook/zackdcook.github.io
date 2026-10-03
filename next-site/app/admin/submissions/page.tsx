import Link from "next/link";
import { currentUser,isOwner,serviceSupabase } from "@/lib/supabase";
import { submissionSetup } from "@/lib/submission-config";
import { AuthPanel } from "@/components/auth-panel";
import { SignatureArt } from "@/components/signature-art";
import { TreeSection } from "@/components/tree-section";
import { moderateSubmission } from "@/app/actions/moderate";
import { getTreeWindow } from "@/lib/community";
import type { GuestEntry } from "@/lib/guestbook";
export const metadata={title:"Review the tree & shoutouts",robots:{index:false,follow:false}};
export default async function Submissions({searchParams}:{searchParams:Promise<{result?:string}>}){
 const user=await currentUser(), setup=submissionSetup();
 if(!setup.database||!setup.signIn)return <div className="shell page-wrap"><div className="page-intro"><h1>Your<br/><em>review desk.</em></h1><p>Private guestbook and shoutout reviews will appear here after the free backend is connected.</p></div><Link className="button" href="/admin">Back to your desk</Link></div>;
 if(!user)return <div className="shell page-wrap"><AuthPanel next="/admin/submissions" google={process.env.GOOGLE_AUTH_ENABLED==="true"} facebook={process.env.FACEBOOK_AUTH_ENABLED==="true"} emailEnabled={process.env.EMAIL_OTP_ENABLED==="true"}/></div>;
 if(!isOwner(user))return <div className="shell page-wrap"><h1>This desk belongs to Zack.</h1></div>;
 const client=serviceSupabase();
 const [guestResult,shoutoutResult,params]=await Promise.all([
   client.from("guestbook_entries").select("*").eq("status","pending").order("created_at").limit(50),
   client.from("shoutout_suggestions").select("*").eq("status","pending").order("created_at").limit(50),
   searchParams
 ]);
 if(guestResult.error||shoutoutResult.error)throw Error("The review desk couldn’t load. Check the database migration.");
 const guests=await Promise.all((guestResult.data||[]).map(async entry=>{
   const [neighbors,reservation,context]=await Promise.all([
     getTreeWindow(Math.max(0,entry.y-200),entry.y+300),
     client.from("guestbook_reservations").select("state,expires_at,zone_top,zone_bottom").eq("id",entry.id).single(),
     client.rpc("cypress_moderation_context",{p_id:entry.id})
   ]);
   return {entry:entry as GuestEntry,neighbors,reservation:reservation.data,context:context.data};
 }));
 return <div className="shell page-wrap"><div className="page-intro"><p className="eyebrow">Only you can publish these</p><h1>A little<br/><em>review desk.</em></h1><Link className="button button-small" href="/admin">Your writing desk</Link></div>
 {params.result&&<p role="status">Review saved: {params.result}.</p>}
 <h2>Carvings awaiting approval</h2>
 {!guests.length&&<p>No carvings waiting. The tree is resting.</p>}
 {guests.map(({entry,neighbors,reservation,context})=><article className="moderation-entry" key={entry.id}>
   <h3>{entry.display_name}</h3><p>{entry.note}</p><time dateTime={entry.created_at}>{entry.created_at} UTC</time>
   <div className="moderation-neighborhood" aria-label="Chosen carving location and nearby approved marks"><div className="moderation-tree-space" style={{transform:"translateY("+(-entry.y+130)+"px)"}}>
     <TreeSection section={Math.floor(entry.y/864)}/><TreeSection section={Math.floor(entry.y/864)+1}/>
     {neighbors.map(n=><div key={n.id} className="moderation-neighbor" style={{left:n.x,top:n.y,width:n.width,height:n.height}}><SignatureArt name={n.display_name} note={n.note} mode={n.mode} font={n.font} strokes={n.strokes} geometry={n.geometry} carved/></div>)}
     <div className="moderation-chosen" style={{left:entry.x,top:entry.y,width:entry.width,height:entry.height}}><SignatureArt name={entry.display_name} note={entry.note} mode={entry.mode} font={entry.font} strokes={entry.strokes} geometry={entry.geometry} carved/><span>Chosen spot · pending</span></div>
   </div></div>
   <p className="form-hint">World location {entry.x}, {entry.y}. Hold expires {reservation?.expires_at}. Browser {context?.browser_hint}; network {context?.network_hint}; {context?.same_network_submissions??"?"} submissions from that network today.</p>
   <form action={moderateSubmission}><input type="hidden" name="kind" value="guestbook"/><input type="hidden" name="id" value={entry.id}/><div className="actions"><button name="decision" value="approve" className="button" disabled={!reservation||Date.parse(reservation.expires_at)<=Date.now()}>Approve this spot</button><button name="decision" value="reject" className="button button-small">Reject &amp; release</button></div></form>
 </article>)}
 <h2>Shoutouts awaiting approval</h2>{!(shoutoutResult.data||[]).length&&<p>No recommendations waiting.</p>}
 {(shoutoutResult.data||[]).map(entry=><article className="moderation-entry" key={entry.id}><h3>{entry.name}</h3><p>{entry.summary}</p><a className="button button-small" href={entry.url} target="_blank" rel="noopener noreferrer">Visit their site</a><form action={moderateSubmission}><input name="kind" type="hidden" value="shoutout"/><input name="id" type="hidden" value={entry.id}/><div className="actions"><button className="button" name="decision" value="approve">Approve</button><button className="button button-small" name="decision" value="reject">Reject</button></div></form></article>)}
 </div>;
}
