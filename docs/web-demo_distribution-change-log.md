# Web デモ更新履歴

---

## 対象ファイル

- `demo-subaru-roma-mora_v3.1.html`
- `demo-subaru-roma-mora_v3.2.html`
- `demo-subaru-roma-mora_v3.3.html`
- `demo-subaru-roma-mora_v3.4.html`

---

## 更新履歴一覧

| ファイル | 主な段階 | 主な更新内容 | 確認できた状態 | 残課題 / 注意 |
|---|---|---|---|---|
| `demo-subaru-roma-mora_v3.1.html` | 初期 Web デモ段階 | `core-2.js` を読み込む単一 HTML デモの土台を作成し、`convertText(text)` と `analyzeWord(word)` を使う 2 本立て UI の開始形を整えた。 | ブラウザで `window.SubaruRomaMora` が存在し、`analyzeWord('Nippon')` と `convertText('Sumutokoro Nippon ToU')` の基本動作が確認できた。 | debug パネルはまだ最小構成で、`type`、`scope`、`blockedByLength`、`representativeMatched`、`representativeKey`、`tokens`、`moras`、`note` の正式整形は未完だった。 |
| `demo-subaru-roma-mora_v3.2.html` | debug UI 拡張段階 | 単語 debug を構造化表示する方向へ進み、summary テーブル、tokens / moras 表示、theme toggle、カード UI など、見やすいデモ画面への整理が進んだ。 | `convertText()` と `analyzeWord()` の画面導線が揃い、debug オブジェクトを HTML 上で追える土台ができた。 | 旧 `tokens-list / moras-flow` 系の生成コードや旧 helper が残り、`escapeHtml` などの helper 参照不整合、重複定義、末尾貼り替え漏れの安定化確認が必要だった。 |
| `demo-subaru-roma-mora_v3.3.html` | 安定化・仕上げ段階 | 旧 debug 生成コードの除去、新 `renderDebugPanel()` 系への一本化、helper 群の整理、単語欄説明の 1 語前提化、`lengthPolicyTarget` 文言の明確化、`非変換のため生成なし` 表示への改善を実施した。 | `nippon`、`tou`、`english`、長大語、数字列などで summary・tokens・moras が構造化表示でき、debug パネル整形タスクは実用レベルまで到達した。 | 2 行入力や句点付き全文変換では、改行が出力表示で消えて見える問題が残り、表示側の改行保持調整が必要だった。 |
| `demo-subaru-roma-mora_v3.4.html` | 改行保持・入力安定化段階 | 全文変換結果表示を改行保持前提で見直し、`result-text` を `<pre>` 化し、`.result-text` に `margin: 0;`、`white-space: pre-wrap;`、`overflow-wrap: anywhere;` を適用した。あわせて `doConvert()` で `inputText.value.replace(/\r?\n+$/, '')` を使い、意図しない末尾改行を除去してから `convertText()` に渡すよう更新した。 | 1 行入力、2 行入力、句点付き複数行入力について、出力表示で改行を保持できる形に修正された。初期 `textarea` 値には改行が含まれず、実運用で混入した末尾改行のみを変換前に吸収する方針が整理された。 | 複数行入力を仕様上どこまで正式サポートするかは別途仕様側の整理余地がある。表示改善は入ったが、複数ブラウザでの見え方確認と README 反映は今後の追補対象。 |

---

## 版ごとの位置づけ

- `v3.1` は **まず動く最小デモ**。
- `v3.2` は **debug UI を広げた版**。
- `v3.3` は **helper 整理と表示改善で実用化に寄せた版**。
- `v3.4` は **改行保持と入力末尾改行対策を入れた表示安定化版**。

---

## 現時点の次アクション

- `v3.4` の全文変換結果表示について、複数ブラウザで `pre-wrap` と長語折り返しの見え方を確認する。
- Web デモ README / 配布メモにも、複数行表示と末尾改行吸収の挙動を追記する。
- 必要に応じて、複数行入力の正式サポート範囲は仕様側で整理した上で受け入れ条件に反映する。
