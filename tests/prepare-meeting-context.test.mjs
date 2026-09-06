import assert from 'node:assert/strict';
import { safeMeetingContext } from '../tools/prepare-meeting-context.mjs';

const context = safeMeetingContext({
  id: 'secret-event-id', subject: 'Discovery call — Acme', start: { dateTime: '2026-09-07T10:00:00Z' }, end: { dateTime: '2026-09-07T10:30:00Z' },
  body: { content: 'Private notes and link' }, attendees: [{ emailAddress: { address: 'person@example.com' } }], organizer: { emailAddress: { address: 'owner@example.com' } },
  location: { displayName: 'Microsoft Teams Meeting' }
});
assert.equal(context.subject, 'Discovery call — Acme');
assert.equal(context.attendee_count, 1);
assert.equal(JSON.stringify(context).includes('person@example.com'), false);
assert.equal(JSON.stringify(context).includes('secret-event-id'), false);
assert.throws(() => safeMeetingContext({ subject: 'Cancelled', start: { dateTime: '2026-09-07T10:00:00Z' }, end: { dateTime: '2026-09-07T10:30:00Z' }, is_cancelled: true }), /Cancelled/);
console.log('Meeting context minimization checks passed.');
