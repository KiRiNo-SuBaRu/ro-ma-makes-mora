import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('convertText: long token policy should keep raw token unchanged', async () => {
  const result = await convertText('Sumutokoro', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 3
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].raw, 'Sumutokoro');
  assert.equal(result.tokens[0].scope, 'NON_APPLICABLE');
  assert.equal(result.tokens[0].output, 'Sumutokoro');
  assert.equal(result.output, 'Sumutokoro');
});

test('convertText: representative token should also be blocked by long token policy', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 3
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].raw, 'Nippon');
  assert.equal(result.tokens[0].scope, 'NON_APPLICABLE');
  assert.equal(result.tokens[0].output, 'Nippon');
  assert.equal(result.output, 'Nippon');
});