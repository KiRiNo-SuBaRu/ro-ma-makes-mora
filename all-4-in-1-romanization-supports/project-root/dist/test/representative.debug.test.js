import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadDefaultRepresentativeIndex,
  mapRowToEntry,
} from '../core/representative.js';

test('mapRowToEntry: input is normalized and key is generated', () => {
  const actual = mapRowToEntry({
    category: 'N',
    input: 'Nippon',
    current: 'NipPon',
    scopeFlag: 'required',
    phase: 'extension',
  });

  assert.equal(actual.inputNormalized, 'nippon');
  assert.equal(actual.key, 'N:nippon');
  assert.equal(actual.current, 'NipPon');
});

test('loadDefaultRepresentativeIndex: nippon is registered', () => {
  const repIndex = loadDefaultRepresentativeIndex();
  const actual = repIndex.findByInput('nippon');

  assert.ok(actual);
  assert.equal(actual?.category, 'N');
  assert.equal(actual?.current, 'NipPon');
  assert.equal(actual?.scopeFlag, 'required');
});

test('loadDefaultRepresentativeIndex: tou is registered', () => {
  const repIndex = loadDefaultRepresentativeIndex();
  const actual = repIndex.findByInput('tou');

  assert.ok(actual);
  assert.equal(actual?.category, 'V');
  assert.equal(actual?.current, 'ToU');
  assert.equal(actual?.scopeFlag, 'required');
});