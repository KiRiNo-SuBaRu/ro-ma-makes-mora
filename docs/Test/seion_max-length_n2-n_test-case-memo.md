
# seion＋長大語テストケースも含めて「設定値を変えながら挙動を確認する」テストメモもまとめて

「N → 'n」と長大語閾値オプション L（defaultMaxLength）の両方について、**設定値を変えながら動作確認するためのテストメモ**をまとめます。

---

## 1. 前提条件（実装前提）

- N モーラ表示:
  - `displayMoras` 内で `m.kind === 'N'` のとき、常に `"'n"` を返す。
- 長大語閾値 L:
  - `defaultMaxLength = 32`
  - 有効値: `1 <= L <= 200`
→ それ以外（負の値、0、201 以上、非数値）は 32 にフォールバック。
  - `settings.maxLength = normalizeMaxLength(ユーザ指定 or defaultMaxLength)` を通してから `convertWord` で利用。
- `convertWord`:
  - `type !== JP_ROMAJI` → 装飾せず素通し。
  - `type === JP_ROMAJI` かつ `word.length >= settings.maxLength` → **装飾せず素通し**（tokens/moras は空でもよい）。
  - それ以外 → `tokenizeJP → buildMoras → displayMoras`（単語例外 `oi / sinya / kinyoubi` は現状どおり）。

---

## 2. N → 'n 関連テスト（`seion` を中心に）

### 2.1 基本ケース（標準設定 L = 32）

- 設定:
  - `settings.maxLength = 32`
- 入力:
  - `seion`
- 期待:

| 項目 | 期待値 |
| :-- | :-- |
| type | JP_ROMAJI |
| moras（概念） | `CV:se, V:i, V:o, N` または `se / i / o / N` |
| result | `SeIOn`（末尾 `'n`） |

- チェックポイント:
  - V モーラ例外（`seisyohou` と同系の ei 系一般化）が効いている場合でも、末尾 N は常に `'n` になっているか。
  - `displayMoras` の V 例外ロジックを変えても、N の表示が `'n` のまま崩れていないこと。


### 2.2 他の N 含み語（参考）

- 例: `ginkou`, `minna`, `kan`, `hon`
- 設定:
  - `settings.maxLength = 32`
- 期待:
  - 各語の末尾／語中の N が、すべて `'n` で表示されている（`GiNKoU` 的な形になる想定）。

---

## 3. 長大語閾値 L のテスト

### 3.1 テスト用ダミー語の用意

- 短めの JP_ROMAJI（10文字程度）:
  - `shortword`（仮） → 10 文字
- 長めの JP_ROMAJI（35文字程度）:
  - 例: `aaaaaaaaaabbbbbbbbbbccccccccccddd`（35文字、すべて a〜d で構成）
  - ここでは `longjp35` と呼ぶことにします（実際は任意文字列でよい）。

以降の表では:

- `S = "shortword"`（長さ 10）
- `L35 = "aaaaaaaaaabbbbbbbbbbccccccccccddd"`（長さ 35）

として扱います。

---

### 3.2 normalizeMaxLength の単体テスト

#### 有効値

| 入力値 | normalizeMaxLength の戻り値 | 備考 |
| :-- | :-- | :-- |
| `"1"` | 1 | 最小有効値 |
| `"32"` | 32 | 仕様デフォルトと一致 |
| `"200"` | 200 | 最大有効値 |
| `64` | 64 | 直接数値でも OK |

#### 無効値（32 にフォールバック）

| 入力値 | normalizeMaxLength の戻り値 | 備考 |
| :-- | :-- | :-- |
| `"0"` | 32 | 0 は無効 |
| `"-1"` | 32 | 負の値 |
| `"201"` | 32 | 上限超え |
| `"abc"` | 32 | 非数値 |
| `""` | 32 | 空文字 |
| `null` | 32 | null |
| `undefined` | 32 | 未指定扱い |


---

### 3.3 L の設定と `convertWord` の挙動

#### ケース1: L = 32（デフォルト）

- 設定:
  - `settings.maxLength = normalizeMaxLength("32")` → 32
- 入力:

| 入力語 | 長さ | 期待される処理 |
| :-- | :-- | :-- |
| `S` | 10 | 10 < 32 → モーラ装飾される |
| `L35` | 35 | 35 >= 32 → 装飾せず素通し |

- 期待結果概要:

| 入力語 | type | tokens/moras | result |
| :-- | :-- | :-- | :-- |
| `S` | JP_ROMAJI | 非空 | SuBaRu 風に変換された文字列 |
| `L35` | JP_ROMAJI | `tokens: []`, `moras: []`（または未設定） | 入力そのまま（`L35`） |

#### ケース2: L = 10（有効な小さい値）

- 設定:
  - `settings.maxLength = normalizeMaxLength("10")` → 10
- 入力:

| 入力語 | 長さ | 期待される処理 |
| :-- | :-- | :-- |
| `S` | 10 | 長さ 10、閾値 10 なので「>=」条件に一致 → 装飾しない |
| `L35` | 35 | 35 >= 10 → 装飾しない |

- 期待結果概要:

| 入力語 | result |
| :-- | :-- |
| `S` | `shortword`（装飾なし） |
| `L35` | `aaaaaaaaaabbbbbbbbbbccccccccccddd`（装飾なし） |

#### ケース3: L = 200（最大有効値）

- 設定:
  - `settings.maxLength = normalizeMaxLength("200")` → 200
- 入力:

| 入力語 | 長さ | 期待される処理 |
| :-- | :-- | :-- |
| `S` | 10 | 10 < 200 → 装飾される |
| `L35` | 35 | 35 < 200 → 装飾される |

→ 通常の代表語と同様に、モーラ装飾されることを確認。

#### ケース4: L = 無効値（例: "abc"）

- 設定:
  - `settings.maxLength = normalizeMaxLength("abc")` → 32
  - UI の入力欄も 32 に戻る想定。
- 入力:
  - 挙動はケース1（L=32）と同じになることを確認。

---

## 4. N 表示と長大語ロジックの組み合わせテスト

### 4.1 `seion` と閾値の組み合わせ

- `seion` の長さは 5 なので、多くの L で「装飾対象」となります。


#### L = 3

- `settings.maxLength = 3`
- 5 >= 3 → 装飾しない（素通し）
- 期待:
  - `result: "seion"`（SuBaRu 装飾なし）


#### L = 5

- `settings.maxLength = 5`
- 5 >= 5 → 装飾しない（素通し）
- 期待:
  - `result: "seion"`


#### L = 6

- `settings.maxLength = 6`
- 5 < 6 → 装飾される
- 期待:
  - `result: "SeIOn"`（末尾 `'n`）

→ これにより、「長大語閾値ロジックが N → 'n の仕様を壊していない」ことと、「閾値次第で seion が装飾対象／対象外に切り替わる」ことの両方を確認できます。

---

## 5. テスト手順の簡易まとめ

1. 初期状態:
    - UI の閾値入力に 32 が入っていることを確認。
    - `settings.maxLength` の中身も 32 になっていることを console などで確認。
2. `seion`, 代表語、長大ダミーをそれぞれ入力し、
    - N → `'n` の表記
    - 閾値による装飾オン／オフ
が、上の表の通りになっているかを確認。
3. UI の閾値入力に `-1`, `0`, `201`, `abc` などを入力:
    - フォーカスアウト or input イベントのたびに入力値が 32 に戻ること。
    - 変換結果でも、32 を閾値として動いていること。
4. L = 1, 10, 32, 200 のパターンで、代表語セット＋長大語セットを一括変換して、
    - 「どの語が装飾されるか／素通しされるか」が期待通りかを目視確認。
