// tests/lang.spec.js
'use strict';

const { runCli } = require('./cliRunner');

describe('CUI: language selection (--lang)', () => {
  test('TC-030: --lang ja --help', async () => {
    const { code, stdout } = await runCli({
      args: ['--lang', 'ja', '--help'],
    });

    expect(code).toBe(0);
    expect(stdout).toContain('すばる式ローマ字モーラ強調装飾 CUI 版');
    expect(stdout).toContain('使用法:');
  });

  test('TC-031: --lang en --help', async () => {
    const { code, stdout } = await runCli({
      args: ['--lang', 'en', '--help'],
    });

    expect(code).toBe(0);
    expect(stdout).toContain('SuBaRu-style Romaji Mora Decorator (CUI)');
    expect(stdout).toContain('Usage:');
  });
});