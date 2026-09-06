/* Builds a local review queue from campaign_master.json. It intentionally omits names, email, phone, generated copy, and free-form notes. */
import fs from 'node:fs/promises';
import path from 'node:path';

const sourcePath = process.argv[2] || '../campaign_master.json';
const outputDir = process.argv[3] || 'local-output';
const normalize = value => String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
const safeText = value => String(value || '').trim();
const validUrl = value => /^https?:\/\//i.test(value || '') ? value : '';
function keyFor(row) { return normalize(row.website) || `${normalize(row.company)}|${normalize(row.country)}`; }
function toCandidate(row, index) {
  const erp = safeText(row.erp);
  const segment = safeText(row.segment);
  const source = validUrl(row.research_source);
  const claim = [
    `Internal campaign segmentation: ${segment || 'unsegmented'}.`,
    erp ? `ERP/system listed in campaign research: ${erp}.` : 'No ERP/system is listed in campaign research.',
    'Verify this before treating it as an external fact or using it in outreach.'
  ].join(' ');
  return {
    importKey: `campaign-${index + 1}`,
    company: safeText(row.company), website: safeText(row.website), country: safeText(row.country),
    erpStatus: erp ? `Reported in legacy campaign research: ${erp}` : 'Unknown',
    campaignContext: { segment, priority: safeText(row.priority), integrated: safeText(row.integrated), legacy: Boolean(row.legacy), campaignType: safeText(row.campaign_type) },
    evidence: [{ classification: 'INFERENCE', claim, url: source, sourceName: source ? 'Original campaign research source' : 'Internal campaign segmentation', confidence: 'low' }],
    reviewRequired: true,
    excludedFields: ['email', 'first_name', 'phone', 'generated outreach copy', 'free-form research notes']
  };
}
export function buildPreview(rows) {
  const seen = new Map();
  const skipped = [];
  rows.forEach((row, index) => {
    if (!safeText(row.company)) { skipped.push({ sourceRow: index + 1, reason: 'Missing company' }); return; }
    const key = keyFor(row);
    if (seen.has(key)) { seen.get(key).duplicateSourceRows.push(index + 1); return; }
    const candidate = toCandidate(row, index);
    candidate.duplicateSourceRows = [];
    seen.set(key, candidate);
  });
  const accounts = [...seen.values()];
  return {
    generatedAt: new Date().toISOString(), source: path.basename(sourcePath), sourceRecordCount: rows.length,
    uniqueAccountCandidates: accounts.length, duplicateCandidates: accounts.filter(account => account.duplicateSourceRows.length).length,
    reviewRules: ['Do not score or sync until public evidence is reviewed.', 'Do not import contacts or outreach copy through this account preview.'],
    accounts, skipped
  };
}
if (import.meta.url === new URL(`file:${process.argv[1]}`).href) {
  const rows = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
  const preview = buildPreview(rows);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'campaign-account-preview.json'), JSON.stringify(preview, null, 2));
  await fs.writeFile(path.join(outputDir, 'campaign-account-preview-summary.md'), `# Campaign account review preview\n\n- Source records: ${preview.sourceRecordCount}\n- Unique account candidates: ${preview.uniqueAccountCandidates}\n- Duplicate candidates: ${preview.duplicateCandidates}\n- Skipped: ${preview.skipped.length}\n\nThis is a local review queue only. It excludes personal contact data, generated copy, and free-form notes.\n`);
  console.log(JSON.stringify({ sourceRecordCount: preview.sourceRecordCount, uniqueAccountCandidates: preview.uniqueAccountCandidates, duplicateCandidates: preview.duplicateCandidates, skipped: preview.skipped.length, outputDir }, null, 2));
}
