// tests/cliRunner.js
'use strict';

const path = require('path');
const { spawn } = require('child_process');

function runCli({
  args = [],
  input = '',
  env = {},
} = {}) {
  return new Promise((resolve, reject) => {
    const nodePath = process.execPath;
    const cliPath = path.resolve(__dirname, '..', 'src', 'cli.js');

    const child = spawn(nodePath, [cliPath, ...args], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

module.exports = {
  runCli,
};