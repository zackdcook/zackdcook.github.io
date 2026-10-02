export function turnstileAccepted(value: unknown, hostname: string, action: string) {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return data.success === true && data.hostname === hostname && data.action === action;
}

export async function verifyTurnstile(token: string, hostname: string, action: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token || token.length > 2048) throw new Error("Please complete the quick human check.");
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(7000), cache: "no-store",
    });
    if (!response.ok || !turnstileAccepted(await response.json(), hostname, action)) throw new Error("Challenge rejected");
  } catch { throw new Error("The human check expired or couldn’t finish. Please try again."); }
}
