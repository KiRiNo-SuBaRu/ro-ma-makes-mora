"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalRepresentativeIndex = getGlobalRepresentativeIndex;
exports.applyLongTokenPolicy = applyLongTokenPolicy;
exports.getImplementationVersion = getImplementationVersion;
exports.convertText = convertText;
const tokenize_js_1 = require("./tokenize.js");
const mora_js_1 = require("./mora.js");
const classify_js_1 = require("./classify.js");
const representative_js_1 = require("./representative.js");
/**
 * 既定の代表語インデックスを保持するキャッシュ。
 *
 * 現状は guidelineVersion ごとの分離は行わず、
 * 単一インスタンスを再利用する簡易構成とする。
 */
let cachedRepIndex = null;
/**
 * 変換処理で利用する代表語インデックスを取得する。
 *
 * 現状は組み込み代表語ソースから 1 度だけ読み込み、
 * 以後はキャッシュ済みインスタンスを再利用する。
 *
 * @param guidelineVersion ガイドライン版
 * @returns 利用可能な代表語インデックス
 */
async function getGlobalRepresentativeIndex(guidelineVersion) {
    if (cachedRepIndex) {
        return cachedRepIndex;
    }
    cachedRepIndex = (0, representative_js_1.loadDefaultRepresentativeIndex)();
    return cachedRepIndex;
}
/**
 * 長大トークンに対する非適用ポリシーを適用する。
 *
 * JP_ROMAJI かつ APPLICABLE のトークンで、
 * 生文字列長が maxTokenLength を超える場合は
 * NON_APPLICABLE として元の文字列を保持する。
 *
 * @param token 解析済みトークン
 * @param maxTokenLength 長大トークン判定に用いる上限値
 * @returns 長大トークン判定後のトークン
 */
function applyLongTokenPolicy(token, maxTokenLength) {
    if (token.kind !== 'JP_ROMAJI' ||
        token.scope !== 'APPLICABLE' ||
        token.raw.length <= maxTokenLength) {
        return token;
    }
    return {
        ...token,
        scope: 'NON_APPLICABLE',
        output: token.raw,
        decision: {
            ...token.decision,
            note: `length policy applied: raw length ${token.raw.length} > ${maxTokenLength}`,
        },
    };
}
/**
 * 実装バージョン文字列を返す。
 *
 * @returns 実装バージョン
 */
function getImplementationVersion() {
    return '0.1.0';
}
/**
 * 入力文字列を、すばる式ローマ字モーラ表記へ変換する。
 *
 * 処理は tokenize → mora → long-token policy → classify → join の順で行い、
 * 最終的な出力文字列、トークン列、実行メタ情報を返す。
 *
 * @param input 変換対象の入力文字列
 * @param options 変換オプション
 * @returns 変換結果
 */
async function convertText(input, options = {}) {
    // 既定値を補完する
    const guidelineVersion = options.guidelineVersion ?? '3.0';
    const fieldType = options.fieldType ?? 'body';
    const maxTokenLength = options.maxTokenLength ?? 128;
    // 代表語インデックスを取得する
    const repIndex = await getGlobalRepresentativeIndex(guidelineVersion);
    // tokenize -> mora -> long-token policy -> classify の順に処理する
    let tokens = (0, tokenize_js_1.tokenizeForMoraAnalysis)(input, fieldType);
    tokens = tokens.map(mora_js_1.buildMoraForToken);
    tokens = tokens.map((token) => applyLongTokenPolicy(token, maxTokenLength));
    tokens = tokens.map((token) => (0, classify_js_1.classifyDisplayForToken)(token, repIndex));
    // 各トークンの出力を連結して最終文字列を得る
    const output = tokens.map((token) => token.output).join('');
    // 出力と実行メタ情報を返す
    return {
        input,
        output,
        tokens,
        meta: {
            guidelineVersion,
            implementationVersion: getImplementationVersion(),
            executedAt: new Date().toISOString(),
        },
    };
}
