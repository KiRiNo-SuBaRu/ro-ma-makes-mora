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
 * 文脈上スキップ可能なトークンかどうかを判定する。
 *
 * no 文脈補正では、SPACE と PUNCT を飛ばして
 * 前後の意味的なトークンを探索する。
 *
 * @param token 判定対象トークン
 * @returns スキップ可能なら true
 */
export function isSkippableContextToken(
  token: AnalyzedToken | undefined
): boolean {
  return !!(
    token &&
    (token.kind === 'SPACE' || token.kind === 'PUNCT')
  );
}

/**
 * JP_ROMAJI かつ APPLICABLE なトークンかどうかを判定する。
 *
 * @param token 判定対象トークン
 * @returns 条件を満たすなら true
 */
export function isApplicableJpRomajiToken(
  token: AnalyzedToken | undefined
): boolean {
  return !!(
    token &&
    token.kind === 'JP_ROMAJI' &&
    token.scope === 'APPLICABLE'
  );
}

/**
 * 指定位置より前方で、文脈上意味を持つ最初のトークンを返す。
 *
 * SPACE / PUNCT は読み飛ばす。
 *
 * @param tokens 解析済みトークン列
 * @param startIndex 起点インデックス
 * @returns 見つかったトークン。なければ undefined
 */
export function findPreviousMeaningfulToken(
  tokens: AnalyzedToken[],
  startIndex: number
): AnalyzedToken | undefined {
  for (let i = startIndex - 1; i >= 0; i -= 1) {
    const token = tokens[i];

    if (isSkippableContextToken(token)) {
      continue;
    }

    return token;
  }

  return undefined;
}

/**
 * 指定位置より後方で、文脈上意味を持つ最初のトークンを返す。
 *
 * SPACE / PUNCT は読み飛ばす。
 *
 * @param tokens 解析済みトークン列
 * @param startIndex 起点インデックス
 * @returns 見つかったトークン。なければ undefined
 */
export function findNextMeaningfulToken(
  tokens: AnalyzedToken[],
  startIndex: number
): AnalyzedToken | undefined {
  for (let i = startIndex + 1; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (isSkippableContextToken(token)) {
      continue;
    }

    return token;
  }

  return undefined;
}

/**
 * token 列に対して、文脈依存の表示補正を適用する。
 *
 * 現在は LATIN_WORD の "no" についてのみ扱い、
 * 前後の意味的トークンに JP_ROMAJI + APPLICABLE が存在する場合は
 * output を "No" に補正する。
 *
 * @param tokens 表示分類後のトークン列
 * @returns 文脈補正後のトークン列
 */
export function applyContextualDisplayAdjustments(
  tokens: AnalyzedToken[]
): AnalyzedToken[] {
  return tokens.map((token, index) => {
    if (
      token.kind !== 'LATIN_WORD' ||
      token.raw.toLowerCase() !== 'no'
    ) {
      return token;
    }

    const prev = findPreviousMeaningfulToken(tokens, index);
    const next = findNextMeaningfulToken(tokens, index);

    if (
      isApplicableJpRomajiToken(prev) ||
      isApplicableJpRomajiToken(next)
    ) {
      return {
        ...token,
        output: 'No',
        decision: {
          ...token.decision,
          note: 'JP_ROMAJI 隣接文脈により "no" を "No" として表示した',
        },
      };
    }

    return token;
  });
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
 * 処理は tokenize → mora → long-token policy → classify →
 * contextual-adjustment → join の順で行い、
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
  const guidelineVersion = options.guidelineVersion ?? '3.0';
  const fieldType = options.fieldType ?? 'body';
  const maxTokenLength = options.maxTokenLength ?? 128;

  const repIndex = await getGlobalRepresentativeIndex(guidelineVersion);

  let tokens = tokenizeForMoraAnalysis(input, fieldType);
  tokens = tokens.map(buildMoraForToken);
  tokens = tokens.map((token) => applyLongTokenPolicy(token, maxTokenLength));
  tokens = tokens.map((token) => classifyDisplayForToken(token, repIndex));
  tokens = applyContextualDisplayAdjustments(tokens);

  const output = tokens.map((token) => token.output).join('');

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