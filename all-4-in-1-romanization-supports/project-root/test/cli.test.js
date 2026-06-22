'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

test('cli: converts direct argument text', () => {
  const out = execFileSync(
    process.execPath,
    ['cli.js', 'Sumutokoro Nippon ToU'],
    { encoding: 'utf8' }
  );

  assert.equal(out.trim(), 'SuMuToKoRo NipPon ToU');
});

test('cli: converts with --max-length option', () => {
  const out = execFileSync(
    process.execPath,
    ['cli.js', '--max-length', '20', 'Nippon ToU'],
    { encoding: 'utf8' }
  );

  assert.equal(out.trim(), 'NipPon ToU');
});

test('cli: prints help with --help', () => {
  const out = execFileSync(
    process.execPath,
    ['cli.js', '--help'],
    { encoding: 'utf8' }
  );

  assert.match(out, /Usage:/);
});