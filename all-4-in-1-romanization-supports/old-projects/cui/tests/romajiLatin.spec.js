// tests/romajiLatin.spec.js
'use strict';

const { runCli } = require('./cliRunner');

describe('CUI: JP_ROMAJI vs LATIN_WORD', () => {
  test('TC-040: boat nylon (no decoration)', async () => {
    const { code, stdout } = await runCli({
      input: 'boat nylon\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe('boat nylon');
  });

  test('TC-041: ou / ai / ei group', async () => {
    const { code, stdout } = await runCli({
      input:
        'gakkou gyoukai kaihatu seisyohou yasai\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe(
      'GakKoU GyoUKaI KaIHaTu SeISyoHoU YaSaI'
    );
  });
});