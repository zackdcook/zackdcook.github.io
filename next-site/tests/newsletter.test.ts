import { test } from "node:test";
import assert from "node:assert/strict";
import { subscriptionChoices,subscriptionReceipt,bookCopy,newsletterCopy } from "../lib/book-launch/shared";
import { createSignupAttemptGate } from "../lib/book-launch/signup-attempt";
test("legacy requests cannot silently subscribe to newsletters",()=>{assert.deepEqual(subscriptionChoices(undefined,undefined),{book:true,newsletter:false});});
test("only boolean explicit consent is accepted and at least one list is required",()=>{
  assert.deepEqual(subscriptionChoices(false,true),{book:false,newsletter:true});
  assert.throws(()=>subscriptionChoices(false,false));
  for(const v of ["true",1,{},null]) assert.throws(()=>subscriptionChoices(false,v));
});
test("human verification is bound to the chosen subscriptions as well as the email",()=>{
  const gate=createSignupAttemptGate(),first=gate.begin("reader@example.com","",{book:true,newsletter:false});
  const second=gate.begin("reader@example.com","",{book:false,newsletter:true});
  assert.equal(gate.take(first.id,"old-token"),null);
  assert.equal(gate.take(second.id,"new-token")!.book,false);
  assert.equal(subscriptionReceipt({book:true,newsletter:false}),bookCopy.success);
  assert.equal(subscriptionReceipt({book:false,newsletter:true}),bookCopy.success);
});
