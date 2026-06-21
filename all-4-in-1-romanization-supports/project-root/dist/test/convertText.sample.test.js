// dist/test/convertText.sample.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { convertText } from '../core/convert.js';

test('convertText: basic V/N representatives (Sumutokoro Nippon ToU)', async () => {
  const input = 'Sumutokoro Nippon ToU';

  const result = await convertText(input, {
    guidelineVersion: '3.0',
    fieldType: 'body',
    maxTokenLength: 128
  });

  // 1) まず全体は「少なくとも代表語だけ変わっているか」を見る
  assert.equal(
    result.tokens[2].output,
    'NipPon',
    'Nippon should be converted to NipPon via representative index'
  );

  assert.equal(
    result.tokens[4].output,
    'ToU',
    'ToU representative should stay ToU'
  );

  // 2) Sumutokoro については、まず is JP_ROMAJI & APPLICABLE だけ確認
  const t0 = result.tokens[0];
  assert.equal(t0.raw, 'Sumutokoro');
  assert.equal(t0.kind, 'JP_ROMAJI');
  assert.equal(t0.scope, 'APPLICABLE');

  // 出力のスタイル（SuMuToKoRo か Sumutokoro か）は、
  // 後で applyGenericMoraCapitalization の仕様確定後に詰める
});