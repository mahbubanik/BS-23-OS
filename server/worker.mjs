const agents = [
  { id: 'account_intelligence', actions: ['research', 'qualify'] },
  { id: 'meeting_copilot', actions: ['meeting_analysis'] },
  { id: 'deal_strategist', actions: ['deal_evaluation'] },
  { id: 'daily_operator', actions: ['daily_plan', 'activity_capture'] },
  { id: 'communication', actions: ['communication'] }
];

function headers(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
}

function json(value, env, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: headers(env) });
}

function authorized(request, env) {
  return request.headers.get('Authorization') === 'Bearer ' + env.SALES_OS_ACCESS_TOKEN;
}

function routeRequest(request) {
  const text = String(request || '').toLowerCase();
  if (/meeting|notes|follow up/.test(text)) return 'meeting_copilot';
  if (/draft|email|linkedin|whatsapp|outreach|objection/.test(text)) return 'communication';
  if (/deal|proposal|next best action/.test(text)) return 'deal_strategist';
  if (/today|priority|activity|end of day/.test(text)) return 'daily_operator';
  return 'account_intelligence';
}

function research(company, website) {
  if (!company) throw new Error('Company is required.');
  const host = website ? new URL(website.startsWith('http') ? website : 'https://' + website).hostname : null;
  return {
    agent_id: 'account_intelligence',
    company,
    website: website || null,
    searchQueries: [host ? 'site:' + host : '"' + company + '" company', '"' + company + '" ERP OR software OR system', '"' + company + '" hiring OR jobs OR careers', '"' + company + '" news OR expansion OR growth'],
    rules: ['FACT requires a direct source URL.', 'Do not invent employee counts, ERP systems, pain points, or outcomes.', 'Keep unverified signals as INFERENCE or UNKNOWN.']
  };
}

function meeting(notes) {
  if (!notes) throw new Error('Meeting notes are required.');
  const groups = { pains: [], requirements: [], stakeholders: [], nextActions: [], systems: [] };
  String(notes).split(/\r?\n/).map(x => x.trim()).filter(Boolean).forEach(line => {
    const lower = line.toLowerCase();
    if (/pain|problem|issue|bottleneck|friction|struggle/.test(lower)) groups.pains.push(line);
    if (/need|want|require|module|feature/.test(lower)) groups.requirements.push(line);
    if (/cfo|ceo|cto|manager|director|head|champion|lead/.test(lower)) groups.stakeholders.push(line);
    if (/action|next|follow up|todo|send|schedule/.test(lower)) groups.nextActions.push(line);
    if (/sap|odoo|oracle|dynamics|excel|zoho|sage/.test(lower)) groups.systems.push(line);
  });
  const unknowns = [];
  if (!groups.stakeholders.length) unknowns.push('Decision maker or budget authority');
  if (!groups.pains.length) unknowns.push('Specific operational pain point');
  if (!groups.systems.length) unknowns.push('Current ERP or accounting software');
  if (!groups.nextActions.length) unknowns.push('Agreed next step or follow-up date');
  return { agent_id: 'meeting_copilot', ...groups, unknowns };
}

function deal(input) {
  if (!input.name) throw new Error('Opportunity name is required.');
  const checks = [['pain', 'Specific operational pain', 20], ['champion', 'Internal champion', 15], ['decisionMaker', 'Economic buyer', 25], ['closeTarget', 'Target go-live date', 15], ['currentSystem', 'Current ERP or system', 10], ['budgetRange', 'Budget range', 15]];
  let healthScore = 100;
  const unknowns = [];
  checks.forEach(check => { if (!input[check[0]]) { healthScore -= check[2]; unknowns.push(check[1]); } });
  let nextBestAction = 'Deliver a tailored Odoo solution proposal using only approved proof.';
  if (unknowns.includes('Economic buyer')) nextBestAction = 'Confirm the decision process and schedule a briefing with the economic buyer before drafting a proposal.';
  else if (unknowns.includes('Specific operational pain')) nextBestAction = 'Conduct workflow discovery focused on daily operational friction.';
  else if (unknowns.includes('Target go-live date')) nextBestAction = 'Ask what happens if the system is not live by the target quarter.';
  return { agent_id: 'deal_strategist', healthScore: Math.max(0, healthScore), unknowns, nextBestAction };
}

function daily(input) {
  const priorities = [];
  (input.overdueFollowUps || []).forEach(x => priorities.push('P0 overdue: ' + x));
  (input.meetings || []).forEach(x => priorities.push('P1 meeting: ' + x));
  (input.tasks || []).forEach(x => priorities.push('P2 task: ' + x));
  if (priorities.length < 5) priorities.push('P3 pipeline: research 3 to 5 ICP accounts or progress active discovery.');
  return { agent_id: 'daily_operator', date: new Date().toISOString().slice(0, 10), priorities };
}

async function communication(input, env) {
  const facts = Array.isArray(input.facts) ? input.facts.filter(x => x && x.claim && x.url) : [];
  if (!input.company || !facts.length) throw new Error('Company and at least one URL-backed fact are required.');
  const prompt = 'Write a short, human B2B outreach email for Brain Station 23. Use only the supplied facts. Do not invent proof, outcomes, partner tiers, or certifications. Do not use em dashes. Company: ' + input.company + '. Industry: ' + (input.industry || 'unknown') + '. Problem: ' + (input.problem || 'unknown') + '. Facts: ' + JSON.stringify(facts.map(x => ({ claim: x.claim, url: x.url })));
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + (env.GEMINI_MODEL || 'gemini-3.6-flash') + ':generateContent?key=' + encodeURIComponent(env.GEMINI_API_KEY), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
  const result = await response.json();
  if (!response.ok) throw new Error('Gemini generation failed.');
  return { agent_id: 'communication', draft: result.candidates?.[0]?.content?.parts?.[0]?.text || 'No draft returned.' };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: headers(env) });
    if (!authorized(request, env)) return json({ error: 'Unauthorized' }, env, 401);
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') return json({ status: 'ok', agents: agents.map(x => x.id) }, env);
    if (request.method !== 'POST') return json({ error: 'Not found' }, env, 404);
    try {
      const input = await request.json();
      if (url.pathname === '/v1/agents') return json({ agents }, env);
      if (url.pathname === '/v1/route') return json({ route: routeRequest(input.request) }, env);
      if (url.pathname === '/v1/research') return json(research(input.company, input.website), env);
      if (url.pathname === '/v1/meeting-analysis') return json(meeting(input.notes), env);
      if (url.pathname === '/v1/deal-evaluation') return json(deal(input), env);
      if (url.pathname === '/v1/daily-plan') return json(daily(input), env);
      if (url.pathname === '/v1/communication') return json(await communication(input, env), env);
      return json({ error: 'Not found' }, env, 404);
    } catch (error) {
      return json({ error: error.message || 'Request could not be processed.' }, env, 400);
    }
  }
};
