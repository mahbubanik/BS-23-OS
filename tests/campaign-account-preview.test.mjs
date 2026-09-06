import assert from 'node:assert/strict';
import { buildPreview } from '../tools/build-campaign-account-preview.mjs';

const preview = buildPreview([
  { company: 'Acme GmbH', website: 'https://www.acme.test/', country: 'Germany', erp: 'Legacy ERP', segment: 'Primary - ERP Gap', priority: 1, email: 'person@acme.test', first_name: 'Person', research_note: 'Private note' },
  { company: 'ACME GmbH', website: 'https://acme.test', country: 'Germany', segment: 'Primary - ERP Gap' },
  { company: 'Beta Ltd', country: 'UK', segment: 'Primary - No ERP', phone: '+44 1' },
  { company: '', country: 'UK' }
]);
assert.equal(preview.uniqueAccountCandidates, 2);
assert.equal(preview.duplicateCandidates, 1);
assert.equal(preview.skipped.length, 1);
assert.equal('email' in preview.accounts[0], false);
assert.equal('first_name' in preview.accounts[0], false);
assert.equal(preview.accounts[0].evidence[0].classification, 'INFERENCE');
assert.match(preview.accounts[0].evidence[0].claim, /Verify this/);
console.log('Campaign account-preview checks passed.');
