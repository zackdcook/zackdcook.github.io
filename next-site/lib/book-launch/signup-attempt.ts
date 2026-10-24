import { normalizeEmail, subscriptionChoices, type SubscriptionChoices } from "./shared";

export type SignupAttempt = { id: number; email: string; website: string } & SubscriptionChoices;

/** One form's ephemeral intent. Never stored, logged, or shared between visitors. */
export function createSignupAttemptGate() {
  let serial = 0, current: SignupAttempt | null = null;
  return {
    begin(email: unknown, website: unknown, choices: SubscriptionChoices = { book: true, newsletter: false }): SignupAttempt {
      current = null;
      const normalized = normalizeEmail(email);
      if (typeof website !== "string" || website !== "") throw new Error("validation");
      current = { id: ++serial, email: normalized, website, ...subscriptionChoices(choices.book, choices.newsletter) };
      return current;
    },
    cancel() { current = null; },
    take(id: number, token: string) {
      if (!current || current.id !== id || !token || token.length > 2048) return null;
      const attempt = current;
      current = null;
      return { ...attempt, token };
    },
  };
}
