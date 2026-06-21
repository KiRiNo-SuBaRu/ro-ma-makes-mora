// tests/contextNo.spec.js
'use strict';

const { runCli } = require('./cliRunner');

describe('CUI: context no correction', () => {
  test('TC-010: gakkou no seikou', async () => {
    const { code, stdout } = await runCli({
      input: 'gakkou no seikou\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe('GakKoU No SeIKoU');
  });

  test('TC-011: Japan no keiei', async () => {
    const { code, stdout } = await runCli({
      input: 'Japan no keiei\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe('Japan No KeIEI');
  });

  test('TC-012: in no case (no correction)', async () => {
    const { code, stdout } = await runCli({
      input: 'in no case\n',
    });

    expect(code).toBe(0);
    expect(stdout.trim()).toBe('in no case');
  });
});