"use server";
import { requireOwner,serviceSupabase } from "@/lib/supabase";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
export async function moderateSubmission(form:FormData){
 await requireOwner();
 const id=String(form.get("id")||""),kind=String(form.get("kind")||""),decision=String(form.get("decision")||"");
 if(!/^[a-f0-9-]{36}$/i.test(id)||!["guestbook","shoutout"].includes(kind)||!["approve","reject"].includes(decision))throw Error("That review is invalid.");
 const client=serviceSupabase();
 let result="saved";
 if(kind==="guestbook"){
   const {data,error}=await client.rpc("cypress_moderate",{p_id:id,p_approve:decision==="approve"});
   if(error)throw Error("That reserved patch is no longer valid. The entry hasn’t been published.");
   result=data?.status||"saved";
 }else{
   const {error}=await client.from("shoutout_suggestions").update({status:decision==="approve"?"approved":"rejected",approved_at:decision==="approve"?new Date().toISOString():null}).eq("id",id).eq("status","pending");
   if(error)throw Error("That recommendation couldn’t be reviewed.");
 }
 updateTag("guestbook");updateTag("shoutouts");
 redirect("/admin/submissions?result="+encodeURIComponent(result));
}
