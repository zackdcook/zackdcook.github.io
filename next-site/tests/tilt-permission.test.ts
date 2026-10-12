import { test } from "node:test";
import assert from "node:assert/strict";
import { createTiltPermissionGate, enrollTiltOnTap } from "../lib/phone-tilt";

test("tilt permission invokes synchronously, coalesces concurrent requests and records denial separately", async () => {
  let calls = 0, resolve!: (value: boolean) => void;
  const remembered: boolean[] = [];
  const ask = createTiltPermissionGate(() => { calls++; return new Promise<boolean>(done => { resolve = done; }); }, allowed => remembered.push(allowed));
  const first = ask();
  assert.equal(calls, 1, "permission must start before transient activation is lost");
  assert.equal(ask(), first);
  resolve(false);
  assert.equal(await first, false);
  assert.deepEqual(remembered, [false]);
  const retry = ask(); resolve(true);
  assert.equal(await retry, true);
  assert.equal(calls, 2);
});

test("failed sensor permission can be retried, synthetic clicks never request sensor access", async () => {
  let count = 0;
  const ask = createTiltPermissionGate(() => { count++; return Promise.reject(new Error("permission")); }, () => { throw Error("must not remember a transport failure"); });
  await assert.rejects(ask()); await assert.rejects(ask());
  assert.equal(count, 2);
  const events = new EventTarget(); let prompts = 0;
  const stop = enrollTiltOnTap(events, () => true, async () => { prompts++; return true; });
  events.dispatchEvent(new Event("click"));
  assert.equal(prompts, 0);
  stop();
});
