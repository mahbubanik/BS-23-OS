/* Seeds only curated internal summaries into the private Odoo Knowledge data source. It never uploads vault files. */
import fs from 'node:fs/promises';
import { loadLocalEnv } from '../tools/local-env.mjs';

const VERSION = '2026-03-11';
const today = new Date().toISOString();
const richText = value => ({ rich_text: [{ text: { content: value.slice(0, 2000) } }] });
const title = value => ({ title: [{ text: { content: value.slice(0, 2000) } }] });

export function buildSeeds(knowledge) {
  const boundary = 'Internal only. Do not use externally until release approval is confirmed.';
  return [
    {
      title: 'ERP23 Odoo delivery positioning', type: 'Workflow', tags: ['ERP23', 'positioning', 'Odoo'],
      summary: `${knowledge.safePositioning.join(' ')} ${boundary}`
    },
    ...knowledge.approvedProof.map(proof => ({
      title: `${proof.client} — internal proof summary`,
      type: proof.client.includes('Valid Logistics') ? 'Integration' : 'Workflow',
      tags: ['internal proof', 'case reference', proof.client],
      summary: `${proof.statement} Use: ${proof.use} Source: ${proof.source}. ${boundary}`
    }))
  ];
}

async function main() {
  const env = { ...process.env, ...await loadLocalEnv(new URL('../.env', import.meta.url)) };
  if (!env.NOTION_TOKEN || !env.NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID) throw new Error('NOTION_TOKEN and NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID are required in .env.');
  const knowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-erp-knowledge.json', import.meta.url), 'utf8'));
  const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' };
  const api = async (path, method, body) => {
    const response = await fetch(`https://api.notion.com/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) throw new Error(`Notion ${method} ${path} failed (${response.status}): ${await response.text()}`);
    return response.json();
  };
  const created = [], skipped = [];
  for (const item of buildSeeds(knowledge)) {
    const existing = await api(`/data_sources/${env.NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID}/query`, 'POST', { filter: { property: 'Title', title: { equals: item.title } }, page_size: 1 });
    if (existing.results?.length) { skipped.push(item.title); continue; }
    await api('/pages', 'POST', {
      parent: { data_source_id: env.NOTION_ODOO_KNOWLEDGE_DATA_SOURCE_ID },
      properties: {
        Title: title(item.title), Type: { select: { name: item.type } }, Summary: richText(item.summary),
        'Security tier': { select: { name: 'Internal' } }, Tags: { multi_select: item.tags.map(name => ({ name })) },
        'Last reviewed': { date: { start: today } }
      }
    });
    created.push(item.title);
  }
  console.log(JSON.stringify({ created, skipped, boundary: 'Curated summaries only; no vault files or client-sensitive source documents were uploaded.' }, null, 2));
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) await main();
