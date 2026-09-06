import assert from 'node:assert/strict';
import { buildMeetingPrep } from '../tools/build-meeting-prep-draft.mjs';

const draft = buildMeetingPrep(
  { subject: 'Discovery', start: { dateTime: '2026-09-08T10:00:00Z' }, end: { dateTime: '2026-09-08T10:30:00Z' }, attendees: [{ emailAddress: { address: 'hidden@example.com' } }], id: 'hidden-id', body: { content: 'hidden body' } },
  { company: 'Example Distribution', website: 'https://example.test', operationalComplexity: 'cross-border wholesale', unknowns: ['ERP/system'], evidence: [{ classification: 'FACT', claim: 'Publishes a wholesale catalogue.' }] }
);
assert.equal(draft.agent_id, 'meeting_copilot');
assert.equal(draft.facts[0], 'Publishes a wholesale catalogue.');
assert.equal(draft.inferences.length, 1);
assert.equal(JSON.stringify(draft).includes('hidden@example.com'), false);
assert.equal(JSON.stringify(draft).includes('hidden-id'), false);
console.log('Meeting prep draft checks passed.');
