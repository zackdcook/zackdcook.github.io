import type { BeBraveRarity } from "@/lib/bebrave-types";

export const BEBRAVE_RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  superior: 15,
  epic: 5,
} as const satisfies Record<BeBraveRarity, number>;

export const BEBRAVE_COMMON_COLOR = {
  name: "Dark Bark Brown",
  value: "#3B2418",
};

export const BEBRAVE_UNCOMMON_COLORS = [
  { name: "Cyan", value: "#00A9C7" },
  { name: "Magenta", value: "#C92C8C" },
  { name: "Yellow", value: "#D8B414" },
  { name: "Violet", value: "#6D4FD1" },
  { name: "Teal", value: "#008C86" },
  { name: "Coral", value: "#D94F4F" },
] as const;

export const BEBRAVE_SUPERIOR_COLORS = [
  { name: "Neon Cyan", value: "#00F5FF" },
  { name: "Neon Magenta", value: "#FF2BD6" },
  { name: "Neon Yellow", value: "#FFF44F" },
  { name: "Neon Green", value: "#39FF14" },
  { name: "Neon Orange", value: "#FF7A00" },
  { name: "Neon Violet", value: "#B026FF" },
  { name: "Electric Blue", value: "#3D7BFF" },
] as const;

export const BEBRAVE_EPIC_COLORS = [
  BEBRAVE_COMMON_COLOR,
  ...BEBRAVE_UNCOMMON_COLORS,
  ...BEBRAVE_SUPERIOR_COLORS,
] as const;

export function tierFromRoll(roll: number): BeBraveRarity {
  const bounded = Math.max(0, Math.min(9_999, Math.floor(roll)));
  if (bounded < 5_000) return "common";
  if (bounded < 8_000) return "uncommon";
  if (bounded < 9_500) return "superior";
  return "epic";
}

export function paletteForTier(rarity: BeBraveRarity) {
  if (rarity === "common") return [BEBRAVE_COMMON_COLOR] as const;
  if (rarity === "uncommon") return BEBRAVE_UNCOMMON_COLORS;
  if (rarity === "superior") return BEBRAVE_SUPERIOR_COLORS;
  return BEBRAVE_EPIC_COLORS;
}
