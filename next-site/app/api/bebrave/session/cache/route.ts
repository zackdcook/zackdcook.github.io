import { assertSessionId, cacheCodeDigest, ownedSession, requestContext, secureSeed, sessionView } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";
import { legendaryCodeDigest } from "@/lib/bebrave/legendary-code";
import { readLockboxBody } from "@/lib/bebrave/request-body";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("Start a carving session first.");
    const body = await readLockboxBody(request);
    const id = assertSessionId(body.sessionId);
    const parameters={p_session:id,p_visitor_hash:context.visitorHash,p_network_hash:context.networkHash,p_seed:secureSeed()};
    const legendary=await serviceSupabase().rpc("bebrave_redeem_legendary",{
      ...parameters,p_code_digest:legendaryCodeDigest(body.code)||"0".repeat(64),
    });
    if(legendary.error)throw new Error("Nothing happened.");
    let valid=legendary.data===true;
    if(!valid){
      // Preserve existing Epic cache codes and their established behavior.
      const legacy=await serviceSupabase().rpc("bebrave_redeem_cache",{
        ...parameters,p_code_digest:cacheCodeDigest(typeof body.code==="string"?body.code:""),
      });
      valid=!legacy.error&&legacy.data===true;
    }
    if (!valid) return Response.json({ valid: false, message: "Nothing happened." }, { status: 200, headers: { "Cache-Control": "no-store" } });
    const row = await ownedSession(id, context.visitorHash);
    return Response.json({ valid: true, session: sessionView(row), colors: BEBRAVE_EPIC_COLORS, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ valid: false, message: "Nothing happened." }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
