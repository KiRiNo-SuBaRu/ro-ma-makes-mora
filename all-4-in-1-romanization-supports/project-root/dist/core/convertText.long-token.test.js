"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const convert_js_1 = require("../core/convert.js");
(0, node_test_1.default)('convertText: long token policy should keep raw token unchanged', async () => {
    const result = await (0, convert_js_1.convertText)('Sumutokoro', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 3
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].raw, 'Sumutokoro');
    strict_1.default.equal(result.tokens[0].scope, 'NON_APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'Sumutokoro');
    strict_1.default.equal(result.output, 'Sumutokoro');
});
(0, node_test_1.default)('convertText: representative token should also be blocked by long token policy', async () => {
    const result = await (0, convert_js_1.convertText)('Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 3
    });
    strict_1.default.equal(result.tokens.length, 1);
    strict_1.default.equal(result.tokens[0].raw, 'Nippon');
    strict_1.default.equal(result.tokens[0].scope, 'NON_APPLICABLE');
    strict_1.default.equal(result.tokens[0].output, 'Nippon');
    strict_1.default.equal(result.output, 'Nippon');
});
