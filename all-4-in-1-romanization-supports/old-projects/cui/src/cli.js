#!/usr/bin/env node
'use strict';

const {
  settings,
  normalizeMaxLength,
  convertText,
} = require('./core');
const { getMessages } = require('./i18n');
const { spawnSync } = require('child_process');

/* =====================================================
 * detectLangFromCodePage
 * chcp の出力からコードページを取得し、
 * 932 or 65001 を日本語とみなす。
 * ===================================================== */
function detectLangFromCodePage() {
  try {
    const result = spawnSync('chcp', [], { encoding: 'utf8' });
    if (result.status !== 0) return 'en';
    const m = result.stdout && result.stdout.match(/(\d+)/);
    if (!m) return 'en';
    const cp = parseInt(m[1], 10);
    if (cp === 932 || cp === 65001) return 'ja';
    return 'en';
  } catch {
    return 'en';
  }
}

/* =====================================================
 * parseArgs
 * -L, --lang, -h/--help を解析する簡易パーサ。
 * ===================================================== */
function parseArgs(argv) {
  const args = argv.slice(2);
  let langOpt = null;
  let maxLengthOpt = null;
  let showHelp = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') {
      showHelp = true;
    } else if (a === '--lang') {
      langOpt = args[i + 1];
      i++;
    } else if (a === '-L') {
      maxLengthOpt = args[i + 1];
      i++;
    }
  }

  return { langOpt, maxLengthOpt, showHelp };
}

/* =====================================================
 * main
 * ===================================================== */
function main() {
  const { langOpt, maxLengthOpt, showHelp } =
    parseArgs(process.argv);

  const lang = (langOpt === 'ja' || langOpt === 'en')
    ? langOpt
    : detectLangFromCodePage();
  const msg = getMessages(lang);

  if (showHelp) {
    process.stdout.write(msg.help + '\r\n');
    process.exit(0);
  }

  if (maxLengthOpt != null) {
    const normalized = normalizeMaxLength(maxLengthOpt);
    const rawNum = Number(maxLengthOpt);
    if (
      !Number.isFinite(rawNum) ||
      !Number.isInteger(rawNum) ||
      rawNum < 1 ||
      rawNum > 200
    ) {
      process.stderr.write(msg.invalidL + '\r\n');
    }
    settings.maxLength = normalized;
  }

  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    data += chunk;
  });
  process.stdin.on('end', () => {
    const result = convertText(data);
    process.stdout.write(result);
  });

  if (process.stdin.isTTY) {
    process.stdin.emit('end');
  }
}

if (require.main === module) {
  main();
}