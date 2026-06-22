import test from 'node:test';
import assert from 'node:assert/strict';

import { convertText } from '../src/core/convert.js';

test('convertText: punctuation-separated no becomes No near JP_ROMAJI', async () => {
  const result = await convertText('Nippon, no ToU.');

  assert.equal(result.output, 'NipPon, No ToU.');

  const noToken = result.tokens.find(
    (token) => token.raw.toLowerCase() === 'no'
  );

  assert.ok(noToken);
  assert.equal(noToken?.kind, 'LATIN_WORD');
  assert.equal(noToken?.output, 'No');
});

test('convertText: space-separated no becomes No between JP_ROMAJI words', async () => {
  const result = await convertText('Nippon no ToU');

  assert.equal(result.output, 'NipPon No ToU');

  const noToken = result.tokens.find(
    (token) => token.raw.toLowerCase() === 'no'
  );

  assert.ok(noToken);
  assert.equal(noToken?.kind, 'LATIN_WORD');
  assert.equal(noToken?.output, 'No');
});

test('convertText: isolated no stays lowercase', async () => {
  const result = await convertText('no');

  assert.equal(result.output, 'no');

  const noToken = result.tokens.find(
    (token) => token.raw.toLowerCase() === 'no'
  );

  assert.ok(noToken);
  assert.equal(noToken?.kind, 'LATIN_WORD');
  assert.equal(noToken?.output, 'no');
});

test('convertText: latin no latin stays lowercase', async () => {
  const result = await convertText('English no boat');

  assert.equal(result.output, 'English no boat');

  const noToken = result.tokens.find(
    (token) => token.raw.toLowerCase() === 'no'
  );

  assert.ok(noToken);
  assert.equal(noToken?.kind, 'LATIN_WORD');
  assert.equal(noToken?.output, 'no');
});