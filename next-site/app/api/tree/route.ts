import { getTreeState,getTreeWindow,getOccupiedCells,guestSearch,getPublicCarving } from "@/lib/community";
import { treeSectionHeight } from "@/lib/tree-space";

export async function GET(request: Request) {
  const params=new URL(request.url).searchParams;
  try {
    const id=params.get("id");
    if(id) {
      if(!/^[a-f0-9-]{36}$/i.test(id)) return Response.json({error:"Invalid carving."},{status:400});
      return Response.json({entry:await getPublicCarving(id)},{headers:{"Cache-Control":"public, max-age=10, s-maxage=10"}});
    }
    if(params.has("q")) return Response.json({results:await guestSearch(params.get("q")||"")},{headers:{"Cache-Control":"public, max-age=15, s-maxage=15"}});
    const state=await getTreeState();
    if(params.has("placement")) return Response.json({state,occupied:await getOccupiedCells()},{headers:{"Cache-Control":"no-store"}});
    const section=Number(params.get("section")??Math.floor(state.active_top/treeSectionHeight));
    const afterY=Number(params.get("afterY")??-1),afterId=params.get("afterId")||"";
    if(!Number.isSafeInteger(section)||section<0||section>Math.floor(state.height/treeSectionHeight)||!Number.isSafeInteger(afterY)||afterY < -1||(afterId&&!/^[a-f0-9-]{36}$/i.test(afterId))) return Response.json({error:"Invalid tree section."},{status:400});
    const entries=await getTreeWindow(section*treeSectionHeight,(section+1)*treeSectionHeight,afterY,afterId);
    return Response.json({state,entries,more:entries.length===60},{headers:{"Cache-Control":"public, max-age=10, s-maxage=10"}});
  } catch { return Response.json({error:"The tree is resting for a moment. Please try again."},{status:503,headers:{"Cache-Control":"no-store"}}); }
}
