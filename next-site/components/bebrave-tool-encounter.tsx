"use client";

import type { CSSProperties } from "react";
import type { BeBraveNormalTool, BeBraveRarity, BeBraveSessionView } from "@/lib/bebrave-types";
import { groundTools, toolCopy } from "@/lib/bebrave/presentation";
import { choiceKeys } from "./bebrave-menu";
import { BeBraveCypress } from "./bebrave-cypress";
import { legendaryToolSparkles } from "@/lib/bebrave/tool-sparkles";

type GroundTool = BeBraveNormalTool | "cache";
export function ToolImage({ tool }: { tool: GroundTool | "knife" | "cache-open" }) {
  return <span className={`bebrave-tool-image tool-${tool}`} aria-hidden="true"/>;
}
function RarityEffect({ rarity, seed }: { rarity: BeBraveRarity; seed: number }) {
  const stars=rarity==="legendary"?legendaryToolSparkles(seed):Array.from({length:5},()=>null);
  return <span className={`bebrave-rarity-fx fx-${rarity}`} aria-hidden="true">{stars.map((star,index)=><i key={index} style={star?{
    left:`${star.x}%`,top:`${star.y}%`,right:"auto",bottom:"auto",animationDelay:`${star.delay}s`,animationDuration:`${star.duration}s`,width:`${star.size}px`,height:`${star.size}px`,rotate:`${star.rotation}deg`,
  } as CSSProperties:undefined}/>)}</span>;
}

/** Object positions are presentation only. The result is always a server snapshot. */
export function ToolEncounter({ session, reveal = false, selected, busy, onHighlight, onChoose }: { session: BeBraveSessionView | null; reveal?: boolean; selected?: GroundTool | null; busy?: boolean; onHighlight?: (tool: GroundTool) => void; onChoose?: (tool: GroundTool) => void }) {
  const knife = reveal && session?.chosenTool === "cache";
  return <div className={`bebrave-ground-encounter ${reveal ? "is-revealed" : "is-arriving"} ${knife ? "has-knife" : ""}`}>
    <BeBraveCypress/>{!reveal&&<span className="bebrave-encounter-caption">Choose your carving tool</span>}
    <div className="bebrave-encounter-objects" role="group" aria-label={reveal ? "The tools reveal their rarity" : "Choose your carving tool"} onKeyDown={choiceKeys}>
      {groundTools.map(tool => {
        const chosen = reveal && session?.chosenTool === tool;
        const rarity = chosen ? session?.chosenRarity : tool !== "cache" ? session?.toolResults?.[tool] : null;
        const name = tool === "cache" ? "Mossy cache" : toolCopy[tool].label;
        const content = <>{chosen&&knife&&<span className="bebrave-open-lockbox"><ToolImage tool="cache-open"/></span>}<ToolImage tool={chosen && knife ? "knife" : tool}/>{reveal && rarity && <RarityEffect rarity={rarity} seed={session?.effectSeed??0}/>}<span className="bebrave-object-label">{tool === "cache" ? chosen && knife ? "Pocket knife" : <span>Mossy cache</span> : name}{reveal && rarity && <strong className="bebrave-rarity-name">{rarity}</strong>}</span></>;
        return reveal ? <div key={tool} className={`bebrave-ground-object object-${tool} bebrave-reveal-tool ${chosen ? "is-chosen" : "is-missed"} rarity-${rarity || "common"}`} aria-label={`${name}${rarity ? `: ${rarity}` : ""}`}>{content}</div> :
          <button key={tool} type="button" className={`bebrave-ground-object object-${tool} bebrave-image-choice ${selected === tool ? "is-highlighted" : ""}`} disabled={busy} aria-label={name} aria-pressed={selected === tool} onPointerEnter={event => { if (event.pointerType === "mouse") onHighlight?.(tool); }} onFocus={() => onHighlight?.(tool)} onClick={() => (onChoose || onHighlight)?.(tool)}>{content}</button>;
      })}
    </div>
    {reveal && <div className={`bebrave-reveal-banner rarity-${session?.chosenRarity}`} aria-live="polite"><span>{session?.chosenRarity}</span><small>{knife ? "Pocket knife" : session?.chosenTool ? toolCopy[session.chosenTool as BeBraveNormalTool]?.label : ""}</small></div>}
  </div>;
}
