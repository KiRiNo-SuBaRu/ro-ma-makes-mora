// tests/basic.spec.js
'use strict';

const { runCli } = require('./cliRunner');

describe('CUI: basic conversions', () => {
  test('TC-001: gakkou toppu kitteiru', async () => {
    const { code, stdout, stderr } = await runCli({
      input: 'gakkou toppu kitteiru\n',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout.trim()).toBe('GakKoU TopPu KitTeIRu');
  });

  test('TC-002: nippon -> NipPon', async () => {
    const { code, stdout, stderr } = await runCli({
      input: 'nippon\n',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout.trim()).toBe('NipPon');
  });

  test('TC-003: sieawo oi', async () => {
    const { code, stdout, stderr } = await runCli({
      input: 'sieawo oi\n',
    });

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout.trim()).toBe('SieAWo Oi');
  });
});