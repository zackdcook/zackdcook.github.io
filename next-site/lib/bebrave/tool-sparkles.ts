/** Saved seeds give the reveal stable, independently scattered stars on every render. */
export function legendaryToolSparkles(seed: number, count = 23) {
  let state = (seed >>> 0) ^ 0xa53c9e17;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: 6 + random() * 88, y: 6 + random() * 77,
    size: 4 + random() * 7, delay: -random() * 6,
    duration: 1.6 + random() * 2.3, rotation: random() * 90,
  }));
}
