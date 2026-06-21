import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('convertText: returns basic result shape and meta', async () => {
  const result = await convertText('ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.input, 'ToU');
  assert.equal(typeof result.output, 'string');
  assert.equal(Array.isArray(result.tokens), true);
  assert.equal(typeof result.meta, 'object');

  assert.equal(result.meta.guidelineVersion, '3.0');
  assert.equal(typeof result.meta.implementationVersion, 'string');
  assert.equal(typeof result.meta.executedAt, 'string');
});

test('convertText: preserves spaces and punctuation in joined output', async () => {
  const result = await convertText('ToU, Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(typeof result.output, 'string');
  assert.equal(result.tokens.length > 0, true);
  assert.equal(result.output.includes(','), true);
  assert.equal(result.output.includes(' '), true);
});