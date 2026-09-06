import fs from 'node:fs/promises';
import path from 'node:path';

const inputPath = process.argv[2] || 'local-output/campaign-account-preview.json';
const outputPath = process.argv[3] || 'local-output/campaign-research-queue.json';
const queueSize = Number(process.argv[4] || 20);
const priority = value => Number.isFinite(Number(value)) ? Number(value) : 99;
const websiteRank = account => account.website ? 0 : 1;
const erpRank = account => account.erpStatus === 'Unknown' ? 1 : 0;
export function buildQueue(preview, limit = 20) {
  const ranked = [...preview.accounts].sort((a, b) =>
    priority(a.campaignContext.priority) - priority(b.campaignContext.priority) ||
    websiteRank(a) - websiteRank(b) || erpRank(a) - erpRank(b) ||
    a.company.localeCompare(b.company)
  );
  return {
    generatedAt: new Date().toISOString(), source: preview.source, queueSize: Math.min(limit, ranked.length),
    selectionRules: ['Lower existing campaign priority number first.', 'Companies with a website before companies without one.', 'Reported ERP/system clues are research leads, not confirmed facts.', 'No contact data, generated outreach copy, or free-form notes included.'],
    items: ranked.slice(0, limit).map((account, index) => ({
      rank: index + 1, importKey: account.importKey, company: account.company, website: account.website, country: account.country,
      campaignSegment: account.campaignContext.segment, reportedErp: account.erpStatus,
      researchObjective: 'Open the company website and find a direct public source for one operational complexity, pain, ERP clue, or trigger. Record it as FACT only with the URL.',
      nextAfterResearch: 'Use ICP Research to record sourced evidence, then score. Sync to Notion only if the review supports it.'
    }))
  };
}
if (import.meta.url === new URL(`file:${process.argv[1]}`).href) {
  const preview = JSON.parse(await fs.readFile(inputPath, 'utf8'));
  const queue = buildQueue(preview, queueSize);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(queue, null, 2));
  console.log(JSON.stringify({ queueSize: queue.queueSize, outputPath }, null, 2));
}
