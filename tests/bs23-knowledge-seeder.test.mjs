import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildKnowledgeSeeds } from '../integrations/seed-bs23-knowledge.mjs';
import { buildOdooClientSeeds } from '../integrations/seed-bs23-knowledge.mjs';
import fs from 'node:fs';

const company = JSON.parse(fs.readFileSync(new URL('../config/bs23-company-knowledge.json', import.meta.url)));
const knowledge = JSON.parse(fs.readFileSync(new URL('../config/bs23-erp-knowledge.json', import.meta.url)));

describe('BS23 knowledge seeder', () => {
  it('builds company knowledge seeds', () => {
    const seeds = buildKnowledgeSeeds(company);
    assert.ok(seeds.length >= 7, 'should produce at least 7 knowledge seeds (identity, credibility, SBUs, 3 engagement models, ERP23 practice, voice, case study formats)');
    for (const seed of seeds) {
      assert.ok(seed.title, 'each seed must have a title');
      assert.ok(seed.summary, 'each seed must have a summary');
      assert.ok(seed.summary.includes('Internal only'), 'each seed must carry the internal-use boundary');
      assert.ok(seed.type, 'each seed must have a type');
      assert.ok(Array.isArray(seed.tags) && seed.tags.length > 0, 'each seed must have tags');
    }
  });

  it('builds Odoo client seeds from expanded knowledge', () => {
    const seeds = buildOdooClientSeeds(knowledge);
    assert.ok(seeds.length >= 25, `should produce at least 25 client seeds (got ${seeds.length})`);
    for (const seed of seeds) {
      assert.ok(seed.title.includes('Odoo client summary'), 'each client seed title should contain "Odoo client summary"');
      assert.ok(seed.summary.includes('Internal only'), 'each client seed must carry the internal-use boundary');
      assert.ok(seed.tags.includes('odoo-client'), 'each client seed must be tagged odoo-client');
    }
  });

  it('excludes clients with no solution data', () => {
    const seeds = buildOdooClientSeeds(knowledge);
    const titles = seeds.map(s => s.title);
    assert.ok(!titles.some(t => t.includes('Ispahani Group —') && !t.includes('Ispahani Tea')), 'Ispahani Group (no solution data) should be excluded');
  });

  it('includes key proof clients', () => {
    const seeds = buildOdooClientSeeds(knowledge);
    const titles = seeds.map(s => s.title);
    assert.ok(titles.some(t => t.includes('Ispahani Tea')), 'must include Ispahani Tea');
    assert.ok(titles.some(t => t.includes('Nath')), 'must include Nath (SAP migration)');
    assert.ok(titles.some(t => t.includes('Metal Packaging')), 'must include Metal Packaging (MRA integration)');
    assert.ok(titles.some(t => t.includes('MSI Americas')), 'must include MSI Americas (multi-country)');
  });

  it('categorizes manufacturing clients correctly', () => {
    const seeds = buildOdooClientSeeds(knowledge);
    const tanin = seeds.find(s => s.title.includes('Tanin'));
    assert.ok(tanin, 'Tanin Group should exist');
    assert.equal(tanin.type, 'Integration', 'manufacturing clients should be typed as Integration');
  });
});

console.log('# BS23 knowledge seeder checks passed.');
