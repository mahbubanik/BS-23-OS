import { loadLocalEnv } from './local-env.mjs';
const env = { ...process.env, ...await loadLocalEnv() };
const sources = ['ACCOUNTS', 'EVIDENCE', 'CONTACTS', 'OPPORTUNITIES', 'MEETINGS', 'ACTIVITIES', 'TASKS', 'ICP_DEFINITIONS', 'KNOWLEDGE', 'ODOO_KNOWLEDGE'];
const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2026-03-11' };
const missing = sources.filter(key => !env[`NOTION_${key}_DATA_SOURCE_ID`]);
if (missing.length) throw new Error(`Missing data-source IDs: ${missing.join(', ')}`);
const verified = await Promise.all(sources.map(async key => { const response = await fetch(`https://api.notion.com/v1/data_sources/${env[`NOTION_${key}_DATA_SOURCE_ID`]}`, { headers }); if (!response.ok) throw new Error(`${key} unavailable (${response.status})`); const data = await response.json(); return { key, title: data.title?.map(t => t.plain_text || '').join('') || '(untitled)', propertyCount: Object.keys(data.properties || {}).length }; }));
console.log(JSON.stringify({ connected: true, dataSources: verified }, null, 2));
