import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractDeterministicMeetingInsights } from '../tools/analyze-meeting-notes.mjs';
import { evaluateDeal } from '../tools/evaluate-deal.mjs';
import { buildMorningPlan, parseActivityNote, buildEndOfDaySummary } from '../tools/daily-operator.mjs';

describe('Workflow Tools: Meeting Notes Analyzer', () => {
  it('extracts pains, requirements, and next actions from text', () => {
    const notes = `
      Met with CFO and Head of IT at Retailer X.
      Current problem is stock mismatch and inventory sync between Shopify and their legacy SAP.
      Need Odoo inventory and POS modules.
      Next action is to send proposal by next week.
    `;
    const res = extractDeterministicMeetingInsights(notes);
    assert.equal(res.agent_id, 'meeting_copilot');
    assert.ok(res.pains.length > 0);
    assert.ok(res.requirements.length > 0);
    assert.ok(res.stakeholders.length > 0);
    assert.ok(res.nextActions.length > 0);
    assert.ok(res.detectedSystems.includes('Current problem is stock mismatch and inventory sync between Shopify and their legacy SAP.'));
  });
});

describe('Workflow Tools: Deal Evaluator', () => {
  it('computes health score and identifies critical unknowns', () => {
    const opp = {
      name: 'Retail Group ERP Upgrade',
      pain: 'Inventory reconciliation delay',
      stage: 'Discovery'
    };
    const res = evaluateDeal(opp);
    assert.equal(res.agent_id, 'deal_strategist');
    assert.ok(res.unknowns.includes('Economic buyer / final signing authority'));
    assert.ok(res.nextBestAction.action.includes('economic buyer'));
  });

  it('awards higher score when decision maker and budget are known', () => {
    const opp = {
      name: 'Logistics Co Modernization',
      pain: 'Manual dispatch bottleneck',
      champion: 'IT Lead',
      decisionMaker: 'Managing Director',
      budgetRange: '$30k-$50k',
      timeline: 'Q4 2026',
      currentSystem: 'Sage ERP'
    };
    const res = evaluateDeal(opp);
    assert.equal(res.healthScore, 100);
    assert.ok(res.nextBestAction.action.includes('Odoo solution proposal'));
  });
});

describe('Workflow Tools: Daily Operator', () => {
  it('prioritizes overdue follow-ups and meetings in morning plan', () => {
    const plan = buildMorningPlan({
      meetings: [{ subject: 'Petromax Demo', time: '14:00' }],
      overdueFollowUps: [{ company: 'Capax Group', action: 'Send case study' }]
    });
    assert.equal(plan.priorities[0].tier, 'P0 - OVERDUE');
    assert.equal(plan.priorities[1].tier, 'P1 - MEETING');
  });

  it('parses natural language activity note into structured record', () => {
    const activity = parseActivityNote('Called Petromax CFO. 45 min discussion regarding inventory.');
    assert.equal(activity.type, 'Call');
    assert.equal(activity.durationMinutes, 45);
    assert.equal(activity.readyForSync, true);
  });

  it('builds end-of-day summary correctly', () => {
    const eod = buildEndOfDaySummary({
      completedActivities: [1, 2, 3],
      pendingTasks: [{ name: 'Send proposal' }],
      wins: ['Petromax requested demo']
    });
    assert.equal(eod.stats.activitiesCount, 3);
    assert.equal(eod.stats.winsCount, 1);
    assert.ok(eod.tomorrowPriorities[0].includes('Send proposal'));
  });
});

console.log('# Workflow tools checks passed.');
