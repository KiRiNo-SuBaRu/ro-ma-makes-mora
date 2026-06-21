// --------------------------------------------------
// 入力・トークン分類
// --------------------------------------------------

/**
 * 入力文字列が属するフィールド種別。
 *
 * フィールド種別により、モーラ変換の適用可否が変わる。
 */
export type FieldType =
  | 'body'
  | 'title'
  | 'id'
  | 'checksum'
  | 'metadata'
  | 'other';

/**
 * トークンの文字種・用途に基づく分類。
 */
export type TokenKind =
  | 'SPACE'
  | 'JP_ROMAJI'
  | 'LATIN_WORD'
  | 'MIXED'
  | 'PUNCT'
  | 'UNKNOWN';

/**
 * トークンに対して変換を適用できるかどうかを表す分類。
 */
export type ScopeKind =
  | 'APPLICABLE'
  | 'NON_APPLICABLE'
  | 'ERROR';

/**
 * 代表語・仕様拡張の適用範囲を表すフラグ。
 */
export type ScopeFlag =
  | 'required'
  | 'extension'
  | 'candidate'
  | 'history';

/**
 * 代表語ルールのフェーズ状態。
 */
export type Phase =
  | 'extension'
  | 'promoted-to-required'
  | 'retired';

// --------------------------------------------------
// モーラ解析
// --------------------------------------------------

/**
 * モーラ分解前の最小単位トークン種別。
 */
export type MoraTokenKind =
  | 'CV'
  | 'CyV'
  | 'V'
  | 'N'
  | 'Q'
  | 'C?';

/**
 * モーラ構築後の単位種別。
 */
export type MoraUnitKind =
  | 'CV'
  | 'CyV'
  | 'V'
  | 'N'
  | 'QCV'
  | 'QCyV'
  | 'OTHER';

/**
 * モーラ分解時に得られる最小単位トークン。
 */
export interface MoraToken {
  /**
   * トークン種別。
   */
  kind: MoraTokenKind;

  /**
   * 入力文字列から切り出した元の表記。
   */
  raw: string;
}

/**
 * 表示分類や要約処理に用いるモーラ単位。
 */
export interface MoraUnit {
  /**
   * モーラ単位種別。
   */
  kind: MoraUnitKind;

  /**
   * モーラ単位としての元表記。
   */
  raw: string;
}

/**
 * モーラ列に含まれる特徴の要約情報。
 */
export interface MoraSummary {
  /**
   * Q 系モーラを含むかどうか。
   */
  hasQ: boolean;

  /**
   * V 系モーラを含むかどうか。
   */
  hasV: boolean;

  /**
   * N 系モーラを含むかどうか。
   */
  hasN: boolean;

  /**
   * OTHER を含むかどうか。
   */
  hasOther?: boolean;

  /**
   * 含まれているカテゴリ一覧。
   */
  categories: string[];
}

// --------------------------------------------------
// 解析結果と変換結果
// --------------------------------------------------

/**
 * 1 トークン分のコア解析結果。
 *
 * トークン文字列、モーラ分解結果、表示結果などを保持する。
 */
export interface CoreAnalysis {
  /**
   * 解析対象の元文字列。
   */
  text: string;

  /**
   * 主カテゴリ。
   */
  category: string;

  /**
   * MoraToken 列。
   */
  tokens: MoraToken[];

  /**
   * MoraUnit 列。
   */
  moras: MoraUnit[];

  /**
   * 表示分類後の結果文字列。
   */
  result: string;

  /**
   * モーラ要約情報。
   */
  moraSummary: MoraSummary;
}

/**
 * 表示分類に至った判断経路を記録するトレース情報。
 */
export interface DecisionTrace {
  /**
   * 参照した代表語キー。
   */
  representativeKey?: string;

  /**
   * 適用された scope-flag。
   */
  scopeFlag?: ScopeFlag;

  /**
   * 適用された phase。
   */
  phase?: Phase;

  /**
   * 判定に用いたカテゴリ。
   */
  category?: string;

  /**
   * 表示上の実効ロール。
   */
  effectiveRole?: 'current' | 'candidate' | 'history' | 'extension';

  /**
   * 補足メモ。
   */
  note?: string;
}

/**
 * tokenize 以降の処理対象となる解析済みトークン。
 */
export interface AnalyzedToken {
  /**
   * 元の生文字列。
   */
  raw: string;

  /**
   * トークン種別。
   */
  kind: TokenKind;

  /**
   * 適用可否。
   */
  scope: ScopeKind;

  /**
   * コア解析結果。
   */
  core?: CoreAnalysis;

  /**
   * 約物情報。
   */
  punct?: string;

  /**
   * 最終的に連結へ渡す出力文字列。
   */
  output: string;

  /**
   * 判断経路の記録。
   */
  decision?: DecisionTrace;
}

/**
 * 変換処理に渡すオプション。
 */
export interface ConvertOptions {
  /**
   * ガイドライン版。
   */
  guidelineVersion?: string;

  /**
   * 入力フィールド種別。
   */
  fieldType?: FieldType;

  /**
   * 長大トークン判定に用いる最大文字数。
   */
  maxTokenLength?: number;
}

/**
 * 変換処理のメタ情報。
 */
export interface ConvertMeta {
  /**
   * 使用したガイドライン版。
   */
  guidelineVersion: string;

  /**
   * 実装バージョン。
   */
  implementationVersion: string;

  /**
   * 実行時刻。
   */
  executedAt: string;
}

/**
 * 変換処理の最終結果。
 */
export interface ConvertResult {
  /**
   * 入力文字列。
   */
  input: string;

  /**
   * 最終出力文字列。
   */
  output: string;

  /**
   * 中間・最終状態を含むトークン列。
   */
  tokens: AnalyzedToken[];

  /**
   * 実行メタ情報。
   */
  meta: ConvertMeta;
}

// --------------------------------------------------
// 代表語インデックス
// --------------------------------------------------

/**
 * 代表語ソースの 1 行分を表すデータ。
 */
export interface RepresentativeSourceRow {
  /**
   * 対象カテゴリ。
   */
  category: string;

  /**
   * 入力語。
   */
  input: string;

  /**
   * current 表示。
   */
  current: string;

  /**
   * history 表示。
   */
  history?: string;

  /**
   * scope-flag。
   */
  scopeFlag: ScopeFlag;

  /**
   * phase。
   */
  phase: Phase;
}

/**
 * 代表語ソース全体を表すデータ。
 */
export interface RepresentativeSource {
  /**
   * 代表語ソース行の配列。
   */
  rows: RepresentativeSourceRow[];
}

/**
 * 検索用に正規化した代表語エントリ。
 */
export interface RepresentativeEntry {
  /**
   * 一意キー。
   */
  key: string;

  /**
   * 対象カテゴリ。
   */
  category: string;

  /**
   * 小文字正規化した入力語。
   */
  inputNormalized: string;

  /**
   * current 表示。
   */
  current: string;

  /**
   * history 表示。
   */
  history?: string;

  /**
   * scope-flag。
   */
  scopeFlag: ScopeFlag;

  /**
   * phase。
   */
  phase: Phase;
}

/**
 * 代表語インデックスの共通インターフェース。
 */
export interface RepresentativeIndex {
  /**
   * 正規化済み入力語から代表語エントリを取得する。
   *
   * @param normalizedInput 小文字正規化した入力語
   * @returns 対応する代表語エントリ。未登録なら null
   */
  findByInput(normalizedInput: string): RepresentativeEntry | null;

  /**
   * インデックス件数などの統計情報を返す。
   */
  stats(): { total: number };
}