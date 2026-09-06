/* Idempotent creator for the private, structured Notion sales brain. Run only against the user-approved parent page. */
import fs from 'node:fs/promises';
import { loadLocalEnv } from './local-env.mjs';

const VERSION = '2026-03-11';
const pageId = value => (value.match(/[a-f0-9]{32}(?![a-f0-9])/i)?.[0] || '').toLowerCase();
const title = text => [{ type: 'text', text: { content: text } }];
const text = { rich_text: {} };
const select = options => ({ select: { options: options.map(name => ({ name })) } });
const schemas = {
  CONTACTS: { title: 'Contacts', properties: { Name: { title: {} }, Role: text, Email: { email: {} }, LinkedIn: { url: {} }, Influence: select(['Decision maker', 'Champion', 'Influencer', 'User', 'Unknown']), Status: select(['Active', 'Unverified', 'Do not contact']) } },
  OPPORTUNITIES: { title: 'Opportunities', properties: { Name: { title: {} }, Stage: select(['Discovery', 'Qualified', 'Solution', 'Proposal', 'Negotiation', 'Won', 'Lost']), 'Amount range': text, 'Close target': { date: {} }, Health: select(['Healthy', 'Watch', 'At risk']), Pain: text, Champion: text, 'Decision maker': text, 'Next action': text } },
  MEETINGS: { title: 'Meetings', properties: { Name: { title: {} }, Date: { date: {} }, Attendees: text, Notes: text, 'Confirmed needs': text, Assumptions: text, Commitments: text, 'Next action': text } },
  ACTIVITIES: { title: 'Activities', properties: { Name: { title: {} }, Date: { date: {} }, Type: select(['Research', 'Email', 'Call', 'Meeting', 'LinkedIn', 'WhatsApp', 'Note']), Outcome: text, 'Follow-up date': { date: {} } } },
  TASKS: { title: 'Tasks', properties: { Name: { title: {} }, Due: { date: {} }, Status: select(['Open', 'In progress', 'Done', 'Cancelled']), Priority: select(['High', 'Medium', 'Low']), Owner: text } },
  ICP_DEFINITIONS: { title: 'ICP Definitions', properties: { Name: { title: {} }, Countries: text, Industries: text, 'Employee range': text, 'Business models': text, Pains: text, Technology: text, Triggers: text, Version: text, Active: { checkbox: {} } } },
  KNOWLEDGE: { title: 'Knowledge', properties: { Title: { title: {} }, Type: select(['Case study', 'Capability', 'Methodology', 'Proof point', 'Template']), 'Content / Drive link': { url: {} }, 'Security tier': select(['Public', 'Internal', 'Client-sensitive']), Tags: { multi_select: { options: [] } }, 'Last reviewed': { date: {} } } },
  ODOO_KNOWLEDGE: { title: 'Odoo Knowledge', properties: { Title: { title: {} }, Type: select(['Module', 'Workflow', 'Integration', 'Hosting', 'Community vs Enterprise']), Summary: text, 'Security tier': select(['Public', 'Internal']), Tags: { multi_select: { options: [] } }, 'Last reviewed': { date: {} } } }
};
function patchEnv(contents, values) {
  const seen = new Set();
  const lines = contents.split(/\r?\n/).map(line => { const key = line.split('=', 1)[0]; if (!(key in values)) return line; seen.add(key); return `${key}=${values[key]}`; });
  for (const [key, value] of Object.entries(values)) if (!seen.has(key)) lines.push(`${key}=${value}`);
  return lines.join('\n');
}
const parent = pageId(process.argv[2] || '');
if (!parent) throw new Error('Usage: node tools/bootstrap-sales-brain.mjs <approved private Notion parent-page URL>');
const env = { ...process.env, ...await loadLocalEnv() };
if (!env.NOTION_TOKEN) throw new Error('NOTION_TOKEN is missing from .env.');
const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' };
async function api(path, method, body) { const r = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined }); if (!r.ok) throw new Error(`Notion ${method} ${path} failed (${r.status}): ${await r.text()}`); return r.json(); }
async function create(key) {
  const existing = env[`NOTION_${key}_DATA_SOURCE_ID`];
  if (existing) return existing;
  const spec = schemas[key];
  const db = await api('/databases', 'POST', { parent: { type: 'page_id', page_id: parent }, title: title(spec.title), is_inline: true, initial_data_source: { properties: spec.properties } });
  const detail = await api(`/databases/${db.id}`, 'GET');
  const id = detail.data_sources?.[0]?.id || db.data_sources?.[0]?.id;
  if (!id) throw new Error(`${spec.title} created but no data-source ID was returned; do not rerun.`);
  return id;
}
const ids = {};
for (const key of Object.keys(schemas)) ids[key] = await create(key);
const all = { ...env, ...Object.fromEntries(Object.entries(ids).map(([key, id]) => [`NOTION_${key}_DATA_SOURCE_ID`, id])) };
async function relation(fromKey, property, toKey, reverse) {
  const fromId = all[`NOTION_${fromKey}_DATA_SOURCE_ID`], toId = all[`NOTION_${toKey}_DATA_SOURCE_ID`];
  await api(`/data_sources/${fromId}`, 'PATCH', { properties: { [property]: { relation: { data_source_id: toId, type: 'dual_property', dual_property: { synced_property_name: reverse } } } } });
}
await relation('CONTACTS', 'Account', 'ACCOUNTS', 'Contacts');
await relation('OPPORTUNITIES', 'Account', 'ACCOUNTS', 'Opportunities');
await relation('MEETINGS', 'Account', 'ACCOUNTS', 'Meetings');
await relation('MEETINGS', 'Opportunity', 'OPPORTUNITIES', 'Meetings');
await relation('ACTIVITIES', 'Account', 'ACCOUNTS', 'Activities');
await relation('ACTIVITIES', 'Opportunity', 'OPPORTUNITIES', 'Activities');
await relation('TASKS', 'Account', 'ACCOUNTS', 'Tasks');
await relation('TASKS', 'Opportunity', 'OPPORTUNITIES', 'Tasks');
const update = Object.fromEntries(Object.entries(ids).map(([key, id]) => [`NOTION_${key}_DATA_SOURCE_ID`, id]));
await fs.writeFile('.env', patchEnv(await fs.readFile('.env', 'utf8'), update), 'utf8');
console.log(JSON.stringify({ createdOrConfigured: Object.keys(ids).map(key => schemas[key].title), relationPairs: 8, next: 'Run node tools/verify-sales-brain.mjs' }, null, 2));
