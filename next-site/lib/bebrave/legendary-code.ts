import { createHash, randomInt, randomUUID } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DOMAIN = "zackdcook:bebrave:legendary:v1:";

/** 16 uniformly sampled base-36 symbols: 82.7 bits; no modulo bias. */
export function createLegendaryCode() {
  const code=Array.from({length:16},()=>ALPHABET[randomInt(ALPHABET.length)]).join("");
  return {id:randomUUID(),code,digest:legendaryCodeDigest(code)!};
}

export function normalizeLegendaryCode(input:unknown):string|null {
  if(typeof input!=="string"||input.length>64)return null;
  const code=input.trim().toUpperCase();
  return /^[A-Z0-9]{16}$/.test(code)?code:null;
}

/** Random codes are not passwords: fast one-way hashing is appropriate here. */
export function legendaryCodeDigest(input:unknown):string|null {
  const code=normalizeLegendaryCode(input);
  return code?createHash("sha256").update(DOMAIN+code).digest("hex"):null;
}
