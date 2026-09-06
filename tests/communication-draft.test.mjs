import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildCommunicationDraft, findRelevantProof, findRelevantComplexity } from '../tools/build-communication-draft.mjs';
import fs from 'node:fs';

const knowledge = JSON.parse(fs.readFileSync(new URL('../config/bs23-erp-knowledge.json', import.meta.url)));
const companyKnowledge = JSON.parse(fs.readFileSync(new URL('../config/bs23-company-knowledge.json', import.meta.url)));

describe('Communication draft builder', () => {
  it('throws without intent', () => {
    assert.throws(() => buildCommunicationDraft(null, {}, knowledge, companyKnowledge), /Intent is required/);
  });

  it('finds relevant proof by industry', () => {
    const proofs = findRelevantProof(knowledge, { industry: 'logistics' });
    assert.ok(proofs.length > 0, 'should find logistics clients');
    assert.ok(proofs.some(p => /logistics/i.test(p.industry)), 'should match logistics industry');
  });

  it('finds relevant proof by geography', () => {
    const proofs = findRelevantProof(knowledge, { geography: 'Mauritius' });
    assert.ok(proofs.length >= 2, 'should find multiple Mauritius clients');
  });

  it('finds SAP migration complexity', () => {
    const matches = findRelevantComplexity(knowledge, 'sap migration');
    assert.ok(matches.length > 0, 'should find SAP migration pattern');
    assert.ok(matches[0].clients.includes('Nath'), 'Nath should be in SAP migration clients');
  });

  it('builds a cold-email draft with relevant grounding', () => {
    const draft = buildCommunicationDraft('cold-email', { industry: 'retail', problem: 'SAP migration' }, knowledge, companyKnowledge);
    assert.equal(draft.agent_id, 'communication');
    assert.equal(draft.intent, 'cold-email');
    assert.ok(draft.grounding.relevantProof.length > 0, 'should include relevant proof points');
    assert.ok(draft.grounding.credibilityStack.length >= 3, 'should deploy 3+ credibility claims');
    assert.ok(draft.guardrails.length > 0, 'should include verification flags');
    assert.ok(draft.voiceGuidance.proofFirst, 'should include proof-first guidance');
  });

  it('applies formal register for proposal intent', () => {
    const draft = buildCommunicationDraft('proposal', {}, knowledge, companyKnowledge);
    assert.equal(draft.register, 'formal');
    assert.ok(draft.voiceGuidance.standardIntro, 'formal register should include standard intro');
    assert.ok(draft.voiceGuidance.standardClosing, 'formal register should include standard closing');
  });

  it('returns fallback when no proof matches', () => {
    const draft = buildCommunicationDraft('cold-email', { industry: 'space exploration' }, knowledge, companyKnowledge);
    assert.ok(draft.recommended_actions.some(a => /general BS23 positioning/i.test(a) || /lead proof/i.test(a)));
  });
});

console.log('# Communication draft builder checks passed.');
