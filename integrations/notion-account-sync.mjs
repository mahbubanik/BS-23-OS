/* Server-side only. This script deliberately excludes free-form research notes and client-sensitive data. */
import fs from 'node:fs/promises';
import { loadLocalEnv } from '../tools/local-env.mjs';

const VERSION = '2026-03-11';
const required = ['NOTION_TOKEN', 'NOTION_ACCOUNTS_DATA_SOURCE_ID', 'NOTION_EVIDENCE_DATA_SOURCE_ID'];
const statusName = { qualified: 'Qualified', review: 'Review', 'not-a-fit': 'Not a fit' };
const text = content => ({ rich_text: content ? [{ text: { content: String(content).slice(0, 2000) } }] : [] });
const title = content => ({ title: [{ text: { content: String(content).slice(0, 2000) } }] });

export function publicAccountProperties(account) {
  return {
    Name: title(account.company), Website: { url: account.website || null }, Country: text(account.country), Industry: text(account.industry),
    'Employee estimate': text(account.employeeEstimate), 'Business model': text(account.businessModel), 'ERP status': text(account.erpStatus), Complexity: text(account.operationalComplexity),
    'ICP score': { number: account.score?.total ?? null }, Qualification: { select: { name: statusName[account.score?.status] || 'Researching' } },
    'Next action': text(account.nextAction), 'Sales angle': text(account.salesAngle), 'Last researched': { date: { start: account.savedAt || new Date().toISOString() } }
  };
}

export function publicEvidenceProperties(evidence, accountPageId) {
  return {
    Claim: title(evidence.claim), Classification: { select: { name: evidence.classification } }, 'Source URL': { url: evidence.url || null },
    'Source name': text(evidence.sourceName), Confidence: { select: { name: evidence.confidence || 'medium' } },
    'Captured date': { date: { start: new Date().toISOString() } }, Account: { relation: [{ id: accountPageId }] }
  };
}

export function selectAccount(input, companyName) {
  if (!Array.isArray(input?.accounts)) return input;
  if (input.accounts.length === 1 && !companyName) return input.accounts[0];
  const match = input.accounts.find(account => account.company?.toLowerCase() === companyName?.toLowerCase());
  if (!match) throw new Error('Export package contains multiple accounts. Supply the exact company name as the second argument.');
  return match;
}

export async function createPublicResearchAccount(account, env = process.env, request = fetch) {
  const missing = required.filter(name => !env[name]);
  if (missing.length) throw new Error(`Missing environment variable(s): ${missing.join(', ')}`);
  if (!account?.company || !account?.country || !account?.score) throw new Error('Account must contain company, country, and score.');
  const api = async (path, method, body) => {
    const response = await request(`https://api.notion.com/v1${path}`, { method, headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`Notion ${method} ${path} failed (${response.status}): ${await response.text()}`);
    return response.json();
  };
  const matches = await api(`/data_sources/${env.NOTION_ACCOUNTS_DATA_SOURCE_ID}/query`, 'POST', { filter: { property: 'Name', title: { equals: account.company } }, page_size: 1 });
  const existing = matches.results?.[0];
  const accountPage = existing
    ? await api(`/pages/${existing.id}`, 'PATCH', { properties: publicAccountProperties(account) })
    : await api('/pages', 'POST', { parent: { data_source_id: env.NOTION_ACCOUNTS_DATA_SOURCE_ID }, properties: publicAccountProperties(account) });
  const evidenceIds = [];
  for (const item of account.evidence || []) {
    if (!item.claim) continue;
    const evidencePage = await api('/pages', 'POST', { parent: { data_source_id: env.NOTION_EVIDENCE_DATA_SOURCE_ID }, properties: publicEvidenceProperties(item, accountPage.id) });
    evidenceIds.push(evidencePage.id);
  }
  if (evidenceIds.length) await api(`/pages/${accountPage.id}`, 'PATCH', { properties: { Evidence: { relation: evidenceIds.map(id => ({ id })) } } });
  return { accountPageId: accountPage.id, evidencePageIds: evidenceIds, reusedAccount: Boolean(existing) };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: node integrations/notion-account-sync.mjs path/to/account-or-export.json [exact company name]');
  const account = selectAccount(JSON.parse(await fs.readFile(file, 'utf8')), process.argv[3]);
  console.log(JSON.stringify(await createPublicResearchAccount(account, { ...process.env, ...await loadLocalEnv() }), null, 2));
}
