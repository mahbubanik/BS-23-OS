import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createOpportunity } from '../tools/create-opportunity.mjs';

describe('Opportunity creation tool', () => {
  it('throws when name is missing', async () => {
    await assert.rejects(
      () => createOpportunity({
        name: '',
        env: { NOTION_TOKEN: 'test', NOTION_OPPORTUNITIES_DATA_SOURCE_ID: 'test-ds' }
      }),
      /Opportunity name is required/
    );
  });

  it('posts correct payload with account relation', async () => {
    let capturedBody = null;
    const mockFetch = async (url, options) => {
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ id: 'mock-opp-id' })
      };
    };

    const res = await createOpportunity({
      name: 'Test Opp',
      accountPageId: 'acc-123',
      pain: 'Inventory lag',
      stage: 'Discovery',
      env: { NOTION_TOKEN: 'mock-tok', NOTION_OPPORTUNITIES_DATA_SOURCE_ID: 'ds-123' },
      fetchFn: mockFetch
    });

    assert.equal(res.id, 'mock-opp-id');
    assert.equal(capturedBody.properties.Name.title[0].text.content, 'Test Opp');
    assert.equal(capturedBody.properties.Account.relation[0].id, 'acc-123');
    assert.equal(capturedBody.properties.Pain.rich_text[0].text.content, 'Inventory lag');
  });
});

console.log('# Opportunity creation checks passed.');
