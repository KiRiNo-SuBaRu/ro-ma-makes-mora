#!/usr/bin/env node

import {
  stdin as input,
  stdout as output,
  stderr as error,
  argv,
  exit,
} from 'node:process';
import { convertText } from '../core/convert.js';

type CliMode =
  | { kind: 'help' }
  | { kind: 'convert'; text: string };

interface ParsedArgs {
  mode: CliMode;
}

function printHelp(): void {
  output.write(
    [
      'Usage:',
      '  subaru-roma-mora [text]',
      '  echo <text> | subaru-roma-mora',
      '',
      'Options:',
      '  --help, -h   Show this help',
      '',
      'Examples:',
      '  subaru-roma-mora "Sumutokoro Nippon ToU"',
      '  echo "Nippon, no ToU." | subaru-roma-mora',
      '',
    ].join('\n')
  );
}

function fail(message: string): never {
  error.write(`${message}\n`);
  exit(1);
}

function parseArgs(args: string[]): ParsedArgs {
  const textParts: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      return {
        mode: { kind: 'help' },
      };
    }

    textParts.push(arg);
  }

  return {
    mode: {
      kind: 'convert',
      text: textParts.join(' '),
    },
  };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of input) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return '';
  }

  return Buffer.concat(chunks)
    .toString('utf8')
    .replace(/\r\n/g, '\n');
}

function stripLeadingBom(text: string): string {
  return text.replace(/^\uFEFF/, '');
}

async function main(): Promise<void> {
  const parsed = parseArgs(argv.slice(2));

  if (parsed.mode.kind === 'help') {
    printHelp();
    return;
  }

  const textFromArgs = parsed.mode.text;
  const rawText =
    textFromArgs !== '' ? textFromArgs : await readStdin();

  const text = stripLeadingBom(rawText);

  if (text === '') {
    printHelp();
    return;
  }

  const result = await convertText(text);

  if (typeof result.output !== 'string') {
    fail('convertText() result does not contain string output');
  }

  output.write(`${result.output}\n`);
}

main().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.stack || err.message : String(err);
  error.write(`${message}\n`);
  exit(1);
});