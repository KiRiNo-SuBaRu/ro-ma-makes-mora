# subaru-marks-extended-tests.md

すばる式ローマ字 モーラ強調装飾 — extended テスト候補メモ

## このメモの位置づけ

- `SuBaRu-Ro-Ma-Mora-Marker_debug-SieAWo_v1.2.5-r5_Refutaring.html` には、標準モードの**core 回帰テスト 17 件**だけを載せる。
- ここでは、core から一時的に外したが、
「仕様検討・拡張モード・将来の再昇格」に備えて保持しておきたい代表語をまとめる。
- 各語について、「どの規則を監視するための extended か」を簡潔に書く。

core 側の REQUIRED に残しているのは:

- Q 系・基本: gakkou, toppu, kitte, kitteiru
- V ei / 特殊: seikou, keiei, seion, sieawo
- N / n′: sin'ya, kin'youbi

の 10 語のみとする。

---

## 1. V デフォルト・長音系 extended

### suu → Suu

- 用途: 語末 V を立てない長音（su + u 特例）の代表例。

- tokens / moras / result（ガイドライン準拠）
  - tokens: `CV:su, V:u`
  - moras:  `CV:su, V:u`
  - result: `Suu`

- extended に回した理由:
  - core では V デフォルト確認を tou / yasai 系に集約し、
長音特例そのものは extended 在庫で持つ方針にしたため。

---

### oi → Oi

- 用途: 通常の V 規則とは別枠で扱う「単語例外」長音の代表。

- tokens / moras / result
  - tokens: `V:o, V:i`
  - moras:  `V:o, V:i`
  - result: `Oi`

- 備考:
  - ガイドライン上では `category = V-long-exception`。
  - scope-flag を `extension` に落としてもよい候補としてメモしておく。

---

### tou → ToU

- 用途: 「語末 V デフォルト」挙動の、最もプレーンな代表例。

- tokens / moras / result
  - tokens: `CV:to, V:u`
  - moras:  `CV:to, V:u`
  - result: `ToU`

- extended に回した理由:
  - core では語末 V のプレーン代表を減らし、
`seikou / keiei / seion` 側の V に軸足を移したため。

---

### toukyou → ToUKyoU

- 用途:
  - 中間 U を立てる規則（5.7.4）と、語末 V デフォルト（5.6）が同時に効いている代表。

- tokens / moras / result
  - tokens: `CV:to, V:u, CyV:kyo, V:u`
  - moras:  `CV:to, V:u, CyV:kyo, V:u`
  - result: `ToUKyoU`

- extended に回した理由:
  - 中間 U 強調は core から外したが、拡張モード検討時には必ず参照したい語のため、在庫として保持。

---

### yasai → YaSaI

- 用途:
  - 語末単独 V モーラ `i` を大文字化する「語末 V デフォルト」代表。

- tokens / moras / result
  - tokens: `CV:ya, CV:sa, V:i`
  - moras:  `CV:ya, CV:sa, V:i`
  - result: `YaSaI`

- extended に回した理由:
  - core に入れると V 代表セットが少し散らかるため、
「語末 i デフォルト」の観察は extended 側で行う方針にした。

---

## 2. V ei / eo / ae 拡張系 extended

### seisyohou → SeISyoHoU

- 用途:
  - `e + i` 系一般化（5.7.2）と語末 V の扱いを同時に確認する代表例。

- tokens / moras / result
  - tokens: `CV:se, V:i, CyV:syo, CV:ho, V:u`
  - moras:  `CV:se, V:i, CyV:syo, CV:ho, V:u`
  - result: `SeISyoHoU`

- extended に回した理由:
  - ei 系の中核は `seikou / keiei / seion` を core に残し、
seisyohou は「ei + 語末 V」を両方見る拡張代表として在庫とするため。

---

### siteori → SiTeORi

- 用途:
  - `te + o` の eo 系例外で、3拍目の `o` を立てる代表例（5.7.5）。

- tokens / moras / result
  - tokens: `CV:si, CV:te, V:o, CV:ri`
  - moras:  `CV:si, CV:te, V:o, CV:ri`
  - result: `SiTeORi`

- extended に回した理由:
  - 現行 `displayMoras` の V 例外では `siteori` を強く意識しているが、
core テストとしては、まず `seikou / keiei / seion / sieawo` に集中させたため。

---

### osaete → OSaETe

- 用途:
  - 語頭 `o` と中間 `e` を立てる ae 系の強い演出代表（5.7.6）。

- tokens / moras / result
  - tokens: `V:o, CV:sa, V:e, CV:te`
  - moras:  `V:o, CV:sa, V:e, CV:te`
  - result: `OSaETe`

- extended に回した理由:
  - ノイズが比較的強く、core に入れると V 代表セットが
「強ノイズ寄り」に引っ張られるため、拡張演出用の題材として退避。

---

## 3. ny 系 extended（監視セット）

core / observe では `sinya`, `kinyoubi` だけを in-scope に残し、
ny 系の他の語は extended 監視セットとして在庫にしておきます。

### nyanko 系

- 候補: `nyanko`, `nyuugaku`, `nyoro`, `ginyaku` など。

- 用途:
  - `ny` を含む日本語実用ローマ字の代表 / 監視用。
  - `nylon`（英単語）との対比で、「どの ny が日本語側へ吸われるか / 吸われないか」を観察する題材。

- 現状:
  - debug HTML の `OBSERVE` には入れず、extended メモのみに保持。
必要になったときに `OBSERVE` へ一時追加する運用を想定。

---

## 4. extended セットの使い方メモ

- **core 回帰テスト**
  - `v1.2.5-r5` の REQUIRED / OBSERVE / LATIN_WORD / CONTEXT_NO の 17 件だけを必須とする。

- **extended チェック**
  - 仕様を拡張するとき、あるいは V / ny 周りを調整するときだけ、
このメモの語を HTML 側に一時的に戻して確認する。

- **scope-flag の再調整**
  - ガイドライン上の scope-flag（required / extension / candidate / history）は、
このメモの内容と同期させる。
  - たとえば `oi` を extension に落とすなどの判断は、ここを起点に行う。

---

## 5. 今後の拡張メモ（プレースホルダ）

将来、他のグループ（N 系、Q 系の派生、文脈テストなど）にも extended が発生したら、
このファイルに追記していく。

- 例:
  - N 系特殊: 語末 n, 異常な N 連結
  - 文脈系: `Keiei no seion in English` など、混在文のバリエーション拡張
  - 派生モード用の「読みやすさ優先」表記と standard の違いを観察するための対照語

このファイルはあくまで「extended の在庫リスト」として使い、
debug HTML の core セットは必要最小限の代表語に保つ方針とする。
