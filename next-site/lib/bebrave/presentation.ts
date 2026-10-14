import type { BeBraveNormalTool, BeBraveSessionView } from "../bebrave-types";

export const toolCopy: Record<BeBraveNormalTool, { label: string; dialogue: string }> = {
  arrowhead: { label: "Stone-carved arrowhead", dialogue: "The arrowhead feels hefty in your grasp, its edges still razor sharp, even after the multiple lifetimes it has slept through." },
  nail: { label: "Bent rusty nail", dialogue: "The nail has a rough, flaky texture that stains your fingers red." },
  key: { label: "Brass house key", dialogue: "The key and its jagged teeth cover your fingers with a metallic scent." },
};
export const normalTools: BeBraveNormalTool[] = ["arrowhead", "nail", "key"];
export const groundTools = [...normalTools, "cache"] as const;
export const toolPrompt = "You look down at the base of the trunk and see a stone-carved arrowhead, a bent rusty nail, and a brass house key. All three are lying on the ground beside a mossy cache sealed by a numeric keypad. Which do you choose?";
export const cacheDescription = "The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep.";
export const cacheOpened = "The top of the cache springs open, peeling away a layer of moss. Inside sits a small pocket knife, tied with a braided parachute-cord lanyard. The knife flicks open with a satisfying clink.";
export const toolsFarewell = "The other items speak their names before fading away…";

/** A refresh can replay presentation, but only the server can choose a result. */
export function resumedScene(session: BeBraveSessionView | null) {
  if (!session) return "human" as const;
  if (session.status === "tool_select") return "tools" as const;
  if (session.status === "epic_color") return "epic-color" as const;
  if (session.status === "ready") return session.chosenTool==="cache"?"epic-color" as const:"reveal" as const;
  if (session.status === "drawing") return "draw" as const;
  return "admire" as const;
}

export function afterReveal(session: BeBraveSessionView) {
  return session.status === "epic_color" || session.chosenTool==="cache" ? "epic-color" as const : "warning" as const;
}
