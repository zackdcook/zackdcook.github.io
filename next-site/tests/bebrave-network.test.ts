import test from "node:test";
import assert from "node:assert/strict";
import { networkGroup } from "../lib/bebrave/network-signal";
import { participationResponse } from "../lib/bebrave/participation-response";

test("network groups canonicalize IPv4, mapped IPv4 and IPv6 privacy addresses", () => {
  assert.equal(networkGroup("192.0.2.1"), "192.0.2.1");
  assert.equal(networkGroup("::ffff:192.0.2.1"), networkGroup("192.0.2.1"));
  assert.equal(networkGroup("::ffff:c000:201"), networkGroup("192.0.2.1"));
  assert.equal(networkGroup("2001:db8:1234:5678::1"), networkGroup("2001:0db8:1234:5678:abcd:1234:5678:ffff"));
  assert.notEqual(networkGroup("2001:db8:1234:5679::1"), networkGroup("2001:db8:1234:5678::1"));
  for (const invalid of ["", "unknown", "192.0.2.1, 203.0.113.1", "fe80::1%eth0", "012.1.1.1"]) assert.throws(() => networkGroup(invalid));
});

test("participation limits have useful private errors and retry guidance", async () => {
  assert.equal(participationResponse({session_id:"owned"}), null);
  const blocked=participationResponse({error:"participation_limit",retry_seconds:72})!;
  assert.equal(blocked.status,429);assert.equal(blocked.headers.get("Retry-After"),"72");
  assert.equal(blocked.headers.get("Cache-Control"),"no-store");
  assert.equal((await blocked.json()).category,"participation_limit");
  const growth=participationResponse({error:"growth",growth_feet_remaining:3})!;
  assert.deepEqual(await growth.json(),{error:"growth",growthFeetRemaining:3});
  const shared=participationResponse({error:"network_growth",growth_feet_remaining:1})!;
  assert.equal((await shared.json()).error.includes("another 1 foot"),true);
  assert.equal(participationResponse({error:"finished"})!.status,409);
});
