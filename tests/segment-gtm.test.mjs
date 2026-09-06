import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSegmentGTM } from '../tools/build-segment-gtm.mjs';
import fs from 'node:fs';

const knowledge = JSON.parse(fs.readFileSync(new URL('../config/bs23-erp-knowledge.json', import.meta.url)));
const companyKnowledge = JSON.parse(fs.readFileSync(new URL('../config/bs23-company-knowledge.json', import.meta.url)));

describe('Segment GTM builder', () => {
  it('throws without segment argument', () => {
    assert.throws(() => buildSegmentGTM(null, knowledge, companyKnowledge), /Segment is required/);
  });

  it('builds a complete GTM plan for banking / finance', () => {
    const gtm = buildSegmentGTM('financial', knowledge, companyKnowledge);
    assert.equal(gtm.agent_id, 'account_intelligence');
    assert.equal(gtm.entity_type, 'segment_gtm');
    assert.ok(gtm.clientEvidence.matchingClients.length > 0, 'should match finance clients');
    assert.ok(gtm.messagingFramework.leadWith, 'should have leadWith recommendation');
    assert.ok(gtm.discoveryQuestions.length >= 4, 'should provide discovery questions');
    assert.ok(gtm.recommended_actions.length > 0, 'should have recommended actions');
  });

  it('builds a GTM plan for retail with top modules', () => {
    const gtm = buildSegmentGTM('retail', knowledge, companyKnowledge);
    assert.ok(gtm.clientEvidence.clientCount >= 2, 'retail should have multiple clients');
    assert.ok(gtm.targetProfile.industries.length > 0);
  });

  it('handles unknown segments gracefully', () => {
    const gtm = buildSegmentGTM('aerospace', knowledge, companyKnowledge);
    assert.equal(gtm.clientEvidence.clientCount, 0);
    assert.ok(gtm.recommendedApproach.includes('No direct evidence'));
  });
});

console.log('# Segment GTM checks passed.');
