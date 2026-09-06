/* Seeds BS23 company knowledge and expanded Odoo client summaries into the private Notion data sources.
   It never uploads vault files. All entries are curated summaries with internal-use tags. */
import fs from 'node:fs/promises';
import { loadLocalEnv } from '../tools/local-env.mjs';

const VERSION = '2026-03-11';
const today = new Date().toISOString();
const richText = value => ({ rich_text: [{ text: { content: String(value).slice(0, 2000) } }] });
const title = value => ({ title: [{ text: { content: String(value).slice(0, 2000) } }] });
const boundary = 'Internal only. Do not use externally until release approval is confirmed.';

export function buildKnowledgeSeeds(company) {
  const seeds = [];
  // Identity & positioning
  seeds.push({ title: 'BS23 Identity & Positioning', type: 'Company', tags: ['identity', 'positioning'],
    summary: `${company.identity.legalName}, founded ${company.identity.founded} by ${company.identity.founder}. ${company.identity.tagline}. HQ: ${company.identity.hq}. Offices: ${company.identity.offices.join(', ')}. ${boundary}` });
  // Credibility stack
  seeds.push({ title: 'BS23 Credibility Stack', type: 'Company', tags: ['credibility', 'claims'],
    summary: company.credibilityStack.map(c => `${c.claim}${c.caveat ? ` (caveat: ${c.caveat})` : ''}`).join('. ') + `. ${boundary}` });
  // SBUs
  seeds.push({ title: 'BS23 Strategic Business Units', type: 'Company', tags: ['SBU', 'structure'],
    summary: company.sbus.map(s => `${s.name} (${s.brand || s.focus})${s.highlight ? ': ' + s.highlight : ''}`).join('. ') + `. ${boundary}` });
  // Engagement models
  for (const model of company.engagementModels) {
    seeds.push({ title: `BS23 Engagement Model: ${model.name}`, type: 'Workflow', tags: ['engagement', 'commercial'],
      summary: `${model.name}. Use: ${model.use}. Payment: ${model.payment}. ${boundary}` });
  }
  // ERP23 practice
  const erp = company.erp23Practice;
  seeds.push({ title: 'ERP23 Odoo Practice Summary', type: 'Workflow', tags: ['ERP23', 'Odoo', 'practice'],
    summary: `${erp.brand}. ${erp.partnerStatus} ${erp.certifiedVersions}. ${erp.certifiedResources}. Methodology: ${erp.methodology}. Standard team: ${erp.team}. ${boundary}` });
  // Voice rules
  seeds.push({ title: 'BS23 Communication Voice Guide', type: 'Company', tags: ['voice', 'communication', 'writing'],
    summary: `Proposal register: ${company.voiceRules.register.proposal} Deck register: ${company.voiceRules.register.deck} Social register: ${company.voiceRules.register.social} Standard intro: "${company.voiceRules.standardIntro}" Standard closing: "${company.voiceRules.standardClosing}" Rules: ${company.voiceRules.credibilityDeployment}. ${company.voiceRules.proofFirst}. Vocab: use ${company.voiceRules.recurringVocab.join(', ')} sparingly (${company.voiceRules.vocabRule}). ${boundary}` });
  // Case study formats
  seeds.push({ title: 'BS23 Case Study Formats', type: 'Company', tags: ['case-study', 'format', 'writing'],
    summary: `A (long-form): ${company.caseStudyFormats.A_longForm}. B (compact): ${company.caseStudyFormats.B_compact}. C (slide): ${company.caseStudyFormats.C_slide}. D (internal vault): ${company.caseStudyFormats.D_internalVault}. ${boundary}` });
  return seeds;
}

export function buildOdooClientSeeds(knowledge) {
  return knowledge.odooClients.filter(c => c.solution).map(client => ({
    title: `${client.client} — Odoo client summary`,
    type: client.modules?.some(m => /manufacturing|production/i.test(m)) ? 'Integration' : 'Workflow',
    tags: ['odoo-client', client.industry, client.geography].filter(Boolean),
    summary: `Client: ${client.client}. Industry: ${client.industry || 'unknown'}. Geography: ${client.geography || 'unknown'}. Modules: ${client.modules ? client.modules.join(', ') : 'not specified'}. Solution: ${client.solution}. Complexity: ${client.complexity || 'not specified'}. Outcome: ${client.outcome || 'not specified'}. Source: ${client.source}. ${boundary}`
  }));
}

async function main() {
  const env = { ...process.env, ...await loadLocalEnv(new URL('../.env', import.meta.url)) };
  const required = ['NOTION_TOKEN', 'NOTION_KNOWLEDGE_DATA_SOURCE_ID', 'NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID'];
  const missing = required.filter(k => !env[k]);
  if (missing.length) throw new Error(`Missing: ${missing.join(', ')}. Add NOTION_KNOWLEDGE_DATA_SOURCE_ID to .env if not present.`);
  const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' };
  const api = async (path, method, body) => {
    const response = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) throw new Error(`Notion ${method} ${path} failed (${response.status}): ${await response.text()}`);
    return response.json();
  };
  const company = JSON.parse(await fs.readFile(new URL('../config/bs23-company-knowledge.json', import.meta.url), 'utf8'));
  const knowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-erp-knowledge.json', import.meta.url), 'utf8'));
  const knowledgeSeeds = buildKnowledgeSeeds(company);
  const odooSeeds = buildOdooClientSeeds(knowledge);
  const created = [], skipped = [];
  // Seed company knowledge
  for (const item of knowledgeSeeds) {
    const existing = await api(`/data_sources/${env.NOTION_KNOWLEDGE_DATA_SOURCE_ID}/query`, 'POST', { filter: { property: 'Title', title: { equals: item.title } }, page_size: 1 });
    if (existing.results?.length) { skipped.push(item.title); continue; }
    await api('/pages', 'POST', { parent: { data_source_id: env.NOTION_KNOWLEDGE_DATA_SOURCE_ID }, properties: {
      Title: title(item.title), Type: { select: { name: item.type } }, Summary: richText(item.summary),
      'Security tier': { select: { name: 'Internal' } }, Tags: { multi_select: item.tags.map(name => ({ name })) },
      'Last reviewed': { date: { start: today } }
    }});
    created.push(item.title);
  }
  // Seed Odoo client summaries
  for (const item of odooSeeds) {
    const existing = await api(`/data_sources/${env.NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID}/query`, 'POST', { filter: { property: 'Title', title: { equals: item.title } }, page_size: 1 });
    if (existing.results?.length) { skipped.push(item.title); continue; }
    await api('/pages', 'POST', { parent: { data_source_id: env.NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID }, properties: {
      Title: title(item.title), Type: { select: { name: item.type } }, Summary: richText(item.summary),
      'Security tier': { select: { name: 'Internal' } }, Tags: { multi_select: item.tags.map(name => ({ name })) },
      'Last reviewed': { date: { start: today } }
    }});
    created.push(item.title);
  }
  console.log(JSON.stringify({ created: created.length, skipped: skipped.length, details: { created, skipped }, boundary: 'Curated summaries only; no vault files or client-sensitive source documents were uploaded.' }, null, 2));
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) await main();
