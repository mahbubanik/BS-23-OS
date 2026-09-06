import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildResearchBrief, mergeResearchResults } from '../tools/research-company.mjs';

describe('Company research tool', () => {
  it('throws when company name is missing', () => {
    assert.throws(() => buildResearchBrief(null), /Company name is required/);
  });

  it('generates research brief with targeted queries', () => {
    const brief = buildResearchBrief('Petromax', 'https://petromax.com');
    assert.equal(brief.company, 'Petromax');
    assert.equal(brief.website, 'https://petromax.com');
    assert.ok(brief.searchQueries.length >= 3, 'should generate targeted search queries');
    assert.ok(brief.remainingUnknowns.includes('ERP/system'), 'ERP should be an unknown');
  });

  it('merges new evidence and tracks remaining unknowns', () => {
    const brief = buildResearchBrief('Petromax', 'https://petromax.com');
    const newEvidence = [
      {
        claim: 'Retail distribution industry leader in energy and consumer equipment',
        classification: 'FACT',
        url: 'https://petromax.com/about'
      },
      {
        claim: 'Headquartered in Germany with operations in Europe',
        classification: 'FACT',
        url: 'https://petromax.com/contact'
      }
    ];
    const merged = mergeResearchResults(brief, newEvidence);
    assert.equal(merged.company, 'Petromax');
    assert.ok(merged.industry.includes('Retail distribution'));
    assert.ok(merged.geography.includes('Germany'));
    assert.equal(merged.evidence.length, 2);
  });
});

console.log('# Company research checks passed.');
