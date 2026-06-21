import type {
  AnalyzedToken,
  ConvertOptions,
  ConvertResult,
  RepresentativeIndex,
} from './types.js';
import { tokenizeForMoraAnalysis } from './tokenize.js';
import { buildMoraForToken } from './mora.js';
import { classifyDisplayForToken } from './classify.js';
import { loadDefaultRepresentativeIndex } from './representative.js';

/**
 * 既定の代表語インデックスを保持するキャッシュ。
 *
 * 現状は guidelineVersion ごとの分離は行わず、
 * 単一インスタンスを再利用する簡易構成とする。
 */
let cachedRepIndex: RepresentativeIndex | null = null;

/**
 * 変換処理で利用する代表語インデックスを取得する。
 *
 * 現状は組み込み代表語ソースから 1 度だけ読み込み、
 * 以後はキャッシュ済みインスタンスを再利用する。
 *
 * @param guidelineVersion ガイドライン版
 * @returns 利用可能な代表語インデックス
 */
export async function getGlobalRepresentativeIndex(
  guidelineVersion: string
): Promise<RepresentativeIndex> {
  if (cachedRepIndex) {
    return cachedRepIndex;
  }

  cachedRepIndex = loadDefaultRepresentativeIndex();
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
export function applyLongTokenPolicy(
  token: AnalyzedToken,
  maxTokenLength: number
): AnalyzedToken {
  if (
    token.kind !== 'JP_ROMAJI' ||
    token.scope !== 'APPLICABLE' ||
    token.raw.length <= maxTokenLength
  ) {
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
export function getImplementationVersion(): string {
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
export async function convertText(
  input: string,
  options: ConvertOptions = {}
): Promise<ConvertResult> {
  // 既定値を補完する
  const guidelineVersion = options.guidelineVersion ?? '3.0';
  const fieldType = options.fieldType ?? 'body';
  const maxTokenLength = options.maxTokenLength ?? 128;

  // 代表語インデックスを取得する
  const repIndex = await getGlobalRepresentativeIndex(guidelineVersion);

  // tokenize -> mora -> long-token policy -> classify の順に処理する
  let tokens = tokenizeForMoraAnalysis(input, fieldType);
  tokens = tokens.map(buildMoraForToken);
  tokens = tokens.map((token) => applyLongTokenPolicy(token, maxTokenLength));
  tokens = tokens.map((token) => classifyDisplayForToken(token, repIndex));

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