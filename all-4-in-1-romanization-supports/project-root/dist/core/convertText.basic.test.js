"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const convert_js_1 = require("../core/convert.js");
(0, node_test_1.default)('convertText: returns basic result shape and meta', async () => {
    const result = await (0, convert_js_1.convertText)('ToU', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(result.input, 'ToU');
    strict_1.default.equal(typeof result.output, 'string');
    strict_1.default.equal(Array.isArray(result.tokens), true);
    strict_1.default.equal(typeof result.meta, 'object');
    strict_1.default.equal(result.meta.guidelineVersion, '3.0');
    strict_1.default.equal(typeof result.meta.implementationVersion, 'string');
    strict_1.default.equal(typeof result.meta.executedAt, 'string');
});
(0, node_test_1.default)('convertText: preserves spaces and punctuation in joined output', async () => {
    const result = await (0, convert_js_1.convertText)('ToU, Nippon', {
        guidelineVersion: '3.0',
        fieldType: 'body',
        maxTokenLength: 128
    });
    strict_1.default.equal(typeof result.output, 'string');
    strict_1.default.equal(result.tokens.length > 0, true);
    strict_1.default.equal(result.output.includes(','), true);
    strict_1.default.equal(result.output.includes(' '), true);
});
