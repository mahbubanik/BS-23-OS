/* Builds a segment-specific GTM strategy using BS23's actual Odoo client experience.
   Produces: target profile, messaging framework, proof points, discovery questions, and approach. */
import fs from 'node:fs/promises';

export function buildSegmentGTM(segment, knowledge, companyKnowledge) {
  if (!segment) throw new Error('Segment is required (e.g. "banking", "distribution", "manufacturing", "retail").');
  const segmentLower = segment.toLowerCase();
  // Find matching clients by industry
  const matchingClients = (knowledge?.odooClients || []).filter(c => {
    const haystack = [c.industry, c.solution, c.complexity].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(segmentLower);
  });
  // Find matching industry group
  const industryGroups = knowledge?.industryExperience || {};
  const matchedGroup = Object.entries(industryGroups).find(([key]) => key.toLowerCase().includes(segmentLower));
  // Find complexity patterns relevant to this segment
  const relevantComplexity = Object.entries(knowledge?.complexityPatterns || {}).filter(([, clients]) =>
    clients.some(c => matchingClients.some(mc => c.includes(mc.client)))
  );
  // Collect all modules used in this segment
  const moduleFrequency = {};
  for (const client of matchingClients) {
    for (const mod of client.modules || []) { moduleFrequency[mod] = (moduleFrequency[mod] || 0) + 1; }
  }
  const topModules = Object.entries(moduleFrequency).sort((a, b) => b[1] - a[1]).map(([mod, count]) => ({ module: mod, usedBy: count }));
  // Build positioning from safe claims
  const positioning = knowledge?.safePositioning || [];
  const credibility = (companyKnowledge?.credibilityStack || []).filter(c => !c.caveat?.includes('unconfirmed')).slice(0, 4).map(c => c.claim);
  return {
    agent_id: 'account_intelligence',
    entity_type: 'segment_gtm',
    segment,
    clientEvidence: {
      matchingClients: matchingClients.map(c => ({ client: c.client, industry: c.industry, geography: c.geography, solution: c.solution, complexity: c.complexity, outcome: c.outcome })),
      clientCount: matchingClients.length,
      matchedIndustryGroup: matchedGroup ? { group: matchedGroup[0], clients: matchedGroup[1] } : null
    },
    targetProfile: {
      industries: [...new Set(matchingClients.map(c => c.industry).filter(Boolean))],
      geographies: [...new Set(matchingClients.map(c => c.geography).filter(Boolean))],
      topModules,
      complexityPatterns: relevantComplexity.map(([pattern, clients]) => ({ pattern, clients }))
    },
    messagingFramework: {
      positioning,
      credibilityStack: credibility,
      proofPoints: matchingClients.filter(c => c.outcome).map(c => `${c.client}: ${c.outcome}`),
      leadWith: matchingClients.length > 0
        ? `Lead with ${matchingClients[0].client} as the named proof point for ${segment}.`
        : `No direct ${segment} proof point exists. Lead with adjacent industry experience or general BS23 positioning.`,
      doNotClaim: knowledge?.doNotClaimWithoutCurrentVerification || []
    },
    discoveryQuestions: [
      `What system are you currently using for ${segment}-specific workflows?`,
      'Where do your teams spend the most time on manual work or workarounds?',
      'Have you evaluated replacing or upgrading your current system recently?',
      'What triggered your interest in looking at this now?',
      'Who else would be involved in evaluating a solution like this?'
    ],
    recommendedApproach: matchingClients.length >= 3
      ? `Strong evidence base (${matchingClients.length} clients). Lead with proof, not features.`
      : matchingClients.length > 0
        ? `Limited evidence (${matchingClients.length} client(s)). Lead with the named example and supplement with adjacent industry experience.`
        : `No direct evidence for ${segment}. Use general BS23 capabilities and ERP23 methodology. Consider whether this segment is worth pursuing.`,
    recommended_actions: [
      matchingClients.length > 0 ? `Build a target company list matching the ${segment} profile.` : `Research whether ${segment} is a viable target segment for ERP23.`,
      'Define 6-month pipeline targets for this segment.',
      'Create segment-specific outreach sequence (cold email + LinkedIn + follow-up).',
      'Track conversion metrics separately for this segment.'
    ]
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const segment = process.argv[2];
  if (!segment) throw new Error('Usage: node tools/build-segment-gtm.mjs "banking"');
  const knowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-erp-knowledge.json', import.meta.url), 'utf8'));
  const companyKnowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-company-knowledge.json', import.meta.url), 'utf8'));
  console.log(JSON.stringify(buildSegmentGTM(segment, knowledge, companyKnowledge), null, 2));
}
