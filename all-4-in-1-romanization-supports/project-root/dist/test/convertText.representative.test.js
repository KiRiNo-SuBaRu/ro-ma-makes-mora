import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('convertText: representative V should keep ToU as current display', async () => {
  const result = await convertText('ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].raw, 'ToU');
  assert.equal(result.tokens[0].kind, 'JP_ROMAJI');
  assert.equal(result.tokens[0].scope, 'APPLICABLE');
  assert.equal(result.tokens[0].output, 'ToU');
  assert.equal(result.output, 'ToU');
});

test('convertText: representative N should convert Nippon to NipPon', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].raw, 'Nippon');
  assert.equal(result.tokens[0].kind, 'JP_ROMAJI');
  assert.equal(result.tokens[0].scope, 'APPLICABLE');
  assert.equal(result.tokens[0].output, 'NipPon');
  assert.equal(result.output, 'NipPon');
});

test('convertText: representative tokens should work in a sentence', async () => {
  const result = await convertText('Sumutokoro Nippon ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens[0].raw, 'Sumutokoro');
  assert.equal(result.tokens[2].raw, 'Nippon');
  assert.equal(result.tokens[4].raw, 'ToU');

  assert.equal(result.tokens[2].output, 'NipPon');
  assert.equal(result.tokens[4].output, 'ToU');
});