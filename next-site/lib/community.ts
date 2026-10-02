import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { serviceSupabase } from "@/lib/supabase";
import { emptyTree, treeBounds, type TreeState } from "@/lib/tree-space";
import type { GuestEntry } from "@/lib/guestbook";
import shoutouts from "@/content/shoutouts.json";

const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
// Explicit projection: no reservation, hashes, moderation or notification fields.
export const publicGuestFields = "id,public_sequence,created_at,approved_at,mode,display_name,note,font,strokes,geometry,x,y,width,height";
export async function getTreeState(): Promise<TreeState> {
  "use cache"; cacheLife({ stale: 10, revalidate: 10, expire: 60 }); cacheTag("guestbook");
  if (!configured()) return emptyTree;
  const client=serviceSupabase();
  const [state,oldest,newest]=await Promise.all([
    client.from("cypress_state").select("approved_count,version").eq("id",true).single(),
    client.from("guestbook_entries").select("id,y,public_sequence").eq("status","approved").order("public_sequence").limit(1),
    client.from("guestbook_entries").select("id,y,public_sequence").eq("status","approved").order("public_sequence",{ascending:false}).limit(1)
  ]);
  if (state.error) throw new Error("The tree is resting for a moment. Please try again.");
  const count=Number(state.data.approved_count);
  return { ...treeBounds(count), approved_count:count,version:Number(state.data.version),oldest:oldest.data?.[0]||null,newest:newest.data?.[0]||null };
}
export async function getTreeWindow(from: number,to: number,afterY=-1,afterId=""): Promise<GuestEntry[]> {
  "use cache"; cacheLife({ stale:10,revalidate:10,expire:60 }); cacheTag("guestbook");
  if(!configured()) return [];
  let query=serviceSupabase().from("guestbook_entries").select(publicGuestFields).eq("status","approved").gte("y",Math.max(0,from-76)).lt("y",to).order("y").order("id").limit(60);
  if(afterY>=0) query=query.or(`y.gt.${afterY},and(y.eq.${afterY},id.gt.${afterId})`);
  const {data,error}=await query;
  if(error) throw new Error("That part of the tree couldn’t load. Try again.");
  return (data||[]) as GuestEntry[];
}
export async function guestSearch(name: string) {
  if(!configured()) return [];
  const needle=name.normalize("NFC").trim().replace(/\s+/g," ").replace(/[%_\\]/g,"").slice(0,40);
  if(!needle) return [];
  const {data,error}=await serviceSupabase().from("guestbook_entries").select("id,display_name,public_sequence,y,created_at").eq("status","approved").ilike("display_name",`%${needle}%`).order("public_sequence").limit(20);
  if(error) throw new Error("Search is resting for a moment.");
  return data||[];
}
export async function getPublicCarving(id: string) {
  if(!configured()) return null;
  const {data}=await serviceSupabase().from("guestbook_entries").select(publicGuestFields).eq("status","approved").eq("id",id).maybeSingle();
  return data as GuestEntry|null;
}
export async function getOccupiedCells() {
  if(!configured()) return [];
  const state=await getTreeState();
  const {data,error}=await serviceSupabase().from("guestbook_reservations").select("occupied_cells,state,x,y").in("state",["held","pending","permanent"]).gt("expires_at",new Date().toISOString()).gte("y",state.active_top-76).lt("y",state.active_bottom);
  if(error) throw new Error("Available bark couldn’t refresh.");
  // Approved ink is public; pending marks must not be reconstructable from a mask.
  // Publish an anonymous temporary rectangular occupancy cover, never pending ink.
  return [...new Set((data||[]).flatMap(row=>{
    if(row.state==="permanent")return row.occupied_cells as number[];
    const cells:number[]=[];
    for(let y=row.y/4;y<(row.y+76)/4;y++)for(let x=row.x/4;x<(row.x+216)/4;x++)cells.push(y*180+x);
    return cells;
  }))];
}
export async function getShoutouts() {
  "use cache"; cacheLife({stale:30,revalidate:30,expire:600}); cacheTag("shoutouts");
  if(!configured()) return shoutouts;
  const {data}=await serviceSupabase().from("shoutout_suggestions").select("id,name,summary,url").eq("status","approved").order("approved_at",{ascending:false}).limit(100);
  return [...shoutouts,...(data||[]).map(row=>({...row,subtitle:"",note:row.summary,groupName:""}))];
}
