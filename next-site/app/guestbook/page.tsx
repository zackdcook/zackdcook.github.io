import { pageMetadata } from "@/lib/page-metadata";
import { getTreeState,getTreeWindow } from "@/lib/community";
import { submissionsConfigured } from "@/lib/submission-config";
import { CypressTree } from "@/components/cypress-tree";
import { treeSectionHeight } from "@/lib/tree-space";
export const metadata=pageMetadata("guestbook","The cypress guestbook");
export default async function Guestbook(){
 const state=await getTreeState();
 const entries=await getTreeWindow(Math.max(0,state.height-treeSectionHeight*2),state.height);
 return <><div className="shell page-intro guestbook-intro"><p className="eyebrow">Leave a little piece of yourself</p><h1>A growing<br/><em>guestbook.</em></h1><p>A Florida cypress. A patch of bark. Your name, exactly where you leave it.</p></div><CypressTree initialState={state} initialEntries={entries} enabled={submissionsConfigured()} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||""}/></>;
}
