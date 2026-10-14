import { isIP } from "node:net";

/** Coarse server network signal; never a hardware identifier or a player ID. */
export function networkGroup(address: string): string {
  const ip = address.trim();
  const family = isIP(ip);
  if (family === 4) return ip.split(".").map(Number).join(".");
  if (family !== 6 || ip.includes("%")) throw new Error("The connection could not be verified. Please try again.");
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const [left, right] = canonical.split("::");
  const first = left ? left.split(":") : [];
  const last = right ? right.split(":") : [];
  const words = right === undefined ? first : [...first, ...Array(8-first.length-last.length).fill("0"), ...last];
  const numbers = words.map(word => parseInt(word, 16));
  if (numbers.slice(0,5).every(value => value === 0) && numbers[5] === 0xffff) {
    return [numbers[6] >> 8, numbers[6] & 255, numbers[7] >> 8, numbers[7] & 255].join(".");
  }
  // Privacy addresses within one IPv6 subnet share the same budget.
  return `${numbers.slice(0,4).map(value => value.toString(16)).join(":")}::/64`;
}
