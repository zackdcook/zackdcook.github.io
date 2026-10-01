import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from "node:crypto";

function keyBytes(key: string) {
  if (!/^[a-f0-9]{64}$/i.test(key))
    throw new Error("Integration encryption key is not configured.");
  return Buffer.from(key, "hex");
}

export function sealToken(value: unknown, key: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(key), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function openToken<T>(sealed: string, key: string): T {
  const parts = sealed.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted token.");
  const [iv, tag, encrypted] = parts.map((part) =>
    Buffer.from(part, "base64url"),
  );
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(key), iv);
  decipher.setAuthTag(tag);
  const clear = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(clear) as T;
}

export function matchingState(expected: string, received: string) {
  const a = Buffer.from(expected),
    b = Buffer.from(received);
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}
