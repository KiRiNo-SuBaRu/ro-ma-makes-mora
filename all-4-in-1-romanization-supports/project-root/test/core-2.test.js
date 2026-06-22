'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  settings,
  normalizeMaxLength,
  analyzeWord,
  convertText,
} = require('../core-2.js');

function withMaxLength(value, fn) {
  const prev = settings.maxLength;
  normalizeMaxLength(value);
  try {
    fn();
  } finally {
    settings.maxLength = prev;
  }
}

function pickTokenShape(tokens) {
  return (tokens || []).map((t) => ({
    type: t.type,
    kind: t.kind,
    raw: t.raw,
    mora: t.mora,
  }));
}

function pickMoraShape(moras) {
  return (moras || []).map((m) => {
    if (m && typeof m === 'object') {
      return {
        type: m.type,
        kind: m.kind,
        raw: m.raw,
        mora: m.mora,
      };
    }
    return m;
  });
}

function toSimpleView(items) {
  return (items || [])
    .map((x) => {
      if (x && typeof x === 'object') {
        return `${x.kind || x.type || '?'}:${x.raw || '?'}`;
      }
      return String(x);
    })
    .join(' | ');
}

test('normalizeMaxLength: valid integer updates settings.maxLength', () => {
  const prev = settings.maxLength;
  const actual = normalizeMaxLength(20);

  assert.equal(actual, 20);
  assert.equal(settings.maxLength, 20);

  settings.maxLength = prev;
});

test('normalizeMaxLength: invalid value falls back to default', () => {
  const actual = normalizeMaxLength('abc');

  assert.equal(actual, 32);
  assert.equal(settings.maxLength, 32);
});

test('analyzeWord: oi matches representative', () => {
  const actual = analyzeWord('oi');

  assert.equal(actual.raw, 'oi');
  assert.equal(actual.normalized, 'oi');
  assert.equal(actual.type, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.equal(actual.blockedByLength, false);
  assert.equal(actual.representativeMatched, true);
  assert.equal(actual.representativeKey, 'V:oi');
  assert.equal(actual.result, 'Oi');
  assert.equal(actual.note, '代表語 current 表示を適用');

  assert.ok(Array.isArray(actual.tokens));
  assert.ok(Array.isArray(actual.moras));
  assert.equal(actual.tokens.length, 2);
  assert.equal(actual.moras.length, 2);
});

test('analyzeWord: sieawo matches representative', () => {
  const actual = analyzeWord('sieawo');

  assert.equal(actual.normalized, 'sieawo');
  assert.equal(actual.type, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.equal(actual.representativeMatched, true);
  assert.equal(actual.representativeKey, 'V:sieawo');
  assert.equal(actual.result, 'SieAWo');
  assert.equal(actual.note, '代表語 current 表示を適用');

  assert.ok(Array.isArray(actual.tokens));
  assert.ok(Array.isArray(actual.moras));
});

test('analyzeWord: Nippon matches representative', () => {
  const actual = analyzeWord('Nippon');

  assert.equal(actual.raw, 'Nippon');
  assert.equal(actual.normalized, 'nippon');
  assert.equal(actual.type, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.equal(actual.representativeMatched, true);
  assert.equal(actual.representativeKey, 'N:nippon');
  assert.equal(actual.result, 'NipPon');
  assert.equal(actual.note, '代表語 current 表示を適用');

  assert.ok(Array.isArray(actual.tokens));
  assert.ok(Array.isArray(actual.moras));
});

test('analyzeWord: ToU matches representative', () => {
  const actual = analyzeWord('ToU');

  assert.equal(actual.raw, 'ToU');
  assert.equal(actual.normalized, 'tou');
  assert.equal(actual.type, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.equal(actual.representativeMatched, true);
  assert.equal(actual.representativeKey, 'V:tou');
  assert.equal(actual.result, 'ToU');
  assert.equal(actual.note, '代表語 current 表示を適用');
});

test('analyzeWord: latin word is non applicable', () => {
  const actual = analyzeWord('English');

  assert.equal(actual.raw, 'English');
  assert.equal(actual.normalized, 'english');
  assert.equal(actual.type, 'LATIN_WORD');
  assert.equal(actual.scope, 'NON_APPLICABLE');
  assert.equal(actual.blockedByLength, false);
  assert.equal(actual.representativeMatched, false);
  assert.equal(actual.representativeKey, undefined);
  assert.equal(actual.result, 'English');
  assert.equal(actual.note, 'JP_ROMAJI ではないため非変換');

  assert.deepEqual(actual.tokens, []);
  assert.deepEqual(actual.moras, []);
});

test('convertText: representative sample passes', () => {
  const actual = convertText('Sumutokoro Nippon ToU');
  assert.equal(actual, 'SuMuToKoRo NipPon ToU');
});

test('convertText: latin no becomes No near JP_ROMAJI token', () => {
  const actual = convertText('Nippon no ToU');
  assert.equal(actual, 'NipPon No ToU');
});

test('convertText: latin no stays no when isolated from JP_ROMAJI', () => {
  const actual = convertText('English no boat');
  assert.equal(actual, 'English no boat');
});

test('analyzeWord: long token is blocked by maxLength', () => {
  withMaxLength(3, () => {
    const actual = analyzeWord('ToU');

    assert.equal(actual.raw, 'ToU');
    assert.equal(actual.normalized, 'tou');
    assert.equal(actual.type, 'JP_ROMAJI');
    assert.equal(actual.scope, 'NON_APPLICABLE');
    assert.equal(actual.blockedByLength, true);
    assert.equal(actual.representativeMatched, false);
    assert.equal(actual.representativeKey, undefined);
    assert.equal(actual.result, 'ToU');
    assert.equal(actual.note, '長大トークン閾値により非変換');
  });
});

test('analyzeWord: Nippon tokens shape is stable', () => {
  const actual = analyzeWord('Nippon');
  const tokenShape = pickTokenShape(actual.tokens);

  assert.ok(tokenShape.length > 0);
  assert.match(toSimpleView(actual.tokens), /nip|ni|po|pon|n/i);
});

test('analyzeWord: Nippon moras shape is stable', () => {
  const actual = analyzeWord('Nippon');
  const moraShape = pickMoraShape(actual.moras);

  assert.ok(moraShape.length > 0);

  if (moraShape[0] && typeof moraShape[0] === 'object') {
    assert.match(toSimpleView(actual.moras), /nip|ni|pon|po|n/i);
  } else {
    assert.deepEqual(actual.moras, ['Nip', 'Pon']);
  }
});

test('analyzeWord: Nippon simple token view is non empty', () => {
  const actual = analyzeWord('Nippon');
  const simple = toSimpleView(actual.tokens);

  assert.equal(typeof simple, 'string');
  assert.notEqual(simple, '');
});

test('analyzeWord: Nippon simple mora view is non empty', () => {
  const actual = analyzeWord('Nippon');
  const simple = toSimpleView(actual.moras);

  assert.equal(typeof simple, 'string');
  assert.notEqual(simple, '');
});

test('analyzeWord: Sumutokoro result is stable', () => {
  const actual = analyzeWord('Sumutokoro');

  assert.equal(actual.raw, 'Sumutokoro');
  assert.equal(actual.normalized, 'sumutokoro');
  assert.equal(actual.type, 'JP_ROMAJI');
  assert.equal(actual.scope, 'APPLICABLE');
  assert.equal(actual.blockedByLength, false);
  assert.equal(actual.result, 'SuMuToKoRo');
});

test('analyzeWord: Sumutokoro tokens shape is stable', () => {
  const actual = analyzeWord('Sumutokoro');
  const tokenShape = pickTokenShape(actual.tokens);

  assert.ok(tokenShape.length > 0);

  const simple = toSimpleView(actual.tokens);
  assert.equal(typeof simple, 'string');
  assert.notEqual(simple, '');
  assert.match(simple, /su|mu|to|ko|ro/i);
});

test('analyzeWord: Sumutokoro moras shape is stable', () => {
  const actual = analyzeWord('Sumutokoro');
  const moraShape = pickMoraShape(actual.moras);

  assert.ok(moraShape.length > 0);

  if (moraShape[0] && typeof moraShape[0] === 'object') {
    const simple = toSimpleView(actual.moras);
    assert.match(simple, /su|mu|to|ko|ro/i);
  } else {
    assert.deepEqual(actual.moras, [
      'Su',
      'Mu',
      'To',
      'Ko',
      'Ro',
    ]);
  }
});

test('analyzeWord: ToU representative path stays applied by default', () => {
  const actual = analyzeWord('ToU');

  assert.equal(actual.normalized, 'tou');
  assert.equal(actual.representativeMatched, true);
  assert.equal(actual.representativeKey, 'V:tou');
  assert.equal(actual.result, 'ToU');
});

test('analyzeWord: ToU becomes blocked before representative when maxLength is 3', () => {
  withMaxLength(3, () => {
    const actual = analyzeWord('ToU');

    assert.equal(actual.normalized, 'tou');
    assert.equal(actual.blockedByLength, true);
    assert.equal(actual.scope, 'NON_APPLICABLE');
    assert.equal(actual.representativeMatched, false);
    assert.equal(actual.result, 'ToU');
  });
});

test('convertText: sample sentence remains stable', () => {
  const actual = convertText('Sumutokoro Nippon ToU');
  assert.equal(actual, 'SuMuToKoRo NipPon ToU');
});

test('convertText: punctuation mixed sample converts core words', () => {
  const actual = convertText('Nippon, ToU.');
  assert.equal(actual, 'NipPon, ToU.');
});

test('convertText: punctuation around JP_ROMAJI word is preserved', () => {
  const actual = convertText('(Nippon)');
  assert.equal(actual, '(NipPon)');
});

test('convertText: no rule still works across punctuation-separated words', () => {
  const actual = convertText('Nippon, no ToU.');
  assert.equal(actual, 'NipPon, No ToU.');
});

test('convertText: punctuation only token remains stable', () => {
  const actual = convertText('...');
  assert.equal(actual, '...');
});

test('convertText: surrounding spaces are preserved', () => {
  const actual = convertText(' Sumutokoro Nippon ');
  assert.equal(actual, ' SuMuToKoRo NipPon ');
});