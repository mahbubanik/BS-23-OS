import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { askGemini } from '../integrations/gemini-client.mjs';

describe('Gemini client integration', () => {
  it('throws when GEMINI_API_KEY is missing', async () => {
    await assert.rejects(
      () => askGemini({ prompt: 'test', env: {} }),
      /GEMINI_API_KEY is missing/
    );
  });

  it('throws when prompt is missing', async () => {
    await assert.rejects(
      () => askGemini({ prompt: '', env: { GEMINI_API_KEY: 'test-key' } }),
      /Prompt is required/
    );
  });

  it('calls Gemini API endpoint with correct payload and returns text', async () => {
    let capturedUrl = '';
    let capturedBody = null;

    const mockFetch = async (url, options) => {
      capturedUrl = url;
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: { parts: [{ text: 'Odoo modules: Sales, Inventory, POS' }] },
              finishReason: 'STOP'
            }
          ]
        })
      };
    };

    const res = await askGemini({
      prompt: 'What modules for retail?',
      systemInstruction: 'You are an ERP expert.',
      env: { GEMINI_API_KEY: 'mock-key-123' },
      fetchFn: mockFetch
    });

    assert.ok(capturedUrl.includes('mock-key-123'));
    assert.equal(capturedBody.contents[0].parts[0].text, 'What modules for retail?');
    assert.equal(capturedBody.systemInstruction.parts[0].text, 'You are an ERP expert.');
    assert.equal(res.text, 'Odoo modules: Sales, Inventory, POS');
  });

  it('handles API error responses properly', async () => {
    const mockFetchError = async () => ({
      ok: false,
      status: 403,
      text: async () => 'API key invalid'
    });

    await assert.rejects(
      () => askGemini({
        prompt: 'test',
        env: { GEMINI_API_KEY: 'bad-key' },
        fetchFn: mockFetchError
      }),
      /Gemini API request failed \(403\): API key invalid/
    );
  });
});

console.log('# Gemini client checks passed.');
