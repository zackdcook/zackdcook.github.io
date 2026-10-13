export type EffectQuality = "low" | "medium" | "high";
export type EffectDetail = {
  quality: EffectQuality;
  particles: number;
  ribbons: boolean;
  particleGlow: boolean;
  sampleStride: number;
  pixelBudget: number;
};

const details: EffectDetail[] = [
  { quality: "low", particles: 28, ribbons: false, particleGlow: false, sampleStride: 3, pixelBudget: 450_000 },
  { quality: "medium", particles: 64, ribbons: true, particleGlow: false, sampleStride: 2, pixelBudget: 700_000 },
  { quality: "high", particles: 120, ribbons: true, particleGlow: true, sampleStride: 1, pixelBudget: 900_000 },
];
export const fullEffectDetail = details[2];

/** Keep native scrolling independent of effects. Back off quickly under real
 * frame pressure, then cautiously recover when the visitor and device settle. */
export class AdaptiveEffectQuality {
  private ceiling: number;
  private interaction = -Infinity;
  private changed = -Infinity;
  private cost = 4;
  private gap = 16.7;
  private badFrames = 0;
  private samples = 0;

  constructor(cores = 8, memory = 8) {
    this.ceiling = memory <= 2 ? 0 : cores <= 4 || memory <= 4 ? 1 : 2;
  }

  interact(time: number) { this.interaction = time; }

  frame(gap: number) {
    // A hidden tab, a sleeping renderer or OS suspension is not overload.
    if (gap > 0 && gap < 250) this.gap += (gap - this.gap) * .12;
  }

  painted(milliseconds: number, time: number) {
    this.cost += (milliseconds - this.cost) * .2;
    this.samples++;
    this.badFrames = this.cost > 11 || this.gap > 25 ? this.badFrames + 1 : Math.max(0, this.badFrames - 1);
    if (this.badFrames >= 4 && this.ceiling > 0) {
      this.ceiling--; this.changed = time; this.badFrames = 0;
    } else if (this.samples >= 24 && time - this.interaction > 600 && time - this.changed > 2500 && this.cost < 7 && this.gap < 20 && this.ceiling < 2) {
      this.ceiling++; this.changed = time;
    }
  }

  detail(time: number): EffectDetail {
    const active = time - this.interaction < 450;
    const level = active ? Math.min(1, this.ceiling) : this.ceiling;
    // Do not resize the raster buffers with each scroll/pinch. Resolution only
    // follows sustained pressure, while particles/ribbons respond immediately.
    return { ...details[level], pixelBudget: details[this.ceiling].pixelBudget };
  }
}
