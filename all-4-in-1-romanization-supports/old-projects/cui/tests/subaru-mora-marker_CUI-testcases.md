# SuBaRu-Ro-Ma-Mora-Marker CUI テストケース一覧

---

## 1. ファイル概要

- 対象ツール
  - `subaru-mora-marker.exe`
- 対象バージョン
  - （例）v1.0.0
- 対象プラットフォーム
  - Windows 10 / 11 コマンドプロンプト / PowerShell
- 想定文字コード
  - UTF-8（No-BOM）

---

## 2. 実行基本形テスト

### 2-1. 標準入力 / 標準出力の基本動作

- 目的
  - 標準入力から読み込んだテキストが、
期待どおり変換され標準出力へ出力されることを確認する。
- 前提条件
  - `subaru-mora-marker.exe` が PATH で参照可能。

---

#### TC-001: 基本単語変換（短文）

- コマンド例

```cmd
echo gakkou toppu kitteiru | subaru-mora-marker.exe
```

- 期待出力

```text
GakKoU TopPu KitTeIRu
```

---

#### TC-002: nippon → NipPon

- コマンド例

```cmd
echo nippon | subaru-mora-marker.exe
```

- 期待出力

```text
NipPon
```

---

#### TC-003: sieawo → SieAWo / oi → Oi

- コマンド例

```cmd
echo sieawo oi | subaru-mora-marker.exe
```

- 期待出力

```text
SieAWo Oi
```

---

## 3. 「no」文脈補正テスト

### 3-1. 日本語ローマ字文脈での「no」補正

---

#### TC-010: gakkou no seikou

- コマンド例

```cmd
echo gakkou no seikou | subaru-mora-marker.exe
```

- 期待出力

```text
GakKoU No SeIKoU
```

---

#### TC-011: Japan no keiei（右側 JP_ROMAJI による補正）

- コマンド例

```cmd
echo Japan no keiei | subaru-mora-marker.exe
```

- 期待出力

```text
Japan No KeIEI
```

---

### 3-2. 英文文脈での「no」非補正

---

### TC-012: in no case（補正なし）

- コマンド例

```cmd
echo in no case | subaru-mora-marker.exe
```

- 期待出力

```text
in no case
```

---

## 4. 長大トークン閾値 `-L` テスト

### 4-1. 正常値指定（1〜200）

---

#### TC-020: 既定値利用（`-L` 未指定）

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe
```

- 期待出力

```text
GakKoU
```

---

#### TC-021: `-L 3` 指定（3 文字以上は素通し）

- コマンド例

```cmd
echo aa aaaa gakkou | subaru-mora-marker.exe -L 3
```

- 判定観点
  - `"aa"` は 2 文字のため、通常どおり装飾される。
  - `"aaaa"` は 4 文字のため、素通し。
  - `"gakkou"` は 6 文字のため、素通し。
- 期待出力例（方針案）

```text
AA aaaa gakkou
```

---

#### TC-022: `-L 200` 指定（上限値）

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe -L 200
```

- 期待出力

```text
GakKoU
```

---

### 4-2. 異常値指定（負数・0・201以上・非数値）

各ケースで以下を確認する。

- `settings.maxLength` が 32 へフォールバックする。
- メッセージ言語に応じて、エラーメッセージが stderr に出力される。

---

#### TC-023: `-L 0` 指定

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe -L 0
```

- 期待出力（stdout）

```text
GakKoU
```

- 期待出力（stderr）
  - 日本語環境
    - `L の値が無効です。1〜200 の整数を指定してください（既定値 32 を使用します）。`
  - 英語環境
    - `Invalid L value. Use an integer between 1 and 200 (fallback to 32).`

---

#### TC-024: `-L -1` 指定

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe -L -1
```

- 期待出力内容は TC-023 と同様の扱い。

---

#### TC-025: `-L 201` 指定

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe -L 201
```

- 期待出力内容は TC-023 と同様の扱い。

---

#### TC-026: `-L abc` 指定

- コマンド例

```cmd
echo gakkou | subaru-mora-marker.exe -L abc
```

- 期待出力内容は TC-023 と同様の扱い。

---

## 5. 表示言語切り替えテスト

### 5-1. `--lang` 明示指定

---

#### TC-030: `--lang ja` でヘルプ表示

- コマンド例

```cmd
subaru-mora-marker.exe --lang ja --help
```

- 期待出力（抜粋）

```text
すばる式ローマ字モーラ強調装飾 CUI 版
使用法:
  subaru-mora-marker.exe [options]
オプション:
  -L <n>           1語あたりの最大強調対象文字数
                   (1〜200, 既定値 32)
  --lang <ja|en>   メッセージ表示言語を指定
  -h, --help       このヘルプを表示
```

---

#### TC-031: `--lang en` でヘルプ表示

- コマンド例

```cmd
subaru-mora-marker.exe --lang en --help
```

- 期待出力（抜粋）

```text
SuBaRu-style Romaji Mora Decorator (CUI)
Usage:
  subaru-mora-marker.exe [options]
Options:
  -L <n>           Max mora-decoration length per word
                   (1-200, default 32)
  --lang <ja|en>   Specify message language
  -h, --help       Show this help
```

---

### 5-2. コードページによる自動判定（手動確認）

コードページに応じて `detectLangFromCodePage` が
`ja` / `en` を返すことを手動確認する。

---

#### TC-032: 日本語コードページ（例: 932）

- 前提
  - コマンドプロンプトで `chcp 932` が設定されている。
- コマンド例

```cmd
subaru-mora-marker.exe --help
```

- 期待出力
  - ヘルプが日本語で表示される。

---

#### TC-033: 非日本語コードページ（例: 437）

- 前提
  - コマンドプロンプトで `chcp 437` など、日本語以外のコードページ。
- コマンド例

```cmd
subaru-mora-marker.exe --help
```

- 期待出力
  - ヘルプが英語で表示される。

---

## 6. ローマ字判定 / 非装飾英単語テスト

### 6-1. LATIN_WORD の非装飾確認


---

#### TC-040: 英単語 boat / nylon

- コマンド例

```cmd
echo boat nylon | subaru-mora-marker.exe
```

- 期待出力

```text
boat nylon
```

---

### 6-2. JP_ROMAJI の装飾確認


---

#### TC-041: ou / ai / ei 系

- コマンド例

```cmd
echo gakkou gyoukai kaihatu seisyohou yasai | subaru-mora-marker.exe
```

- 期待出力

```text
GakKoU GyoUKaI KaIHaTu SeISyoHoU YaSaI
```

---

## 7. nippon / 撥音 / 促音系テスト

### 7-1. nippon / sin'ya / kin'youbi

---

#### TC-050: nippon

- コマンド例

```cmd
echo nippon | subaru-mora-marker.exe
```

- 期待出力

```text
NipPon
```

---

#### TC-051: sin'ya / kin'youbi

- コマンド例

```cmd
echo sin'ya kin'youbi | subaru-mora-marker.exe
```

- 期待出力

```text
Sin'Ya KIn'YoUBi
```

---

## 8. 実運用向けテスト観点メモ

- 空入力時
  - 何も出力せず正常終了すること。
- 複数行入力時
  - 行ごとの改行が保たれたまま変換されること。
- 大量テキスト入力
  - 大きめのテキスト（数 KB〜数 MB）でもハングせず終了すること。
