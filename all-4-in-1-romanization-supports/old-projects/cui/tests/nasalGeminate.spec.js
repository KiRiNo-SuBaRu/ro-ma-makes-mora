// tests/nasalGeminate.spec.js
'use strict';

const { runCli } = require('./cliRunner');

describe('CUI: nasal N and geminate Q cases', () => {
  test('TC-050: nippon -> NipPon', async () => {
    const { code, stdout } = await runCli({
      input: 'nippon\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe('NipPon');
  });

  test('TC-051: sin\'ya kin\'youbi', async () => {
    const { code, stdout } = await runCli({
      input: 'sin\'ya kin\'youbi\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe(
      "Sin'Ya KIn'YoUBi"
    );
  });
});