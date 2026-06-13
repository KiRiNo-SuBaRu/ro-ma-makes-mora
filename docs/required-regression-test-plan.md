# 必須回帰テスト表

## 1. 代表語テスト表

### 1.1 Q 基本セット

| input | type | tokens（概念） | moras（概念） | result（期待値） |
| :-- | :-- | :-- | :-- | :-- |
| gakkou | JP_ROMAJI | CV:ga, Q:k, CV:ko, V:u | CV:ga, QCV:kko, V:u | GakKoU |
| toppu | JP_ROMAJI | CV:to, Q:p, CV:pu | CV:to, QCV:ppu | TopPu |
| kitte | JP_ROMAJI | CV:ki, Q:t, CV:te | CV:ki, QCV:tte | KitTe |
| kitteiru | JP_ROMAJI | CV:ki, Q:t, CV:te, V:i, CV:ru | CV:ki, QCV:tte, V:i, CV:ru | KitTeIRu |

---

### 1.2 長音・eo/ae セット

| input | type | tokens（概念） | moras（概念） | result（期待値） |
| :-- | :-- | :-- | :-- | :-- |
| suu | JP_ROMAJI | CV:su, V:u | CV:su, V:u | Suu |
| oi | JP_ROMAJI | V:o, V:i | V:o, V:i | Oi（convertWord 例外） |
| tou | JP_ROMAJI | CV:to, V:u | CV:to, V:u | ToU |
| toukyou | JP_ROMAJI | CV:to, V:u, CyV:kyo, V:u | CV:to, V:u, CyV:kyo, V:u | ToUKyoU |
| yasai | JP_ROMAJI | CV:ya, CV:sa, V:i | CV:ya, CV:sa, V:i | YaSaI |
| seisyohou | JP_ROMAJI | CV:se, V:i, CyV:syo, CV:ho, V:u | CV:se, V:i, CyV:syo, CV:ho, V:u | SeISyoHoU |
| siteori | JP_ROMAJI | CV:si, CV:te, V:o, CV:ri | CV:si, CV:te, V:o, CV:ri | SiTeORi |
| osaete | JP_ROMAJI | V:o, CV:sa, V:e, CV:te | V:o, CV:sa, V:e, CV:te | OSaETe |

---

### 1.3 ny 代表セット

| input | type | tokens（概念） | moras（概念） | result（期待値） |
| :-- | :-- | :-- | :-- | :-- |
| sinya | JP_ROMAJI | CV:si, CyV:nya（想定） | CV:si, CyV:nya | SinYa（convertWord 例外） |
| kinyoubi | JP_ROMAJI | CV:ki, CyV:nyo, V:u, CV:bi（想定） | CV:ki, CyV:nyo, V:u, CV:bi | KinYoUBi（convertWord 例外） |

---

### 1.4 ny 監視セット（通常処理）

※ここは「標準ルールのまま」であることを確認する監視用です。
result は現行の `displayMoras` 実装に従うため、方向性だけ記載します。

| input | type | tokens（概念） | moras（概念） | result（期待される方向性） |
| :-- | :-- | :-- | :-- | :-- |
| nyanko | JP_ROMAJI | CyV:nya, CV:nko など | 実装依存 | 通常 CyV/CV 表示（特別崩しなし） |
| nyuugaku | JP_ROMAJI | CyV:nyu, V:u, CV:ga, CV:ku など | 実装依存 | 通常表示、U の扱いは V ルール準拠 |
| nyoro | JP_ROMAJI | CyV:nyo, CV:ro など | 実装依存 | 通常表示 |
| ginyaku | JP_ROMAJI | CV:gi, N, CV:ya, CV:ku など | 実装依存 | 通常表示（銀薬系は特別扱いしない） |

---

### 1.5 全代表語まとめセット（入力例）

「全代表語まとめセット」ボタンで、入力エリアに次の 4 行が入る想定です。

1. `gakkou toppu kitte kitteiru`
2. `suu oi tou toukyou yasai seisyohou siteori osaete`
3. `sinya kinyoubi`
4. `nyanko nyuugaku nyoro ginyaku`

---

## 2. V 系回帰テスト表（V 例外＋関連語）

V モーラ例外を実装・変更するときに**必ず通すべきセット**です。

### 2.1 kitteiru 系（ei 系／促音＋V）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| kitteiru | CV:ki / QCV:tte / V:i / CV:ru | `V:i`（tte の後, ru の前） | KitTeIRu |

---

### 2.2 seisyohou 系（ei 系）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| seisyohou | CV:se / V:i / CyV:syo / CV:ho / V:u | `V:i`（se の後） | SeISyoHoU |

---

### 2.3 suu 系（長音 U を立てない特例）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| suu | CV:su / V:u | `V:u`（su の後、語末だが小文字のまま） | Suu |

---

### 2.4 tou / toukyou 系（中間 U を立てる）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| tou | CV:to / V:u | 例外なし（デフォルト V） | ToU |
| toukyou | CV:to / V:u / CyV:kyo / V:u | 中間 `V:u`（to の後, kyo の前） | ToUKyoU |

---

### 2.5 siteori 系（eo 系）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| siteori | CV:si / CV:te / V:o / CV:ri | `V:o`（te の後） | SiTeORi |

---

### 2.6 osaete 系（ae 系）

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| osaete | V:o / CV:sa / V:e / CV:te | 語頭 `V:o`、`V:e`（sa の後） | OSaETe |

---

### 2.7 sieawo 系（eo/ae 拡張）

`sieawo` は eo/ae 系の追加代表例として、V 例外パターンに含める想定です。

| input | 想定モーラ列（概念） | V 例外が効くモーラ | 期待される result |
| :-- | :-- | :-- | :-- |
| sieawo | CV:si / V:e / V:a / CV:wo（想定） | `V:e`（si の後, a の前） | SieaWo |

---

## 3. 回帰テスト時のチェック手順メモ

1. 「全代表語まとめセット」ボタンを押して、4 行すべてを一度に変換する。
2. 各行について、`tokens / moras / result` が上記表の「期待される result」と一致するかを確認する。
3. 特に下記を重点チェックする。
    - `oi / sinya / kinyoubi` → `convertWord` の単語例外が効いているか。
    - `suu / tou / toukyou / siteori / osaete / sieawo` → V モーラの大文字化・小文字化が崩れていないか。
    - ny 監視セット（`nyanko / nyuugaku / nyoro / ginyaku`）が「通常処理のまま」であり、新しい V 例外や ny 関連の変更の副作用を受けていないか。
