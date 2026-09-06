import { loadLocalEnv } from './local-env.mjs';

const env = { ...process.env, ...await loadLocalEnv() };
const needed = ['NOTION_TOKEN', 'NOTION_ACCOUNTS_DATA_SOURCE_ID', 'NOTION_EVIDENCE_DATA_SOURCE_ID'];
const missing = needed.filter(name => !env[name]);
if (missing.length) throw new Error(`Missing local configuration: ${missing.join(', ')}`);
const headers = { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2026-03-11' };
async function getDataSource(label, id, requiredProperties) {
  const response = await fetch(`https://api.notion.com/v1/data_sources/${id}`, { headers });
  if (!response.ok) throw new Error(`${label} is not accessible (${response.status}). Confirm the data-source ID, connection sharing, and Read content capability.`);
  const data = await response.json();
  const title = data.title?.map(item => item.plain_text || item.text?.content || '').join('') || '(untitled)';
  const missingProperties = requiredProperties.filter(name => !data.properties?.[name]);
  if (missingProperties.length) throw new Error(`${label} is missing required property/properties: ${missingProperties.join(', ')}`);
  return { id: data.id, title, propertiesVerified: requiredProperties.length };
}
const [accounts, evidence] = await Promise.all([
  getDataSource('Accounts data source', env.NOTION_ACCOUNTS_DATA_SOURCE_ID, ['Name', 'Website', 'Country', 'Industry', 'Employee estimate', 'Business model', 'ERP status', 'Complexity', 'ICP score', 'Qualification', 'Next action', 'Sales angle', 'Last researched', 'Evidence']),
  getDataSource('Research Evidence data source', env.NOTION_EVIDENCE_DATA_SOURCE_ID, ['Claim', 'Classification', 'Source URL', 'Source name', 'Confidence', 'Captured date', 'Account'])
]);
console.log(JSON.stringify({ connected: true, accounts, evidence, next: 'Ready to sync one exported public-research account.' }, null, 2));
