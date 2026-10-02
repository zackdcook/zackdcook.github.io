import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { events } from "@/content/site";

export async function getUpcomingEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  const now = new Date();
  return events.filter(event => new Date(event.ends) >= now).sort((a, b) => +new Date(a.starts) - +new Date(b.starts));
}
