import type {
  AnalyzedToken,
  CoreAnalysis,
  RepresentativeIndex,
  ScopeFlag,
} from './types.js';

/**
 * scope-flag から実効的な表示上の役割を決定する。
 *
 * required は current 表示として扱い、
 * candidate / history / extension はその区分に応じた役割へ写像する。
 *
 * @param scopeFlag scope-flag の値
 * @returns 表示分類で利用する実効ロール
 */
export function decideEffectiveRoleFromScopeFlag(
  scopeFlag: ScopeFlag
): 'current' | 'candidate' | 'history' | 'extension' {
  if (scopeFlag === 'required') {
    return 'current';
  }

  if (scopeFlag === 'candidate') {
    return 'candidate';
  }

  if (scopeFlag === 'history') {
    return 'history';
  }

  return 'extension';
}

/**
 * 代表語に該当しない語へ、汎用モーラ大文字化を適用する。
 *
 * 各モーラ単位の先頭文字を大文字化し、
 * それ以外を小文字化して連結する。
 *
 * @param core モーラ解析済みのコア情報
 * @returns 汎用モーラ大文字化後の表示文字列
 */
export function applyGenericMoraCapitalization(
  core: CoreAnalysis
): string {
  return core.moras
    .map((mora) => {
      const raw = mora.raw;
      return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * 解析済みトークンに対して表示分類を適用する。
 *
 * JP_ROMAJI かつ APPLICABLE で、かつ core を持つトークンのみを対象とする。
 * 代表語インデックスに current 表示が存在する場合はそれを優先し、
 * ヒットしない場合は汎用モーラ大文字化を適用する。
 *
 * @param token 解析済みトークン
 * @param repIndex 代表語インデックス
 * @returns 表示分類後のトークン
 */
export function classifyDisplayForToken(
  token: AnalyzedToken,
  repIndex: RepresentativeIndex
): AnalyzedToken {
  // 対象外トークンはそのまま返す
  if (
    token.kind !== 'JP_ROMAJI' ||
    token.scope !== 'APPLICABLE' ||
    !token.core
  ) {
    return token;
  }

  const normalized = token.core.text.toLowerCase();
  const representative = repIndex.findByInput(normalized);

  // 代表語 current がある場合はその表示を優先する
  if (representative?.current) {
    const effectiveRole = decideEffectiveRoleFromScopeFlag(
      representative.scopeFlag
    );

    return {
      ...token,
      core: {
        ...token.core,
        result: representative.current,
      },
      output: representative.current,
      decision: {
        representativeKey: representative.key,
        scopeFlag: representative.scopeFlag,
        phase: representative.phase,
        category: representative.category,
        effectiveRole,
        note: '代表語インデックスの current 表示を適用した',
      },
    };
  }

  // 代表語未登録の場合は汎用モーラ大文字化へフォールバックする
  const genericResult = applyGenericMoraCapitalization(token.core);

  return {
    ...token,
    core: {
      ...token.core,
      result: genericResult,
    },
    output: genericResult,
    decision: {
      representativeKey: undefined,
      scopeFlag: 'extension',
      phase: 'extension',
      category: 'OTHER',
      effectiveRole: 'extension',
      note: '代表語未登録のため汎用モーラ大文字化を適用した',
    },
  };
}