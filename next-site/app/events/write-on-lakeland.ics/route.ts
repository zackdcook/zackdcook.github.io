import { writingGroupCalendar } from "@/lib/calendar";


export function GET() {
  return new Response(writingGroupCalendar(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="write-on-lakeland.ics"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
