import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectTokenKind,
  decideScopeKind,
  splitIntoRawSegments,
  tokenizeForMoraAnalysis,
} from '../core/tokenize.js';

test('splitIntoRawSegments: punctuation and spaces are split', () => {
  const actual = splitIntoRawSegments('Nippon, 山NipponX ToU');

  assert.deepEqual(
    actual,
    ['Nippon', ',', ' ', '山NipponX', ' ', 'ToU']
  );
});

test('detectTokenKind: Nippon should be JP_ROMAJI', () => {
  assert.equal(detectTokenKind('Nippon'), 'JP_ROMAJI');
});

test('detectTokenKind: ToU should be JP_ROMAJI', () => {
  assert.equal(detectTokenKind('ToU'), 'JP_ROMAJI');
});

test('detectTokenKind: mixed kanji + latin should be MIXED', () => {
  assert.equal(detectTokenKind('山NipponX'), 'MIXED');
});

test('decideScopeKind: JP_ROMAJI in body should be APPLICABLE', () => {
  assert.equal(decideScopeKind('JP_ROMAJI', 'body'), 'APPLICABLE');
});

test('decideScopeKind: JP_ROMAJI in id should be NON_APPLICABLE', () => {
  assert.equal(decideScopeKind('JP_ROMAJI', 'id'), 'NON_APPLICABLE');
});

test('tokenizeForMoraAnalysis: Nippon and ToU stay applicable in body', () => {
  const tokens = tokenizeForMoraAnalysis('Sumutokoro Nippon ToU', 'body');

  assert.equal(tokens[0].raw, 'Sumutokoro');
  assert.equal(tokens[0].kind, 'JP_ROMAJI');
  assert.equal(tokens[0].scope, 'APPLICABLE');

  assert.equal(tokens[2].raw, 'Nippon');
  assert.equal(tokens[2].kind, 'JP_ROMAJI');
  assert.equal(tokens[2].scope, 'APPLICABLE');

  assert.equal(tokens[4].raw, 'ToU');
  assert.equal(tokens[4].kind, 'JP_ROMAJI');
  assert.equal(tokens[4].scope, 'APPLICABLE');
});