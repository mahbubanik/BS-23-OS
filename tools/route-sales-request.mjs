import fs from 'node:fs';
const registry = JSON.parse(fs.readFileSync(new URL('../agents/registry.json', import.meta.url)));
const request = process.argv.slice(2).join(' ').trim().toLowerCase();
if (!request) throw new Error('Usage: node tools/route-sales-request.mjs "Research Petromax"');
const selected = registry.agents.find(agent => agent.triggers.some(trigger => request.includes(trigger.toLowerCase()))) || registry.agents.find(agent => agent.id === 'account_intelligence');
console.log(JSON.stringify({ request, route: selected.id, mode: selected.mode, reads: selected.reads, writes: selected.writes, guardrail: registry.router.rule }, null, 2));
