import assert from 'node:assert/strict';
import { buildQueue } from '../tools/build-campaign-research-queue.mjs';

const queue = buildQueue({ source: 'fixture', accounts: [
  { importKey: '1', company: 'No site', website: '', country: 'UK', erpStatus: 'Unknown', campaignContext: { priority: '2', segment: 'A' } },
  { importKey: '2', company: 'Known ERP', website: 'https://b.test', country: 'UK', erpStatus: 'Reported in legacy campaign research: ERP', campaignContext: { priority: '2', segment: 'A' } },
  { importKey: '3', company: 'Lower priority', website: 'https://c.test', country: 'UK', erpStatus: 'Unknown', campaignContext: { priority: '3', segment: 'B' } }
] }, 2);
assert.equal(queue.items.length, 2);
assert.equal(queue.items[0].company, 'Known ERP');
assert.equal(queue.items[1].company, 'No site');
assert.equal('email' in queue.items[0], false);
console.log('Campaign research-queue checks passed.');
