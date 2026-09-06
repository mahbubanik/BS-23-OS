/* Creates an Opportunity in the Notion Opportunities data source linked to an Account. */
import { loadLocalEnv } from './local-env.mjs';

const VERSION = '2026-03-11';
const text = content => ({ rich_text: content ? [{ text: { content: String(content).slice(0, 2000) } }] : [] });
const title = content => ({ title: [{ text: { content: String(content).slice(0, 2000) } }] });

export async function createOpportunity({
  name,
  accountPageId,
  stage = 'Discovery',
  amountRange = '$25k-$45k',
  health = 'Healthy',
  pain = '',
  champion = '',
  decisionMaker = '',
  nextAction = '',
  closeTarget = null,
  env = process.env,
  fetchFn = fetch
}) {
  const localEnv = await loadLocalEnv();
  const token = env.NOTION_TOKEN || localEnv.NOTION_TOKEN;
  const oppDataSourceId = env.NOTION_OPPORTUNITIES_DATA_SOURCE_ID || localEnv.NOTION_OPPORTUNITIES_DATA_SOURCE_ID;

  if (!token || !oppDataSourceId) {
    throw new Error('NOTION_TOKEN and NOTION_OPPORTUNITIES_DATA_SOURCE_ID are required.');
  }

  if (!name) {
    throw new Error('Opportunity name is required.');
  }

  const properties = {
    Name: title(name),
    Stage: { select: { name: stage } },
    'Amount range': text(amountRange),
    Health: { select: { name: health } },
    Pain: text(pain),
    Champion: text(champion),
    'Decision maker': text(decisionMaker),
    'Next action': text(nextAction)
  };

  if (closeTarget) {
    properties['Close target'] = { date: { start: closeTarget } };
  }

  if (accountPageId) {
    properties.Account = { relation: [{ id: accountPageId }] };
  }

  const response = await fetchFn('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { data_source_id: oppDataSourceId },
      properties
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion create opportunity failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const name = process.argv[2];
  const accountPageId = process.argv[3];
  if (!name) {
    console.error('Usage: node tools/create-opportunity.mjs "Deal Name" [accountPageId]');
    process.exit(1);
  }
  createOpportunity({
    name,
    accountPageId,
    pain: 'Multi-warehouse stock reconciliation across 2,000 SKUs',
    nextAction: 'Schedule discovery with COO'
  })
    .then(res => console.log(JSON.stringify({ opportunityId: res.id, name }, null, 2)))
    .catch(err => console.error(err.message));
}
