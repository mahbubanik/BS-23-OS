/* Seeds evidence-grounded ICP definitions into the Notion ICP Definitions data source. */
import fs from 'node:fs/promises';
import { loadLocalEnv } from '../tools/local-env.mjs';

const VERSION = '2026-03-11';
const text = content => ({ rich_text: content ? [{ text: { content: String(content).slice(0, 2000) } }] : [] });
const title = content => ({ title: [{ text: { content: String(content).slice(0, 2000) } }] });

export function buildIcpProperties(icp) {
  return {
    Name: title(icp.name),
    Countries: text(icp.countries),
    Industries: text(icp.industries),
    'Employee range': text(icp.employeeRange),
    'Business models': text(icp.businessModels),
    Pains: text(icp.pains),
    Technology: text(icp.technology),
    Triggers: text(icp.triggers),
    Version: text(icp.version || '1.0.0'),
    Active: { checkbox: Boolean(icp.active) }
  };
}

async function main() {
  const env = { ...process.env, ...await loadLocalEnv(new URL('../.env', import.meta.url)) };
  if (!env.NOTION_TOKEN || !env.NOTION_ICP_DEFINITIONS_DATA_SOURCE_ID) {
    throw new Error('NOTION_TOKEN and NOTION_ICP_DEFINITIONS_DATA_SOURCE_ID are required.');
  }

  const icpList = JSON.parse(await fs.readFile(new URL('../config/bs23-grounded-icps.json', import.meta.url), 'utf8'));
  const headers = {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    'Notion-Version': VERSION,
    'Content-Type': 'application/json'
  };

  const api = async (path, method, body) => {
    const response = await fetch(`https://api.notion.com/v1${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error(`Notion ${method} ${path} failed (${response.status}): ${await response.text()}`);
    return response.json();
  };

  const created = [];
  const skipped = [];

  for (const icp of icpList) {
    const existing = await api(`/data_sources/${env.NOTION_ICP_DEFINITIONS_DATA_SOURCE_ID}/query`, 'POST', {
      filter: { property: 'Name', title: { equals: icp.name } },
      page_size: 1
    });

    if (existing.results?.length) {
      skipped.push(icp.name);
      continue;
    }

    await api('/pages', 'POST', {
      parent: { data_source_id: env.NOTION_ICP_DEFINITIONS_DATA_SOURCE_ID },
      properties: buildIcpProperties(icp)
    });
    created.push(icp.name);
  }

  console.log(JSON.stringify({ created: created.length, skipped: skipped.length, createdList: created }, null, 2));
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) await main();
