/* Assembles context-grounded communication drafts using BS23 knowledge, voice rules, and account intelligence.
   Mode: draft-only. Nothing sends automatically. */
import fs from 'node:fs/promises';

const voiceRegisters = {
  proposal: 'formal', deck: 'deck', outreach: 'conversational', social: 'conversational', internal: 'direct'
};

export function findRelevantProof(knowledge, { industry, geography, problem } = {}) {
  if (!knowledge?.odooClients) return [];
  const terms = [industry, geography, problem].filter(Boolean).map(t => t.toLowerCase());
  if (!terms.length) return knowledge.odooClients.filter(c => c.outcome).slice(0, 3);
  return knowledge.odooClients.filter(client => {
    const haystack = [client.industry, client.geography, client.solution, client.complexity, client.outcome].filter(Boolean).join(' ').toLowerCase();
    return terms.some(term => haystack.includes(term));
  }).slice(0, 5);
}

export function findRelevantComplexity(knowledge, problem) {
  if (!knowledge?.complexityPatterns || !problem) return [];
  const key = problem.toLowerCase();
  const matches = [];
  for (const [pattern, clients] of Object.entries(knowledge.complexityPatterns)) {
    if (key.includes(pattern.replace(/([A-Z])/g, ' $1').toLowerCase()) || pattern.toLowerCase().includes(key)) {
      matches.push({ pattern, clients });
    }
  }
  return matches;
}

export function buildCommunicationDraft(intent, context, knowledge, companyKnowledge) {
  if (!intent) throw new Error('Intent is required (e.g. "cold-email", "follow-up", "pitch", "linkedin", "objection-response", "internal-summary").');
  const register = voiceRegisters[intent] || voiceRegisters[context?.register] || 'conversational';
  const proofs = findRelevantProof(knowledge, context);
  const complexityMatches = findRelevantComplexity(knowledge, context?.problem);
  // Build positioning from safe claims
  const positioning = knowledge?.safePositioning || [];
  // Assemble credibility stack (deploy 3-5 per the voice rules)
  const credibility = (companyKnowledge?.credibilityStack || []).filter(c => !c.caveat || !c.caveat.includes('unconfirmed')).slice(0, 4).map(c => c.claim);
  // Voice guidance
  const voice = companyKnowledge?.voiceRules || {};
  const verificationFlags = knowledge?.doNotClaimWithoutCurrentVerification || [];
  return {
    agent_id: 'communication',
    entity_type: 'draft',
    entity_id: null,
    intent,
    register,
    context: {
      targetCompany: context?.company || null,
      targetIndustry: context?.industry || null,
      targetGeography: context?.geography || null,
      targetProblem: context?.problem || null,
      dealStage: context?.dealStage || null,
      previousInteraction: context?.previousInteraction || null
    },
    grounding: {
      positioning,
      credibilityStack: credibility,
      relevantProof: proofs.map(p => ({
        client: p.client, industry: p.industry, solution: p.solution,
        complexity: p.complexity, outcome: p.outcome
      })),
      complexityPatterns: complexityMatches,
      proofCount: proofs.length
    },
    voiceGuidance: {
      register,
      standardIntro: register === 'formal' ? voice.standardIntro : null,
      standardClosing: register === 'formal' ? voice.standardClosing : null,
      proofFirst: voice.proofFirst || 'Open with a named client precedent, not a generic module list.',
      credibilityDeployment: voice.credibilityDeployment || 'Deploy 3-5 credibility stack claims per piece.'
    },
    guardrails: verificationFlags,
    recommended_actions: [
      proofs.length ? `Use ${proofs[0].client} as the lead proof point.` : 'No matching proof found. Use general BS23 positioning.',
      'Check guardrails before finalizing: do not claim partner tier, unverified CMMI, or undocumented client details.',
      register === 'formal' ? 'Apply BS23 proposal voice with standard intro/closing templates.' : 'Keep conversational. Proof-first, not feature-first.'
    ]
  };
}

export async function generateCommunicationContent(draft, { geminiFn } = {}) {
  const ask = geminiFn || (await import('../integrations/gemini-client.mjs')).askGemini;
  
  const systemInstruction = `You are an elite B2B enterprise software sales copywriter at Brain Station 23.
STRICT WRITING RULES:
1. NO EM DASHES. Never use em dashes (— or –). Use commas, periods, or parentheses instead.
2. Ground everything in the supplied Brain Station 23 client proofs and positioning.
3. Be short, human, natural, specific, and non-generic.
4. Respect all guardrails: do NOT claim an Odoo partner tier (Ready/Silver/Gold), do NOT claim CMMI status, and do NOT invent client outcomes.
5. If writing cold emails, write a 3-step sequence: Email 1 (Proof-first observation), Email 2 (Follow-up with workflow question), Email 3 (Short bump).
6. If writing a proposal or pitch, use the specified register.`;

  const prompt = `Generate the communication copy for intent: "${draft.intent}" (register: ${draft.register}).

Target Context:
Company: ${draft.context.targetCompany || 'Target Prospect'}
Industry: ${draft.context.targetIndustry || 'Not specified'}
Geography: ${draft.context.targetGeography || 'Not specified'}
Problem: ${draft.context.targetProblem || 'Operational friction'}

Grounded Brain Station 23 Proof Points:
${JSON.stringify(draft.grounding.relevantProof, null, 2)}

Credibility Stack:
${draft.grounding.credibilityStack.join(', ')}

Guardrails to respect:
${draft.guardrails.join('; ')}

Voice Guidance:
${JSON.stringify(draft.voiceGuidance, null, 2)}

Produce the complete ready-to-use communication text.`;

  const response = await ask({ prompt, systemInstruction });
  return {
    ...draft,
    generatedContent: response.text
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const intent = process.argv[2];
  const contextPath = process.argv[3];
  const generateFlag = process.argv.includes('--gemini') || process.argv.includes('--generate');
  if (!intent) throw new Error('Usage: node tools/build-communication-draft.mjs <intent> [context.json] [--gemini]');
  const knowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-erp-knowledge.json', import.meta.url), 'utf8'));
  const companyKnowledge = JSON.parse(await fs.readFile(new URL('../config/bs23-company-knowledge.json', import.meta.url), 'utf8'));
  const context = (contextPath && !contextPath.startsWith('--')) ? JSON.parse(await fs.readFile(contextPath, 'utf8')) : {};
  const draft = buildCommunicationDraft(intent, context, knowledge, companyKnowledge);
  if (generateFlag) {
    const enriched = await generateCommunicationContent(draft);
    console.log(JSON.stringify(enriched, null, 2));
  } else {
    console.log(JSON.stringify(draft, null, 2));
  }
}

