"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const convert_js_1 = require("../core/convert.js");
(0, node_test_1.default)('regression: Nippon should be treated as JP_ROMAJI in body field', async () => {
    const result = await (0, convert_js_1.convertText)('Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].kind, 'JP_ROMAJI', 'Nippon must not be classified as LATIN_WORD in body field');
    strict_1.default.equal(result.tokens[0].scope, 'APPLICABLE', 'JP_ROMAJI token in body field must remain APPLICABLE');
});
(0, node_test_1.default)('regression: Nippon current display should be applied after token analysis', async () => {
    const result = await (0, convert_js_1.convertText)('Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens[0].output, 'NipPon', 'Representative current display must be applied to Nippon');
    strict_1.default.equal(result.output, 'NipPon');
});
(0, node_test_1.default)('regression: mixed sentence should preserve representative outputs', async () => {
    const result = await (0, convert_js_1.convertText)('abc Nippon xyz ToU', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length > 0, true);
    strict_1.default.equal(result.output.includes('NipPon'), true);
    strict_1.default.equal(result.output.includes('ToU'), true);
});
