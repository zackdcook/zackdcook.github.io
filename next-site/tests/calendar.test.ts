import assert from "node:assert/strict";
import { test } from "node:test";
import { googleWritingGroupUrl, nextWritingGroupDate, writingGroupCalendar } from "../lib/calendar";
import { GET } from "../app/events/write-on-lakeland.ics/route";

test("calendar starts on the next Thursday in Lakeland, across daylight-saving changes", () => {
  const cases = [
    ["2026-10-04T15:00:00Z", "20261008"],
    ["2026-10-08T19:59:00Z", "20261008"],
    ["2026-10-08T20:00:00Z", "20261015"],
    ["2026-10-09T02:00:00Z", "20261015"],
    ["2026-11-05T20:59:00Z", "20261105"],
    ["2026-11-05T21:00:00Z", "20261112"],
    ["2026-12-31T22:00:00Z", "20270107"],
  ];
  for (const [now, date] of cases) assert.equal(nextWritingGroupDate(new Date(now)), date);
});

test("calendar file carries the full weekly 4–6 p.m. Eastern series and requested details", () => {
  const ics = writingGroupCalendar(new Date("2026-10-02T11:31:00Z"));
  const unfolded = ics.replace(/\r\n[ \t]/g, "");
  assert.match(unfolded, /DTSTART;TZID=America\/New_York:20261008T160000/);
  assert.match(unfolded, /DTEND;TZID=America\/New_York:20261008T180000/);
  assert.match(unfolded, /RRULE:FREQ=WEEKLY;BYDAY=TH/);
  assert.match(unfolded, /SUMMARY:Write On\\, Lakeland!/);
  assert.match(unfolded, /DESCRIPTION:Creative writing group\. Come as you are\./);
  assert.match(unfolded, /LOCATION:Pressed Books & Coffee\\, 213 E Bay St\.\\, Lakeland\\, FL 33801/);
  assert.match(unfolded, /BEGIN:VTIMEZONE/);
  assert.match(unfolded, /TZOFFSETTO:-0400/);
  assert.match(unfolded, /TZOFFSETTO:-0500/);
  for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
});

test("Google Calendar receives the same title, recurrence, time zone, and description", () => {
  const params = new URL(googleWritingGroupUrl(new Date("2026-10-02T11:31:00Z"))).searchParams;
  assert.equal(params.get("text"), "Write On, Lakeland!");
  assert.equal(params.get("dates"), "20261008T160000/20261008T180000");
  assert.equal(params.get("ctz"), "America/New_York");
  assert.equal(params.get("recur"), "RRULE:FREQ=WEEKLY;BYDAY=TH");
  assert.equal(params.get("details"), "Creative writing group. Come as you are.");
});

test("calendar download is served as an event file without storing visitor data", async () => {
  const response = GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "text/calendar; charset=utf-8");
  assert.match(response.headers.get("Content-Disposition") ?? "", /write-on-lakeland\.ics/);
  assert.match(await response.text(), /^BEGIN:VCALENDAR\r\n/);
});
