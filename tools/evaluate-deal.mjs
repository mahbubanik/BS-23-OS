/* Evaluates opportunity health and recommends Next Best Action.
   Deterministic-first deal evaluation following the Sales OS contract. */
import fs from 'node:fs/promises';

export function evaluateDeal(opportunity) {
  if (!opportunity || !opportunity.name) {
    throw new Error('Opportunity must include at least a name.');
  }

  const knowns = [];
  const unknowns = [];
  const risks = [];
  let healthScore = 100;

  if (opportunity.pain) {
    knowns.push(`Identified pain: ${opportunity.pain}`);
  } else {
    unknowns.push('Specific operational pain or problem statement');
    healthScore -= 20;
    risks.push('No confirmed business pain; deal is at high risk of stalling.');
  }

  if (opportunity.champion) {
    knowns.push(`Internal champion: ${opportunity.champion}`);
  } else {
    unknowns.push('Internal champion identified');
    healthScore -= 15;
  }

  if (opportunity.decisionMaker) {
    knowns.push(`Economic buyer / Decision maker: ${opportunity.decisionMaker}`);
  } else {
    unknowns.push('Economic buyer / final signing authority');
    healthScore -= 25;
    risks.push('Decision maker unengaged or unconfirmed.');
  }

  if (opportunity.closeTarget || opportunity.timeline) {
    knowns.push(`Target timeline: ${opportunity.closeTarget || opportunity.timeline}`);
  } else {
    unknowns.push('Compelling event or target go-live date');
    healthScore -= 15;
  }

  if (opportunity.currentSystem) {
    knowns.push(`Incumbent system: ${opportunity.currentSystem}`);
  } else {
    unknowns.push('Incumbent software / ERP architecture');
    healthScore -= 10;
  }

  if (opportunity.budgetRange) {
    knowns.push(`Budget range: ${opportunity.budgetRange}`);
  } else {
    unknowns.push('Approved budget range');
    healthScore -= 15;
  }

  let nextBestAction = '';
  let reason = '';

  if (unknowns.includes('Economic buyer / final signing authority')) {
    nextBestAction = 'Confirm decision process and schedule a briefing with the economic buyer before drafting a proposal.';
    reason = 'Technical discovery without decision-maker alignment leads to stalled deals.';
  } else if (unknowns.includes('Specific operational pain or problem statement')) {
    nextBestAction = 'Conduct a workflow discovery call focusing on daily friction in inventory or accounting.';
    reason = 'Prospect will not approve budget without quantified operational pain.';
  } else if (unknowns.includes('Compelling event or target go-live date')) {
    nextBestAction = 'Ask what happens if this system is not live by the target quarter.';
    reason = 'Establishes urgency and tests whether the deal is a priority or exploratory.';
  } else {
    nextBestAction = 'Deliver tailored Odoo solution proposal highlighting phased implementation and named reference client.';
    reason = 'Deal qualifications are met; advance to proposal milestone.';
  }

  return {
    agent_id: 'deal_strategist',
    entity_type: 'opportunity',
    entity_id: opportunity.id || null,
    opportunityName: opportunity.name,
    healthScore: Math.max(0, healthScore),
    stage: opportunity.stage || 'Discovery',
    facts: knowns,
    inferences: risks,
    unknowns,
    nextBestAction: {
      action: nextBestAction,
      reason
    },
    recommended_actions: [nextBestAction]
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node tools/evaluate-deal.mjs opportunity.json');
    process.exit(1);
  }
  const opp = JSON.parse(await fs.readFile(file, 'utf8'));
  console.log(JSON.stringify(evaluateDeal(opp), null, 2));
}
