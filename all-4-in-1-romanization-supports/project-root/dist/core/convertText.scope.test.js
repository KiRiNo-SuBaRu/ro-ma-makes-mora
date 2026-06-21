"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const convert_js_1 = require("../core/convert.js");
(0, node_test_1.default)('convertText: id field should mark JP_ROMAJI token as non-applicable', async () => {
    const result = await (0, convert_js_1.convertText)('Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'id',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].raw, 'Nippon');
    strict_1.default.equal(result.tokens[0].scope, 'NON_APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'Nippon');
    strict_1.default.equal(result.output, 'Nippon');
});
(0, node_test_1.default)('convertText: checksum field should mark token as non-applicable', async () => {
    const result = await (0, convert_js_1.convertText)('ToU', {
        guidelineVersion: '3.0',
        fieldType: 'checksum',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].scope, 'NON_APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'ToU');
    strict_1.default.equal(result.output, 'ToU');
});
(0, node_test_1.default)('convertText: punctuation and spaces should remain non-applicable', async () => {
    const result = await (0, convert_js_1.convertText)(' , ', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.tokens.length > 0, true);
    strict_1.default.equal(result.output, ' , ');
});
