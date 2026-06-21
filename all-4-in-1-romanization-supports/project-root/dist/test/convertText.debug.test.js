import test from 'node:test';
import assert from 'node:assert/strict';

import {
  convertText,
  getGlobalRepresentativeIndex,
} from '../core/convert.js';

test('getGlobalRepresentativeIndex: returns cached instance', async () => {
  const a = await getGlobalRepresentativeIndex('3.0');
  const b = await getGlobalRepresentativeIndex('3.0');

  assert.equal(a, b);
});

test('convertText: Nippon should become NipPon', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128,
  });

  assert.equal(result.output, 'NipPon');
  assert.equal(result.tokens[0].output, 'NipPon');
});

test('convertText: ToU should stay ToU', async () => {
  const result = await convertText('ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128,
  });

  assert.equal(result.output, 'ToU');
  assert.equal(result.tokens[0].output, 'ToU');
});

test('convertText: Sumutokoro Nippon ToU', async () => {
  const result = await convertText('Sumutokoro Nippon ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128,
  });

  assert.equal(result.tokens[0].raw, 'Sumutokoro');
  assert.equal(result.tokens[0].kind, 'JP_ROMAJI');
  assert.equal(result.tokens[0].scope, 'APPLICABLE');

  assert.equal(result.tokens[2].raw, 'Nippon');
  assert.equal(result.tokens[2].output, 'NipPon');

  assert.equal(result.tokens[4].raw, 'ToU');
  assert.equal(result.tokens[4].output, 'ToU');
});