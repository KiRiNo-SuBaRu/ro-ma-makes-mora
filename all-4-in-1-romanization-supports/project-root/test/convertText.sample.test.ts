// test/convertText.sample.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { convertText } from '../src/core/convert.js';

test('convertText: basic V/N representatives (Sumutokoro Nippon ToU)', async () => {
  const input = 'Sumutokoro Nippon ToU';

  const result = await convertText(input, {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  // 全体出力
  assert.equal(
    result.output,
    'SuMuToKoRo NipPon ToU',
    'output should apply generic mora caps + representative words for Nippon/ToU'
  );

  // トークン数確認（"Sumutokoro", " ", "Nippon", " ", "ToU"）
  assert.equal(result.tokens.length, 5);

  const [t0, t1, t2, t3, t4] = result.tokens;

  // t0: Sumutokoro（代表語ではない）
  assert.equal(t0.raw, 'Sumutokoro');
  assert.equal(t0.kind, 'JP_ROMAJI');
  assert.equal(t0.scope, 'APPLICABLE');
  assert.equal(t0.output, 'SuMuToKoRo');
  assert.equal(t0.decision?.effectiveRole, 'extension');

  // t1: SPACE
  assert.equal(t1.kind, 'SPACE');
  assert.equal(t1.scope, 'NON_APPLICABLE');

  // t2: Nippon → NipPon（N 代表語）
  assert.equal(t2.raw, 'Nippon');
  assert.equal(t2.kind, 'JP_ROMAJI');
  assert.equal(t2.scope, 'APPLICABLE');
  assert.equal(t2.output, 'NipPon');
  assert.equal(t2.decision?.representativeKey, 'N:nippon');
  assert.equal(t2.decision?.effectiveRole, 'current');

  // t3: SPACE
  assert.equal(t3.kind, 'SPACE');
  assert.equal(t3.scope, 'NON_APPLICABLE');

  // t4: ToU（V 代表語）
  assert.equal(t4.raw, 'ToU');
  assert.equal(t4.kind, 'JP_ROMAJI');
  assert.equal(t4.scope, 'APPLICABLE');
  assert.equal(t4.output, 'ToU');
  assert.equal(t4.decision?.representativeKey, 'V:tou');
  assert.equal(t4.decision?.effectiveRole, 'current');

  // meta
  assert.equal(result.meta.guidelineVersion, '3.0');
});

test('convertText: MIXED token should be NON_APPLICABLE and unchanged', async () => {
  const input = '山NipponX';

  const result = await convertText(input, {
    guidelineVersion: '3.0',
    fieldType: 'body'
  });

  assert.equal(result.output, '山NipponX');
  assert.equal(result.tokens.length, 1);

  const t0 = result.tokens[0];
  assert.equal(t0.raw, '山NipponX');
  assert.equal(t0.kind, 'MIXED');
  assert.equal(t0.scope, 'NON_APPLICABLE');
  assert.equal(t0.output, '山NipponX');
});

test('convertText: long JP_ROMAJI token should be NON_APPLICABLE by length policy', async () => {
  const longToken = 'a'.repeat(20);
  const input = longToken;

  const result = await convertText(input, {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 10
  });

  assert.equal(result.output, longToken);
  assert.equal(result.tokens.length, 1);

  const t0 = result.tokens[0];
  // detectTokenKind の判定次第で JP_ROMAJI か LATIN_WORD になるが、
  // ここでは scope が NON_APPLICABLE になっていることだけを確認する。
  assert.equal(t0.scope, 'NON_APPLICABLE');
  assert.equal(t0.output, longToken);
});