/* Converts a user-selected Outlook event into a minimal, safe agent input. Never pass raw connector output to an agent. */
import fs from 'node:fs/promises';

export function safeMeetingContext(event) {
  if (!event?.subject || !event?.start?.dateTime || !event?.end?.dateTime) throw new Error('A selected event needs subject, start date/time, and end date/time.');
  if (event.is_cancelled) throw new Error('Cancelled events cannot be prepared.');
  return {
    entity_type: 'meeting',
    source: 'outlook-calendar-user-selected',
    subject: String(event.subject).slice(0, 240),
    starts_at: event.start.dateTime,
    ends_at: event.end.dateTime,
    location_label: event.location?.displayName ? String(event.location.displayName).slice(0, 120) : null,
    attendee_count: Array.isArray(event.attendees) ? event.attendees.length : 0,
    excluded: ['event ID', 'event body', 'body preview', 'meeting link', 'passcode', 'attendee names', 'attendee emails', 'organizer identity']
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node tools/prepare-meeting-context.mjs path/to/user-selected-outlook-event.json');
  const event = JSON.parse(await fs.readFile(input, 'utf8'));
  console.log(JSON.stringify(safeMeetingContext(event), null, 2));
}
