import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(new URL('../config/icp-scoring.json', import.meta.url)));
const bs23Preset = JSON.parse(fs.readFileSync(new URL('../config/bs23-campaign-icp.json', import.meta.url)));
assert.equal(config.criteria.reduce((n, c) => n + c.max, 0), 100, 'weights must total 100');
assert.deepEqual(config.criteria.map(c => c.id), ['industry', 'geography', 'employeeRange', 'businessModel', 'operationalComplexity', 'painSignals', 'technology', 'expansionSignals', 'evidence'], 'app criteria IDs must remain stable');
assert.equal(config.thresholds.qualified, 65);
assert.equal(config.thresholds.review, 40);
assert.match(bs23Preset.industries, /fragrance/);
assert.match(bs23Preset.businessModels, /wholesale/);

function evidenceScore(evidence, max = 5) { const facts = evidence.filter(e => e.classification === 'FACT' && e.url); const high = facts.filter(e => e.confidence === 'high').length; return facts.length >= 3 && high >= 1 ? max : facts.length >= 2 ? Math.round(max * .8) : facts.length ? Math.round(max * .4) : 0; }
assert.equal(evidenceScore([]), 0, 'missing information cannot score evidence points');
assert.equal(evidenceScore([{ classification: 'INFERENCE', url: 'https://x.test' }]), 0, 'inference cannot score as fact');
assert.equal(evidenceScore([{ classification: 'FACT', url: 'https://x.test', confidence: 'medium' }]), 2, 'one sourced fact scores 2');
assert.equal(evidenceScore([{ classification: 'FACT', url: 'https://x.test', confidence: 'medium' }], 10), 4, 'evidence scales with the configured weight');
assert.equal(evidenceScore([{ classification: 'FACT', url: 'https://a.test', confidence: 'high' }, { classification: 'FACT', url: 'https://b.test', confidence: 'medium' }, { classification: 'FACT', url: 'https://c.test', confidence: 'low' }]), 5, 'three facts including high confidence score 5');

const strongFit = 15 + 10 + 10 + 10 + 15 + 15 + 10 + 10 + 5;
const weakFit = 15 + 10 + 2;
assert.ok(strongFit >= config.thresholds.qualified, 'strong Odoo fit qualifies');
assert.ok(weakFit < config.thresholds.review, 'bad search result stays unqualified');
console.log('ICP scenario checks passed.');
