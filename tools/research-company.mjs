/* On-demand company research tool. Takes a company name/URL and produces a structured profile
   following the evidence model (FACT/INFERENCE/UNKNOWN). Works for any company, any time. */
import fs from 'node:fs/promises';

export function buildResearchBrief(companyName, website, existingEvidence = []) {
  if (!companyName) throw new Error('Company name is required.');
  const unknowns = ['ERP/system', 'employee size', 'operational complexity', 'pain signals', 'decision maker', 'buying trigger'];
  const knownFields = new Set();
  for (const e of existingEvidence) {
    if (e.classification === 'FACT') {
      for (const field of unknowns) { if (e.claim?.toLowerCase().includes(field.toLowerCase())) knownFields.add(field); }
    }
  }
  const remainingUnknowns = unknowns.filter(u => !knownFields.has(u));
  return {
    agent_id: 'account_intelligence',
    entity_type: 'research_brief',
    entity_id: null,
    company: companyName,
    website: website || null,
    researchObjective: `Find publicly available information about ${companyName}. For each finding, classify as FACT (with source URL), INFERENCE (reasoned from facts), or UNKNOWN.`,
    searchQueries: [
      website ? `site:${new URL(website.startsWith('http') ? website : `https://${website}`).hostname}` : `"${companyName}" company`,
      `"${companyName}" ERP OR software OR system`,
      `"${companyName}" hiring OR jobs OR careers`,
      `"${companyName}" news OR expansion OR growth`
    ],
    targetFields: {
      company: companyName,
      website: website || 'UNKNOWN',
      industry: 'UNKNOWN',
      geography: 'UNKNOWN',
      employeeEstimate: 'UNKNOWN',
      businessModel: 'UNKNOWN',
      operationalComplexity: 'UNKNOWN',
      erpStatus: 'UNKNOWN',
      painSignals: 'UNKNOWN',
      expansionSignals: 'UNKNOWN',
      decisionMakerRoles: 'UNKNOWN',
      odooRelevance: 'UNKNOWN',
      bs23Relevance: 'UNKNOWN'
    },
    existingEvidence: existingEvidence.length,
    remainingUnknowns,
    rules: [
      'Classify FACT only when a source URL directly supports the claim.',
      'Do not invent employee counts, revenue, ERP systems, or pain points.',
      'Campaign-derived ERP labels are INFERENCE until confirmed by a public source.',
      'If the website is inaccessible, note as source-unavailable.'
    ],
    recommended_actions: [
      website ? `Open ${website} and extract company description, product/service lines, locations, and any technology clues.` : `Search for "${companyName}" to find the company website.`,
      'Check LinkedIn company page for employee count, locations, and recent posts.',
      'Check job postings for technology stack clues (ERP, software mentions).',
      'Record each finding as a structured evidence item with source URL.'
    ]
  };
}

export function mergeResearchResults(brief, newEvidence) {
  if (!Array.isArray(newEvidence)) throw new Error('newEvidence must be an array of evidence items.');
  const profile = { ...brief.targetFields };
  for (const e of newEvidence) {
    if (!e.claim || !e.classification) continue;
    const claim = e.claim.toLowerCase();
    if (/industry|sector|vertical/.test(claim) && e.classification === 'FACT') profile.industry = e.claim;
    if (/employee|staff|team|people/.test(claim) && e.classification === 'FACT') profile.employeeEstimate = e.claim;
    if (/country|location|office|headquarter/.test(claim) && e.classification === 'FACT') profile.geography = e.claim;
    if (/erp|software|system|sap|oracle|dynamics/.test(claim)) profile.erpStatus = e.claim;
    if (/warehouse|logistics|manufacturing|distribution/.test(claim)) profile.operationalComplexity = e.claim;
    if (/expand|grow|new market|acquisition/.test(claim)) profile.expansionSignals = e.claim;
  }
  const unknowns = Object.entries(profile).filter(([, v]) => v === 'UNKNOWN').map(([k]) => k);
  return { ...profile, evidence: newEvidence, unknowns, reviewState: unknowns.length <= 3 ? 'research-ready' : 'needs-more-research' };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const company = process.argv[2], website = process.argv[3];
  if (!company) throw new Error('Usage: node tools/research-company.mjs "Company Name" [website]');
  console.log(JSON.stringify(buildResearchBrief(company, website), null, 2));
}
