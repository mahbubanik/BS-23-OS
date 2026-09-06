/* Builds a deterministic meeting-prep draft from minimized Outlook context and one reviewed Account. */
import fs from 'node:fs/promises';
import { safeMeetingContext } from './prepare-meeting-context.mjs';

export function buildMeetingPrep(event, account) {
  const meeting = safeMeetingContext(event);
  if (!account?.company) throw new Error('A selected Account with a company name is required.');
  const facts = (account.evidence || []).filter(item => item.classification === 'FACT' && item.claim).map(item => item.claim);
  const unknowns = account.unknowns?.length ? account.unknowns : ['current ERP/system', 'operational pain', 'decision process', 'next trigger'];
  const hypotheses = [];
  if (account.operationalComplexity) hypotheses.push(`Validate whether ${account.operationalComplexity} creates inventory, order, or finance hand-off friction.`);
  if (account.erpStatus) hypotheses.push(`Clarify how ${account.erpStatus} supports current growth and where work remains manual.`);
  if (!hypotheses.length) hypotheses.push('Do not assume a pain; ask the owner to describe the current workflow and its cost.');
  return {
    agent_id: 'meeting_copilot', entity_type: 'meeting', entity_id: null, meeting, account: { company: account.company, website: account.website || null },
    facts, inferences: hypotheses, unknowns, evidence_ids: [],
    recommended_actions: ['Confirm the meeting objective and the operational owner.', 'Ask one workflow question before presenting an Odoo solution.', 'Capture confirmed needs and commitments for approval after the meeting.']
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const eventPath = process.argv[2], accountPath = process.argv[3];
  if (!eventPath || !accountPath) throw new Error('Usage: node tools/build-meeting-prep-draft.mjs event.json account.json');
  const [event, account] = await Promise.all([fs.readFile(eventPath, 'utf8'), fs.readFile(accountPath, 'utf8')]);
  console.log(JSON.stringify(buildMeetingPrep(JSON.parse(event), JSON.parse(account)), null, 2));
}
