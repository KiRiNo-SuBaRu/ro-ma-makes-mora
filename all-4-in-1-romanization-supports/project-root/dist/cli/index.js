#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = require("node:process");
const convert_js_1 = require("../core/convert.js");
function printHelp() {
    node_process_1.stdout.write([
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
    ].join('\n'));
}
function fail(message) {
    node_process_1.stderr.write(`${message}\n`);
    (0, node_process_1.exit)(1);
}
function parseArgs(args) {
    const textParts = [];
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
async function readStdin() {
    const chunks = [];
    for await (const chunk of node_process_1.stdin) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length === 0) {
        return '';
    }
    return Buffer.concat(chunks)
        .toString('utf8')
        .replace(/\r\n/g, '\n');
}
function stripLeadingBom(text) {
    return text.replace(/^\uFEFF/, '');
}
async function main() {
    const parsed = parseArgs(node_process_1.argv.slice(2));
    if (parsed.mode.kind === 'help') {
        printHelp();
        return;
    }
    const textFromArgs = parsed.mode.text;
    const rawText = textFromArgs !== '' ? textFromArgs : await readStdin();
    const text = stripLeadingBom(rawText);
    if (text === '') {
        printHelp();
        return;
    }
    const result = await (0, convert_js_1.convertText)(text);
    if (typeof result.output !== 'string') {
        fail('convertText() result does not contain string output');
    }
    node_process_1.stdout.write(`${result.output}\n`);
}
main().catch((err) => {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    node_process_1.stderr.write(`${message}\n`);
    (0, node_process_1.exit)(1);
});
