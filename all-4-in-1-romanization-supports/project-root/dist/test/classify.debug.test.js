import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenizeForMoraAnalysis } from '../core/tokenize.js';
import { buildMoraForToken } from '../core/mora.js';
import { classifyDisplayForToken } from '../core/classify.js';
import { loadDefaultRepresentativeIndex } from '../core/representative.js';

test('classifyDisplayForToken: Nippon should become NipPon', () => {
  const token = tokenizeForMoraAnalysis('Nippon', 'body')[0];
  const moraBuilt = buildMoraForToken(token);
  const repIndex = loadDefaultRepresentativeIndex();

  const actual = classifyDisplayForToken(moraBuilt, repIndex);

  assert.equal(actual.kind, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.ok(actual.core);
  assert.equal(actual.output, 'NipPon');
  assert.equal(actual.core?.result, 'NipPon');
  assert.equal(actual.decision?.representativeKey, 'N:nippon');
});

test('classifyDisplayForToken: ToU should stay ToU as representative', () => {
  const token = tokenizeForMoraAnalysis('ToU', 'body')[0];
  const moraBuilt = buildMoraForToken(token);
  const repIndex = loadDefaultRepresentativeIndex();

  const actual = classifyDisplayForToken(moraBuilt, repIndex);

  assert.equal(actual.output, 'ToU');
  assert.equal(actual.core?.result, 'ToU');
  assert.equal(actual.decision?.representativeKey, 'V:tou');
});

test('classifyDisplayForToken: generic path should produce mora capitalization', () => {
  const token = tokenizeForMoraAnalysis('Sumutokoro', 'body')[0];
  const moraBuilt = buildMoraForToken(token);
  const repIndex = loadDefaultRepresentativeIndex();

  const actual = classifyDisplayForToken(moraBuilt, repIndex);

  assert.equal(actual.kind, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.ok(actual.core);
  assert.equal(actual.output, 'SuMuToKoRo');
});