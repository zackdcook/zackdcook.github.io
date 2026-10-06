import { createHmac } from "node:crypto";

const code = process.argv[2];
const campaign = process.argv[3] || "manual";
const source = process.argv[4] || "personal";
const key = process.env.BEBRAVE_CACHE_HMAC_KEY || process.env.BEBRAVE_HMAC_KEY || process.env.SUBMISSION_HMAC_KEY;
if (!code || !key || key.length < 32) {
  console.error("Usage: BEBRAVE_CACHE_HMAC_KEY=... node scripts/bebrave-cache-code.mjs CODE [campaign] [source]");
  process.exit(1);
}
const normalized = code.normalize("NFKC").trim().replace(/\s+/g, "").toUpperCase();
const digest = createHmac("sha256", key).update(`bebrave-cache:${normalized}`).digest("hex");
const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
console.log(`insert into public.bebrave_cache_codes(code_digest,campaign,source,max_redemptions) values (${q(digest)},${q(campaign)},${q(source)},1);`);
