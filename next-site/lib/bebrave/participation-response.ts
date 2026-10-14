export function participationResponse(result: Record<string, unknown>): Response | null {
  if (!result.error) return null;
  if (result.error === "finished") return Response.json({
    error: "This carving has finished. Return to the tree to continue.",
  }, { status: 409, headers: { "Cache-Control": "no-store" } });
  const retry = Math.max(1, Math.ceil(Number(result.retry_seconds) || 600));
  const headers = { "Cache-Control": "no-store", "Retry-After": String(retry) };
  if (result.error === "growth") return Response.json({
    error: "growth", growthFeetRemaining: Number(result.growth_feet_remaining),
  }, { status: 429, headers });
  if (result.error === "network_growth") return Response.json({
    error: `This connection has used its carving opportunities. Let the tree grow another ${Number(result.growth_feet_remaining) || 5} ${Number(result.growth_feet_remaining) === 1 ? "foot" : "feet"} before trying again.`,
    category: "participation_limit",
  }, { status: 429, headers });
  return Response.json({
    error: "There have been too many carving attempts from this connection. Please try again later.",
    category: "participation_limit",
  }, { status: 429, headers });
}
