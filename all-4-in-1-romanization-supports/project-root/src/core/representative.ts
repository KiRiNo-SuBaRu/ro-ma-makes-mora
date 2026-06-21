import type {
  RepresentativeEntry,
  RepresentativeIndex,
  RepresentativeSource,
  RepresentativeSourceRow,
} from './types.js';

/**
 * 代表語ソースの読み込み方法を指定するオプション。
 */
export interface LoadRepresentativeOptions {
  /**
   * 読み込み対象の絞り込み条件。
   *
   * - all: すべての行を対象にする
   * - no-history: history を除外する
   * - required-only: required のみを対象にする
   */
  filter?: 'all' | 'no-history' | 'required-only';
}

/**
 * 代表語エントリをメモリ上に保持する簡易インデックス。
 *
 * 入力語を小文字正規化したキーで保持し、
 * classify フェーズから current 表示などを引けるようにする。
 */
export class InMemoryRepresentativeIndex implements RepresentativeIndex {
  private readonly byInput = new Map<string, RepresentativeEntry>();

  /**
   * 代表語エントリ配列からインデックスを構築する。
   *
   * @param entries 取り込み対象の代表語エントリ配列
   */
  constructor(entries: RepresentativeEntry[]) {
    for (const entry of entries) {
      this.byInput.set(entry.inputNormalized, entry);
    }
  }

  /**
   * 正規化済み入力語に対応する代表語エントリを取得する。
   *
   * @param normalizedInput 小文字化などの正規化を行った入力語
   * @returns 対応する代表語エントリ。未登録の場合は null
   */
  findByInput(normalizedInput: string): RepresentativeEntry | null {
    return this.byInput.get(normalizedInput) ?? null;
  }

  /**
   * インデックスの保持件数を返す。
   *
   * @returns 件数情報
   */
  stats(): { total: number } {
    return {
      total: this.byInput.size,
    };
  }
}

/**
 * 代表語ソースの 1 行を、検索用の代表語エントリへ変換する。
 *
 * @param row 代表語ソースの 1 行
 * @returns 検索用に正規化した代表語エントリ
 */
export function mapRowToEntry(
  row: RepresentativeSourceRow
): RepresentativeEntry {
  const inputNormalized = row.input.toLowerCase();

  return {
    key: `${row.category}:${inputNormalized}`,
    category: row.category,
    inputNormalized,
    current: row.current,
    history: row.history,
    scopeFlag: row.scopeFlag,
    phase: row.phase,
  };
}

/**
 * 代表語ソースを読み込み、メモリ上の代表語インデックスを構築する。
 *
 * filter オプションに応じて対象行を絞り込んだうえで、
 * RepresentativeEntry に変換してインデックス化する。
 *
 * @param source 代表語ソース
 * @param options 読み込みオプション
 * @returns メモリ上の代表語インデックス
 */
export function loadRepresentativeRules(
  source: RepresentativeSource,
  options: LoadRepresentativeOptions = {}
): InMemoryRepresentativeIndex {
  const filter = options.filter ?? 'all';

  const filteredRows = source.rows.filter(
    (row: RepresentativeSourceRow) => {
      if (filter === 'required-only') {
        return row.scopeFlag === 'required';
      }

      if (filter === 'no-history') {
        return row.scopeFlag !== 'history';
      }

      return true;
    }
  );

  const entries = filteredRows.map(
    (row: RepresentativeSourceRow) => mapRowToEntry(row)
  );

  return new InMemoryRepresentativeIndex(entries);
}

/**
 * 組み込みの代表語ソース。
 *
 * 現時点では最小限のサンプルデータをコード内に保持する。
 * 将来的に外部ファイル化する場合でも、読み込み側の窓口は
 * loadRepresentativeRules に揃える想定とする。
 */
export const defaultRepresentativeSource: RepresentativeSource = {
  rows: [
    {
      category: 'V',
      input: 'tou',
      current: 'ToU',
      history: 'Tou',
      scopeFlag: 'required',
      phase: 'extension',
    },
    {
      category: 'N',
      input: 'nippon',
      current: 'NipPon',
      scopeFlag: 'required',
      phase: 'extension',
    },
    {
      category: 'V',
      input: 'io',
      current: 'Io',
      scopeFlag: 'candidate',
      phase: 'extension',
    },
    {
      category: 'V',
      input: 'ua',
      current: 'Ua',
      scopeFlag: 'candidate',
      phase: 'extension',
    },
  ],
};

/**
 * 組み込み代表語ソースから既定のインデックスを生成する。
 *
 * @returns 既定の代表語インデックス
 */
export function loadDefaultRepresentativeIndex():
  InMemoryRepresentativeIndex {
  return loadRepresentativeRules(defaultRepresentativeSource, {
    filter: 'all',
  });
}