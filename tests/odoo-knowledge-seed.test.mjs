import assert from 'node:assert/strict';
import { buildSeeds } from '../integrations/seed-bs23-odoo-knowledge.mjs';

const seeds = buildSeeds({
  safePositioning: ['ERP23 is the Odoo practice.'],
  approvedProof: [{ client: 'Example Client', statement: 'Internal proof.', use: 'Confirm approval.', source: 'clients/example.md' }]
});
assert.equal(seeds.length, 2);
assert.equal(seeds[0].type, 'Workflow');
assert.equal(seeds[1].type, 'Workflow');
assert.equal(seeds.every(seed => seed.summary.includes('Internal only.')), true);
assert.equal(seeds.some(seed => seed.summary.includes('C:/Users/')), false);
console.log('Odoo knowledge seed checks passed.');
