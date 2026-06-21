import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('convertText: id field should mark JP_ROMAJI token as non-applicable', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'id',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].raw, 'Nippon');
  assert.equal(result.tokens[0].scope, 'NON_APPLICABLE');
  assert.equal(result.tokens[0].output, 'Nippon');
  assert.equal(result.output, 'Nippon');
});

test('convertText: checksum field should mark token as non-applicable', async () => {
  const result = await convertText('ToU', {
    guidelineVersion: '3.0',
    fieldType: 'checksum',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(result.tokens[0].scope, 'NON_APPLICABLE');
  assert.equal(result.tokens[0].output, 'ToU');
  assert.equal(result.output, 'ToU');
});

test('convertText: punctuation and spaces should remain non-applicable', async () => {
  const result = await convertText(' , ', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length > 0, true);
  assert.equal(result.output, ' , ');
});