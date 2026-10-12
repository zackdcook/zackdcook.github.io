import test from "node:test";
import assert from "node:assert/strict";
import { createSignupAttemptGate } from "../lib/book-launch/signup-attempt";

test("verification cannot create an intent before a valid email and clean honeypot", () => {
  const gate = createSignupAttemptGate();
  for (const [email, website] of [["", ""], ["invalid", ""], ["reader@example.com", "bot"]]) {
    assert.throws(() => gate.begin(email, website));
    assert.equal(gate.take(1, "unit-test-token"), null);
  }
});
test("a verified intent normalizes its address and can be consumed only once", () => {
  const gate = createSignupAttemptGate(), request = gate.begin("Reader@Example.com", "");
  assert.equal(gate.take(request.id, ""), null);
  assert.equal(gate.take(request.id, "x".repeat(2049)), null);
  assert.deepEqual(gate.take(request.id, "unit-test-token"), { ...request, email: "reader@example.com", token: "unit-test-token" });
  assert.equal(gate.take(request.id, "unit-test-token"), null);
});
test("editing, closing or retrying cancels late callbacks for the previous email", () => {
  const gate = createSignupAttemptGate(), first = gate.begin("first@example.com", "");
  gate.cancel();
  assert.equal(gate.take(first.id, "old-token"), null);
  const second = gate.begin("second@example.com", ""), third = gate.begin("third@example.com", "");
  assert.equal(gate.take(second.id, "old-token"), null);
  assert.equal(gate.take(third.id, "new-token")?.email, "third@example.com");
  const fourth = gate.begin("fourth@example.com", "");
  assert.throws(() => gate.begin("invalid", ""));
  assert.equal(gate.take(fourth.id, "old-token"), null);
});
