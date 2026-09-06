/* Post-meeting analyzer.
   Parses raw meeting notes, transcripts, or bullets.
   Extracts pains, requirements, stakeholders, next actions, commitments, and unknowns.
   Can enrich using Gemini API when GEMINI_API_KEY is available, or deterministic extraction by default. */
import fs from 'node:fs/promises';
import { askGemini } from '../integrations/gemini-client.mjs';
import { loadLocalEnv } from './local-env.mjs';

export function extractDeterministicMeetingInsights(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Raw meeting notes text is required.');
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const pains = [];
  const requirements = [];
  const stakeholders = [];
  const nextActions = [];
  const commitments = [];
  const systems = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('pain') || lower.includes('problem') || lower.includes('issue') || lower.includes('bottleneck') || lower.includes('friction') || lower.includes('struggle')) {
      pains.push(line);
    }
    if (lower.includes('need') || lower.includes('want') || lower.includes('require') || lower.includes('module') || lower.includes('feature')) {
      requirements.push(line);
    }
    if (lower.includes('cfo') || lower.includes('ceo') || lower.includes('cto') || lower.includes('manager') || lower.includes('director') || lower.includes('head') || lower.includes('champion') || lower.includes('lead')) {
      stakeholders.push(line);
    }
    if (lower.includes('action') || lower.includes('next') || lower.includes('follow up') || lower.includes('todo') || lower.includes('send') || lower.includes('schedule')) {
      nextActions.push(line);
    }
    if (lower.includes('promised') || lower.includes('commit') || lower.includes('agreed') || lower.includes('by tomorrow') || lower.includes('by monday') || lower.includes('by next week')) {
      commitments.push(line);
    }
    if (lower.includes('sap') || lower.includes('odoo') || lower.includes('oracle') || lower.includes('dynamics') || lower.includes('excel') || lower.includes('zoho') || lower.includes('sage')) {
      systems.push(line);
    }
  }

  const unknowns = [];
  if (!stakeholders.length) unknowns.push('Decision maker / budget authority');
  if (!pains.length) unknowns.push('Specific operational pain point');
  if (!systems.length) unknowns.push('Current ERP or accounting software');
  if (!nextActions.length) unknowns.push('Agreed next step or follow-up date');

  return {
    agent_id: 'meeting_copilot',
    entity_type: 'meeting_analysis',
    rawLength: rawText.length,
    pains,
    requirements,
    stakeholders,
    commitments,
    nextActions,
    detectedSystems: systems,
    unknowns,
    recommended_actions: nextActions.length ? nextActions : ['Schedule follow-up to clarify decision process and timeline.']
  };
}

export async function analyzeMeetingNotes(rawText, { useLLM = false } = {}) {
  const deterministicResult = extractDeterministicMeetingInsights(rawText);

  if (!useLLM) {
    return deterministicResult;
  }

  const localEnv = await loadLocalEnv();
  const apiKey = process.env.GEMINI_API_KEY || localEnv.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ...deterministicResult,
      llmEnriched: false,
      note: 'GEMINI_API_KEY not configured. Returned deterministic extraction.'
    };
  }

  const prompt = `Analyze these B2B software sales meeting notes.
Extract a clean JSON object with keys:
- pains: array of string
- requirements: array of string
- stakeholders: array of string
- commitments: array of string
- nextActions: array of string
- currentSystems: array of string
- unknowns: array of string (critical information missing)

Meeting notes:
${rawText}

Return ONLY valid JSON.`;

  try {
    const res = await askGemini({
      prompt,
      systemInstruction: 'You are an executive sales operations assistant analyzing enterprise meeting notes. Return JSON only.'
    });

    const jsonMatch = res.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agent_id: 'meeting_copilot',
        entity_type: 'meeting_analysis',
        llmEnriched: true,
        ...parsed
      };
    }
  } catch (err) {
    // Fall back to deterministic extraction if LLM fails
  }

  return {
    ...deterministicResult,
    llmEnriched: false
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node tools/analyze-meeting-notes.mjs notes.txt [--llm]');
    process.exit(1);
  }
  const content = await fs.readFile(inputPath, 'utf8');
  const useLLM = process.argv.includes('--llm');
  const result = await analyzeMeetingNotes(content, { useLLM });
  console.log(JSON.stringify(result, null, 2));
}
