/* Phase 1 is deliberately deterministic: no API key or LLM is needed to research, score, save, or export. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORE = { icp: 'bs23.salesos.icp.v1', accounts: 'bs23.salesos.accounts.v1' };
const fallbackScoring = {
  thresholds: { qualified: 65, review: 40 },
  criteria: [
    { id: 'industry', max: 15 }, { id: 'geography', max: 10 }, { id: 'employeeRange', max: 10 },
    { id: 'businessModel', max: 10 }, { id: 'operationalComplexity', max: 15 }, { id: 'painSignals', max: 15 },
    { id: 'technology', max: 10 }, { id: 'expansionSignals', max: 10 }, { id: 'evidence', max: 5 }
  ]
};
const bs23StartingIcp = { countries: '', industries: 'beauty, fragrance, cosmetics, wholesale, distribution', employeeRange: '', businessModels: 'B2B, wholesale, distributor', complexity: 'multi-warehouse, cross-border, import/export, multi-channel', painSignals: 'stock mismatch, manual order entry, reconciliation, spreadsheet', technology: 'legacy ERP, ERP, Shopify, Odoo', expansionSignals: '' };
let scoring = fallbackScoring;
let weights = Object.fromEntries(scoring.criteria.map(({ id, max }) => [id, max]));
let icp = read(STORE.icp, {}), accounts = read(STORE.accounts, []);

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function values(text = '') { return text.toLowerCase().split(',').map(x => x.trim()).filter(Boolean); }
function matches(need, actual) { const required = values(need), candidate = (actual || '').toLowerCase(); return !required.length ? null : required.some(item => candidate.includes(item)); }
function exactRange(need, actual) { return !need ? null : (need === actual ? true : false); }
function evidenceScore(evidence, max) { const facts = evidence.filter(e => e.classification === 'FACT' && e.url); const high = facts.filter(e => e.confidence === 'high').length; return facts.length >= 3 && high >= 1 ? max : facts.length >= 2 ? Math.round(max * 0.8) : facts.length ? Math.round(max * 0.4) : 0; }
function points(isMatch, max, label, emptyText = 'No ICP requirement') { if (isMatch === null) return { points: 0, max, reason: `${label}: ${emptyText}` }; return { points: isMatch ? max : 0, max, reason: `${label}: ${isMatch ? 'matches ICP' : 'does not match or is not evidenced'}` }; }
function scoreAccount(a) {
  const rows = [
    points(matches(icp.industries, a.industry), weights.industry, 'Industry'),
    points(matches(icp.countries, a.country), weights.geography, 'Geography'),
    points(exactRange(icp.employeeRange, a.employeeEstimate), weights.employeeRange, 'Employee size'),
    points(matches(icp.businessModels, a.businessModel), weights.businessModel, 'Business model'),
    points(matches(icp.complexity, a.operationalComplexity), weights.operationalComplexity, 'Complexity'),
    points(matches(icp.painSignals, a.painSignals), weights.painSignals, 'Pain signals'),
    points(matches(icp.technology, `${a.erpStatus} ${a.technology}`), weights.technology, 'Technology / ERP'),
    points(matches(icp.expansionSignals, a.expansionSignals), weights.expansionSignals, 'Expansion trigger')
  ];
  const evidence = evidenceScore(a.evidence, weights.evidence); rows.push({ points: evidence, max: weights.evidence, reason: `Evidence quality: ${evidence}/${weights.evidence} from sourced facts` });
  const total = rows.reduce((sum, row) => sum + row.points, 0);
  return { total, max: Object.values(weights).reduce((sum, max) => sum + max, 0), rows, status: total >= scoring.thresholds.qualified ? 'qualified' : total >= scoring.thresholds.review ? 'review' : 'not-a-fit' };
}
function recommendedAction(a, s) {
  const facts = a.evidence.filter(e => e.classification === 'FACT' && e.url).length;
  if (!facts) return 'Add at least one source-backed fact before outreach or qualification.';
  if (s.status === 'qualified' && a.painSignals) return 'Identify the Operations or Finance owner; prepare a two-sentence evidence-led outreach angle around the verified pain.';
  if (s.status === 'qualified') return 'Find one operational pain or trigger, then identify the likely Operations / Finance owner.';
  if (s.status === 'review') return 'Research the missing ICP criteria. Do not treat a weak fit as qualified yet.';
  return 'Archive for now unless a new, source-backed trigger appears.';
}
function salesAngle(a) { if (a.painSignals) return `Lead with the documented friction: ${a.painSignals.slice(0, 160)}${a.painSignals.length > 160 ? '…' : ''}`; if (a.operationalComplexity) return `Explore whether ${a.operationalComplexity.slice(0, 160)} creates inventory, order, or finance hand-off friction.`; return 'No angle yet: gather a concrete operational signal before outreach.'; }
function renderIcp() { const form = $('#icp-form'); Object.entries(icp).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); $('#icp-summary').textContent = Object.keys(icp).length ? 'Current ICP is saved in this browser. Search and scoring use these fields.' : 'Set the criteria you care about, then save the ICP.'; }
function addEvidence(value = {}) { const node = $('#evidence-template').content.firstElementChild.cloneNode(true); $$('[name]', node).forEach(el => el.value = value[el.name] || el.value); $('.remove-evidence', node).addEventListener('click', () => node.remove()); $('#evidence-list').append(node); }
function collectEvidence() { return $$('.evidence').map(row => Object.fromEntries($$('[name]', row).map(el => [el.name, el.value.trim()]))).filter(e => e.claim); }
function renderResult(a) { const s = a.score; $('#result').hidden = false; $('#result').innerHTML = `<span class="status ${s.status}">${s.status.replace('-', ' ')}</span><h2>${escapeHtml(a.company)}</h2><div class="score">${s.total}<small> / ${s.max}</small></div><p><strong>Recommended next action:</strong> ${escapeHtml(a.nextAction)}</p><p><strong>Sales angle:</strong> ${escapeHtml(a.salesAngle)}</p><h3>Explainable score</h3><ul class="breakdown">${s.rows.map(r => `<li><strong>${r.points}/${r.max}</strong> — ${escapeHtml(r.reason)}</li>`).join('')}</ul>`; }
function escapeHtml(value = '') { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function renderAccounts() { const root = $('#account-list'); if (!accounts.length) { root.innerHTML = '<p class="empty">No saved accounts yet.</p>'; return; } root.innerHTML = accounts.slice().reverse().map(a => `<article class="account"><span class="status ${a.score.status}">${a.score.status.replace('-', ' ')}</span><h3>${escapeHtml(a.company)} · ${a.score.total}/100</h3><p>${escapeHtml(a.country)}${a.industry ? ` · ${escapeHtml(a.industry)}` : ''}</p><p><strong>Next:</strong> ${escapeHtml(a.nextAction)}</p>${a.website ? `<a href="${escapeHtml(a.website)}" target="_blank" rel="noreferrer">Website</a>` : ''}</article>`).join(''); }
function searchQuery() { const parts = [icp.industries, icp.countries, icp.businessModels, icp.complexity].filter(Boolean).join(' '); window.open(`https://www.bing.com/search?q=${encodeURIComponent(parts || 'B2B company directory')}`, '_blank', 'noopener'); }
function download() { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), icp, accounts }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = Object.assign(document.createElement('a'), { href: url, download: `bs23-sales-os-${new Date().toISOString().slice(0, 10)}.json` }); link.click(); URL.revokeObjectURL(url); }
async function loadScoring() {
  try {
    const response = await fetch('../config/icp-scoring.json', { cache: 'no-store' });
    const candidate = await response.json();
    const total = candidate.criteria?.reduce((sum, criterion) => sum + criterion.max, 0);
    if (!response.ok || total !== 100 || !candidate.thresholds || candidate.criteria.some(criterion => !criterion.id || !Number.isFinite(criterion.max))) throw new Error('Invalid scoring configuration');
    scoring = candidate;
    weights = Object.fromEntries(scoring.criteria.map(({ id, max }) => [id, max]));
    renderIcp();
  } catch {
    // Opening index.html directly blocks fetch in some browsers; a verified fallback preserves tomorrow's no-setup workflow.
  }
}
async function loadBs23StartingIcp() {
  try {
    const response = await fetch('../config/bs23-campaign-icp.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Preset unavailable');
    icp = await response.json();
  } catch { icp = { ...bs23StartingIcp }; }
  write(STORE.icp, icp);
  renderIcp();
  $('#icp-summary').textContent = 'BS23 campaign starting ICP loaded. Adjust it for today before saving or searching.';
}
$$('.tab').forEach(button => button.addEventListener('click', () => { $$('.tab,.view').forEach(el => el.classList.remove('active')); button.classList.add('active'); $(`#${button.dataset.view}`).classList.add('active'); }));
$('#icp-form').addEventListener('submit', event => { event.preventDefault(); icp = Object.fromEntries(new FormData(event.currentTarget).entries()); write(STORE.icp, icp); renderIcp(); });
$('#load-bs23-icp').addEventListener('click', loadBs23StartingIcp);
$('#find-companies').addEventListener('click', searchQuery); $('#add-evidence').addEventListener('click', () => addEvidence());
$('#account-form').addEventListener('submit', event => { event.preventDefault(); const account = Object.fromEntries(new FormData(event.currentTarget).entries()); account.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()); account.evidence = collectEvidence(); account.score = scoreAccount(account); account.salesAngle = salesAngle(account); account.nextAction = recommendedAction(account, account.score); account.savedAt = new Date().toISOString(); accounts.push(account); write(STORE.accounts, accounts); renderResult(account); renderAccounts(); });
$('#export-accounts').addEventListener('click', download); $('#clear-accounts').addEventListener('click', () => { if (confirm('Delete only this browser’s saved Sales OS data? Export first if you need a backup.')) { accounts = []; write(STORE.accounts, accounts); renderAccounts(); } });
renderIcp(); addEvidence(); renderAccounts();
loadScoring();
