import fs from 'node:fs/promises';
import { loadLocalEnv } from './local-env.mjs';

const VERSION = '2026-03-11';
const pageIdFrom = value => (value.match(/[a-f0-9]{32}(?![a-f0-9])/i)?.[0] || '').toLowerCase();
const title = content => [{ type: 'text', text: { content } }];
const select = names => ({ select: { options: names.map(name => ({ name })) } });
const richText = { rich_text: {} };

const accountProperties = {
  Name: { title: {} }, Website: { url: {} }, Country: richText, Industry: richText, 'Employee estimate': richText,
  'Business model': richText, 'ERP status': richText, Complexity: richText, 'ICP score': { number: { format: 'number' } },
  Qualification: select(['Researching', 'Qualified', 'Review', 'Not a fit', 'Archived']), 'Next action': richText,
  'Sales angle': richText, 'Last researched': { date: {} }
};
const evidenceProperties = {
  Claim: { title: {} }, Classification: select(['FACT', 'INFERENCE', 'UNKNOWN']), 'Source URL': { url: {} },
  'Source name': richText, Confidence: select(['high', 'medium', 'low']), 'Captured date': { date: {} }
};

function withIds(contents, ids) {
  const wanted = { NOTION_ACCOUNTS_DATA_SOURCE_ID: ids.accounts, NOTION_EVIDENCE_DATA_SOURCE_ID: ids.evidence };
  const seen = new Set();
  const lines = contents.split(/\r?\n/).map(line => {
    const key = line.split('=', 1)[0];
    if (!(key in wanted)) return line;
    seen.add(key); return `${key}=${wanted[key]}`;
  });
  for (const [key, value] of Object.entries(wanted)) if (!seen.has(key)) lines.push(`${key}=${value}`);
  return lines.join('\n');
}

const parentPageId = pageIdFrom(process.argv[2] || '');
if (!parentPageId) throw new Error('Usage: node tools/bootstrap-notion-schema.mjs <private Notion parent-page URL>');
const env = { ...process.env, ...await loadLocalEnv() };
if (!env.NOTION_TOKEN) throw new Error('NOTION_TOKEN is missing from .env.');
const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' };
async function api(path, method, body) {
  const response = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) throw new Error(`Notion ${method} ${path} failed (${response.status}): ${await response.text()}`);
  return response.json();
}
async function createDatabase(name, properties) {
  const database = await api('/databases', 'POST', { parent: { type: 'page_id', page_id: parentPageId }, title: title(name), is_inline: true, initial_data_source: { properties } });
  const detail = await api(`/databases/${database.id}`, 'GET');
  const sourceId = detail.data_sources?.[0]?.id || database.data_sources?.[0]?.id;
  if (!sourceId) throw new Error(`${name} was created but its data-source ID was not returned. Do not rerun; retrieve it from Notion's Manage data sources menu.`);
  return { databaseId: database.id, dataSourceId: sourceId };
}

const accounts = await createDatabase('Accounts', accountProperties);
const evidence = await createDatabase('Research Evidence', evidenceProperties);
await api(`/data_sources/${accounts.dataSourceId}`, 'PATCH', {
  properties: { Evidence: { relation: { data_source_id: evidence.dataSourceId, type: 'dual_property', dual_property: { synced_property_name: 'Account' } } } }
});
const dotenv = await fs.readFile('.env', 'utf8');
await fs.writeFile('.env', withIds(dotenv, { accounts: accounts.dataSourceId, evidence: evidence.dataSourceId }), 'utf8');
console.log(JSON.stringify({ created: { accounts, evidence }, configured: ['NOTION_ACCOUNTS_DATA_SOURCE_ID', 'NOTION_EVIDENCE_DATA_SOURCE_ID'], next: 'Run node tools/verify-notion-connection.mjs' }, null, 2));
