import { writingGroup } from "@/content/site";

export const writingGroupCalendarPath = "/events/write-on-lakeland.ics";
const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// Use the meeting's local date, even when the visitor or server is elsewhere.
export function nextWritingGroupDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: writingGroup.calendar.timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value);
  const date = new Date(Date.UTC(value("year"), value("month") - 1, value("day")));
  const [hour, minute] = writingGroup.calendar.startTime.split(":").map(Number);
  let days = (writingGroup.calendar.weekday - date.getUTCDay() + 7) % 7;
  if (days === 0 && value("hour") * 60 + value("minute") >= hour * 60 + minute) days = 7;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export function googleWritingGroupUrl(now = new Date()) {
  const date = nextWritingGroupDate(now);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: writingGroup.title,
    dates: `${date}T${writingGroup.calendar.startTime.replace(":", "")}00/${date}T${writingGroup.calendar.endTime.replace(":", "")}00`,
    ctz: writingGroup.calendar.timeZone,
    details: writingGroup.calendar.description,
    location: `${writingGroup.venue}, ${writingGroup.address}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${weekdays[writingGroup.calendar.weekday]}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function calendarText(value: string) {
  return value.replaceAll("\\", "\\\\").replace(/\r?\n/g, "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function foldLine(value: string) {
  const encoder = new TextEncoder();
  let line = "";
  let length = 0;
  const lines: string[] = [];
  for (const character of value) {
    const bytes = encoder.encode(character).length;
    if (length + bytes > 75) {
      lines.push(line);
      line = " ";
      length = 1;
    }
    line += character;
    length += bytes;
  }
  lines.push(line);
  return lines.join("\r\n");
}

export function writingGroupCalendar(now = new Date()) {
  const date = nextWritingGroupDate(now);
  const stamp = now.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
  const { timeZone, startTime, endTime, description, weekday } = writingGroup.calendar;
  // Explicit daylight/standard rules keep each meeting at 4–6 p.m. Eastern.
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Zack Cook//Write On Lakeland//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", `TZID:${timeZone}`, `X-LIC-LOCATION:${timeZone}`,
    "BEGIN:DAYLIGHT", "DTSTART:20070311T020000", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400",
    "TZNAME:EDT", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "DTSTART:20071104T020000", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500",
    "TZNAME:EST", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD", "END:VTIMEZONE",
    "BEGIN:VEVENT", "UID:write-on-lakeland@zackdcook.com", `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${timeZone}:${date}T${startTime.replace(":", "")}00`,
    `DTEND;TZID=${timeZone}:${date}T${endTime.replace(":", "")}00`,
    `RRULE:FREQ=WEEKLY;BYDAY=${weekdays[weekday]}`,
    `SUMMARY:${calendarText(writingGroup.title)}`,
    `DESCRIPTION:${calendarText(description)}`,
    `LOCATION:${calendarText(`${writingGroup.venue}, ${writingGroup.address}`)}`,
    "URL:https://zackdcook.com/events", "STATUS:CONFIRMED", "TRANSP:TRANSPARENT",
    "END:VEVENT", "END:VCALENDAR", "",
  ].map(foldLine).join("\r\n");
}
