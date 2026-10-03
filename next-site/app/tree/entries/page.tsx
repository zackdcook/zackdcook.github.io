import Link from "next/link";
import { serviceSupabase } from "@/lib/supabase";
import { publicGuestFields } from "@/lib/community";
import type { GuestEntry } from "@/lib/guestbook";
import { pageMetadata } from "@/lib/page-metadata";
export const metadata={...pageMetadata("guestbook","Guestbook · readable list"),alternates:{canonical:"/tree/entries"}};
export default async function GuestList({searchParams}:{searchParams:Promise<{after?:string;cutoff?:string}>}){
 const params=await searchParams;
 const after=Math.max(0,Number(params.after)||0);
 const cutoff=params.cutoff===undefined?undefined:Number(params.cutoff);
 if(cutoff!==undefined&&(!Number.isSafeInteger(cutoff)||cutoff<0||cutoff>1_000_000_000))throw Error("Invalid tree snapshot.");
 const snapshot=cutoff===undefined?"":"&cutoff="+cutoff;
 let entries:GuestEntry[]=[];
 if(process.env.NEXT_PUBLIC_SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY)){
   let query=serviceSupabase().from("guestbook_entries").select(publicGuestFields).eq("status","approved").gt("public_sequence",after).order("public_sequence").limit(31);
   if(cutoff!==undefined)query=query.lte("public_sequence",cutoff);
   const {data,error}=await query;
   if(error)throw Error("The guest list couldn’t load. Please try again.");
   entries=(data||[]) as GuestEntry[];
 }
 const more=entries.length>30, visible=entries.slice(0,30);
 return <div className="shell page-wrap"><div className="page-intro"><p className="eyebrow">The same tree, in words</p><h1>Everyone<br/><em>who wandered in.</em></h1><p>The names, notes, and dates behind the carvings.</p><Link className="button" href="/tree">Back to the tree</Link></div>
 {visible.length?<ol className="semantic-guests">{visible.map(entry=><li key={entry.id}><article><h2>{entry.display_name} <small>#{entry.public_sequence}</small></h2>{entry.note&&<p>{entry.note}</p>}{entry.mode==="drawn"&&<p>This guest left a hand-drawn mark.</p>}<time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("en-US",{dateStyle:"long",timeStyle:"short",timeZone:"America/New_York"})} Eastern</time><div className="actions"><Link className="button button-small" href={"/tree?id="+entry.id}>Find this carving</Link></div></article></li>)}</ol>:<p className="empty-note">No public carvings yet. A little piece of history is waiting for you.</p>}
 <div className="actions">{after>0&&<Link className="button" href={"/tree/entries"+(cutoff===undefined?"":"?cutoff="+cutoff)}>First guests</Link>}{more&&<Link className="button" href={"/tree/entries?after="+visible.at(-1)!.public_sequence+snapshot}>Next guests</Link>}</div></div>;
}
