import type { BeBraveRarity,BeBraveRandomRarity } from "@/lib/bebrave-types";

export const BEBRAVE_RARITY_WEIGHTS = {
  common: 42,
  uncommon: 35,
  superior: 18,
  epic: 5,
} as const satisfies Record<BeBraveRandomRarity, number>;

export const BEBRAVE_EPIC_ROLL_START = 10_000 - 100 * BEBRAVE_RARITY_WEIGHTS.epic;

export const BEBRAVE_COMMON_COLOR = {
  name: "Warm Bark Brown",
  value: "#8A5A3A",
};

export const BEBRAVE_EPIC_PITY_PERCENT = [5, 8, 13, 21, 34, 50, 70, 90, 100] as const;

export function epicChanceForPity(pity: number) {
  const index = Math.max(0, Math.min(BEBRAVE_EPIC_PITY_PERCENT.length - 1, Math.floor(pity)));
  return BEBRAVE_EPIC_PITY_PERCENT[index];
}

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

export function tierFromRoll(roll: number): BeBraveRandomRarity {
  const bounded = Math.max(0, Math.min(9_999, Math.floor(roll)));
  let ceiling = 0;
  for (const rarity of ["common", "uncommon", "superior", "epic"] as const) {
    ceiling += BEBRAVE_RARITY_WEIGHTS[rarity] * 100;
    if (bounded < ceiling) return rarity;
  }
  return "epic";
}

export function paletteForTier(rarity: BeBraveRarity) {
  if (rarity === "common") return [BEBRAVE_COMMON_COLOR] as const;
  if (rarity === "uncommon") return BEBRAVE_UNCOMMON_COLORS;
  if (rarity === "superior") return BEBRAVE_SUPERIOR_COLORS;
  return BEBRAVE_EPIC_COLORS;
}
