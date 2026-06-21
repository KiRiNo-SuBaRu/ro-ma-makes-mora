"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const convert_js_1 = require("../core/convert.js");
(0, node_test_1.default)('convertText: representative V should keep ToU as current display', async () => {
    const result = await (0, convert_js_1.convertText)('ToU', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].raw, 'ToU');
    strict_1.default.equal(result.tokens[0].kind, 'JP_ROMAJI');
    strict_1.default.equal(result.tokens[0].scope, 'APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'ToU');
    strict_1.default.equal(result.output, 'ToU');
});
(0, node_test_1.default)('convertText: representative N should convert Nippon to NipPon', async () => {
    const result = await (0, convert_js_1.convertText)('Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].raw, 'Nippon');
    strict_1.default.equal(result.tokens[0].kind, 'JP_ROMAJI');
    strict_1.default.equal(result.tokens[0].scope, 'APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'NipPon');
    strict_1.default.equal(result.output, 'NipPon');
});
(0, node_test_1.default)('convertText: representative tokens should work in a sentence', async () => {
    const result = await (0, convert_js_1.convertText)('Sumutokoro Nippon ToU', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens[0].raw, 'Sumutokoro');
    strict_1.default.equal(result.tokens[2].raw, 'Nippon');
    strict_1.default.equal(result.tokens[4].raw, 'ToU');
    strict_1.default.equal(result.tokens[2].output, 'NipPon');
    strict_1.default.equal(result.tokens[4].output, 'ToU');
});
