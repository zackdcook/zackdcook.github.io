export const BEBRAVE_TREE_WIDTH = 720;
export const BEBRAVE_UNITS_PER_FOOT = 288;
export const BEBRAVE_ACTIVE_FEET = 5;
export const BEBRAVE_ACTIVE_HEIGHT = BEBRAVE_UNITS_PER_FOOT * BEBRAVE_ACTIVE_FEET;
export const BEBRAVE_RECARVE_GROWTH_FEET = 5;
export const BEBRAVE_RECARVE_GROWTH_HEIGHT = BEBRAVE_UNITS_PER_FOOT * BEBRAVE_RECARVE_GROWTH_FEET;
export const BEBRAVE_SECTION_HEIGHT = BEBRAVE_UNITS_PER_FOOT * 3;
export const BEBRAVE_INITIAL_FEET = 30;
export const BEBRAVE_INITIAL_HEIGHT = BEBRAVE_UNITS_PER_FOOT * BEBRAVE_INITIAL_FEET;
export const BEBRAVE_DRAWING_SECONDS = 60;

export type BeBraveRarity = "common" | "uncommon" | "superior" | "epic" | "legendary";
export type BeBraveRandomRarity = Exclude<BeBraveRarity,"legendary">;
export type BeBraveNormalTool = "arrowhead" | "nail" | "key";
export type BeBraveTool = BeBraveNormalTool | "cache";
export type BeBraveSessionStatus =
  | "tool_select" | "epic_color" | "ready" | "drawing"
  | "completed" | "empty" | "cancelled";

export type BeBraveTreeState = {
  height: number;
  activeTop: number;
  activeBottom: number;
  revision: number;
  completedCount: number;
  latestSequence: number;
};

export const fallbackBeBraveTreeState: BeBraveTreeState = {
  height: BEBRAVE_INITIAL_HEIGHT,
  activeTop: BEBRAVE_INITIAL_HEIGHT - BEBRAVE_ACTIVE_HEIGHT,
  activeBottom: BEBRAVE_INITIAL_HEIGHT,
  revision: 1,
  completedCount: 0,
  latestSequence: 0,
};

export type ToolReveal = Record<BeBraveNormalTool, BeBraveRarity>;

export type BeBraveSessionView = {
  id: string;
  status: BeBraveSessionStatus;
  chosenTool: BeBraveTool | null;
  chosenRarity: BeBraveRarity | null;
  chosenColor: string | null;
  effectSeed: number | null;
  chosenEffect?: string | null;
  toolResults: ToolReveal | null;
  drawingStartedAt: string | null;
  drawingDeadline: string | null;
  drawingFinishedAt: string | null;
  zoneTop: number | null;
  zoneBottom: number | null;
  treeRevision: number | null;
  publicSequence: number | null;
};

export type BeBravePublicStroke = {
  strokeId: string;
  strokeOrder: number;
  points: Array<[number, number]>;
};

export type BeBravePublicDrawing = {
  id: string;
  publicSequence: number;
  rarity: BeBraveRarity;
  color: string;
  effectSeed: number;
  effectId?: string;
  strokes: BeBravePublicStroke[];
};

export type BeBraveLocalTimeline = {
  kind: "living" | "felling" | "felled";
  hacked: boolean;
  additionalStrikes: number | null;
  completedAdditionalStrikes: number;
  snapshotSequence: number | null;
  snapshotHeight: number | null;
  felledAt: string | null;
  immediateFallenSeen: boolean;
};

export const defaultBeBraveTimeline: BeBraveLocalTimeline = {
  kind: "living",
  hacked: false,
  additionalStrikes: null,
  completedAdditionalStrikes: 0,
  snapshotSequence: null,
  snapshotHeight: null,
  felledAt: null,
  immediateFallenSeen: false,
};
