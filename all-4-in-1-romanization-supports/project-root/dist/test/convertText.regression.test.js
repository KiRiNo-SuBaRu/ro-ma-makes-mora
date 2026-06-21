import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('regression: Nippon should be treated as JP_ROMAJI in body field', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length, 1);
  assert.equal(
    result.tokens[0].kind,
    'JP_ROMAJI',
    'Nippon must not be classified as LATIN_WORD in body field'
  );
  assert.equal(
    result.tokens[0].scope,
    'APPLICABLE',
    'JP_ROMAJI token in body field must remain APPLICABLE'
  );
});

test('regression: Nippon current display should be applied after token analysis', async () => {
  const result = await convertText('Nippon', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(
    result.tokens[0].output,
    'NipPon',
    'Representative current display must be applied to Nippon'
  );
  assert.equal(result.output, 'NipPon');
});

test('regression: mixed sentence should preserve representative outputs', async () => {
  const result = await convertText('abc Nippon xyz ToU', {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  assert.equal(result.tokens.length > 0, true);
  assert.equal(result.output.includes('NipPon'), true);
  assert.equal(result.output.includes('ToU'), true);
});