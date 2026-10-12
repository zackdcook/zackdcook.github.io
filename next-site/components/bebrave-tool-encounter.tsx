"use client";

import type { BeBraveNormalTool, BeBraveRarity, BeBraveSessionView } from "@/lib/bebrave-types";
import { groundTools, toolCopy } from "@/lib/bebrave/presentation";
import { choiceKeys } from "./bebrave-menu";

type GroundTool = BeBraveNormalTool | "cache";
export function ToolImage({ tool }: { tool: GroundTool | "knife" | "cache-open" }) {
  return <span className={`bebrave-tool-image tool-${tool}`} aria-hidden="true"/>;
}
function RarityEffect({ rarity }: { rarity: BeBraveRarity }) {
  return <span className={`bebrave-rarity-fx fx-${rarity}`} aria-hidden="true"><i/><i/><i/><i/><i/></span>;
}

/** Object positions are presentation only. The result is always a server snapshot. */
export function ToolEncounter({ session, reveal = false, selected, busy, onHighlight }: { session: BeBraveSessionView | null; reveal?: boolean; selected?: GroundTool | null; busy?: boolean; onHighlight?: (tool: GroundTool) => void }) {
  const knife = reveal && session?.chosenTool === "cache";
  return <div className={`bebrave-ground-encounter ${reveal ? "is-revealed" : "is-arriving"} ${knife ? "has-knife" : ""}`}>
    <div className="bebrave-encounter-ground" aria-hidden="true"/>{!reveal&&<span className="bebrave-encounter-caption">Choose your carving tool</span>}
    <div className="bebrave-encounter-objects" role="group" aria-label={reveal ? "The tools reveal their rarity" : "Choose your carving tool"} onKeyDown={choiceKeys}>
      {groundTools.map(tool => {
        const chosen = reveal && session?.chosenTool === tool;
        const rarity = chosen ? session?.chosenRarity : tool !== "cache" ? session?.toolResults?.[tool] : null;
        const name = tool === "cache" ? "Mossy cache" : toolCopy[tool].label;
        const content = <>{chosen&&knife&&<span className="bebrave-open-lockbox"><ToolImage tool="cache-open"/></span>}<ToolImage tool={chosen && knife ? "knife" : tool}/>{reveal && rarity && <RarityEffect rarity={rarity}/>}<span className="bebrave-object-label">{tool === "cache" ? chosen && knife ? "Pocket knife" : <span>Mossy cache</span> : name}{reveal && rarity && <strong className="bebrave-rarity-name">{rarity}</strong>}</span></>;
        return reveal ? <div key={tool} className={`bebrave-ground-object object-${tool} bebrave-reveal-tool ${chosen ? "is-chosen" : "is-missed"} rarity-${rarity || "common"}`} aria-label={`${name}${rarity ? `: ${rarity}` : ""}`}>{content}</div> :
          <button key={tool} type="button" className={`bebrave-ground-object object-${tool} bebrave-image-choice ${selected === tool ? "is-highlighted" : ""}`} disabled={busy} aria-label={name} aria-pressed={selected === tool} onPointerEnter={event => { if (event.pointerType === "mouse") onHighlight?.(tool); }} onFocus={() => onHighlight?.(tool)} onClick={() => onHighlight?.(tool)}>{content}</button>;
      })}
    </div>
    {reveal && <div className={`bebrave-reveal-banner rarity-${session?.chosenRarity}`} aria-live="polite"><span>{session?.chosenRarity}</span><small>{knife ? "Pocket knife" : session?.chosenTool ? toolCopy[session.chosenTool as BeBraveNormalTool]?.label : ""}</small></div>}
  </div>;
}
