/* Gemini API Client for Sales OS Intelligence.
   Uses GEMINI_API_KEY from environment or local .env.
   Uses native fetch, zero third-party dependencies. */
import { loadLocalEnv } from '../tools/local-env.mjs';

const DEFAULT_MODEL = 'gemini-3.6-flash';

export async function askGemini({
  prompt,
  systemInstruction = '',
  model = process.env.GEMINI_MODEL || DEFAULT_MODEL,
  env = null,
  fetchFn = fetch
} = {}) {
  const activeEnv = env !== null ? env : { ...process.env, ...(await loadLocalEnv()) };
  const apiKey = activeEnv.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please add GEMINI_API_KEY to your .env file.');
  }

  if (!prompt) {
    throw new Error('Prompt is required.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map(part => part.text).join('') || '';

  return {
    text,
    model,
    finishReason: candidate?.finishReason || 'STOP',
    raw: data
  };
}

if (process.argv[1] && new URL(`file:${process.argv[1]}`).href === import.meta.url) {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.error('Usage: node integrations/gemini-client.mjs "What are key Odoo modules for retail?"');
    process.exit(1);
  }
  try {
    const result = await askGemini({ prompt });
    console.log(result.text);
  } catch (err) {
    console.error('Gemini error:', err.message);
  }
}
