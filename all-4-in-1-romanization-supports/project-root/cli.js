#!/usr/bin/env node
'use strict';

const { normalizeMaxLength, convertText } = require('./core-2.js');

function printHelp() {
  console.log([
    'Usage:',
    '  node cli.js [--max-length N] "text"',
    '  echo "text" | node cli.js [--max-length N]',
    '',
    'Examples:',
    '  node cli.js "Sumutokoro Nippon ToU"',
    '  node cli.js --max-length 20 "Nippon ToU"',
    '  echo "Sumutokoro Nippon ToU" | node cli.js',
  ].join('\n'));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const textParts = [];
  let maxLength = null;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];

    if (a === '-h' || a === '--help') {
      help = true;
      continue;
    }

    if (a === '--max-length') {
      maxLength = args[i + 1];
      i++;
      continue;
    }

    textParts.push(a);
  }

  return {
    help,
    maxLength,
    text: textParts.join(' ').trim(),
  };
}

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }

    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
  });
}

async function main() {
  const parsed = parseArgs(process.argv);

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  if (parsed.maxLength != null) {
    normalizeMaxLength(parsed.maxLength);
  }

  const stdinText = await readStdin();
  const inputText = parsed.text || stdinText;

  if (!inputText) {
    printHelp();
    process.exit(1);
  }

  const output = convertText(inputText);
  process.stdout.write(output + '\n');
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + '\n');
  process.exit(1);
});