<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# required-regression-test-plan.md　を添付しました。、突き合わせ用のチェックリスト（比較観点だけを並べたもの）を元にチャックして下さい。

結論から言うと、Ver 2.1-r1 本文（subaru-marks-roma-guideline.md）と required-regression-test-plan.md の間で、チェック観点に関する差分・不整合は見当たりません。[^1][^2]

以下、「比較観点リスト」を簡単に再掲しつつ、各観点ごとに突き合わせ結果を書きます。[^2][^1]

***

## 観点A: 1.1 Q 基本セット

チェック観点:

- gakkou / toppu / kitte / kitteiru の tokens / moras / result が 5.4.1 と一致しているか。[^2]

結果:

- required-regression-test-plan.md の 1.1 行は、tokens・moras・result すべてが 5.4.1 の記述と完全一致しています。[^1][^2]
    - `gakkou → GakKoU`
    - `toppu → TopPu`
    - `kitte → KitTe`
    - `kitteiru → KitTeIRu`

→ 観点Aは問題なしです。[^1][^2]

***

## 観点B: 1.2 長音・eo/ae セット（seikou・keiei・seion・siteori・osaete 含む）

チェック観点:

- 5.4.2 に列挙されている 10 語
`suu / oi / tou / toukyou / yasai / seisyohou / seikou / keiei / seion / siteori / osaete`
について、1.2 の tokens / moras / result が一致しているか。[^2]

結果:

- 1.2 の行は、10 語すべてが 5.4.2 の tokens・moras・result と一致しています。[^1][^2]
    - `suu → Suu`
    - `tou → ToU`
    - `toukyou → ToUKyoU`
    - `yasai → YaSaI`
    - `seisyohou → SeISyoHoU`
    - `seikou → SeIKoU`
    - `keiei → KeIEI`
    - `seion → SeIOn`
    - `siteori → SiTeORi`
    - `osaete → OSaETe`
- `seion` の moras 列 `CV:se, V:i, V:o, N` と result `SeIOn` が、5.7.2（ei 系一般化）と 5.5（N → 'n）の説明に対応する形で揃っています。[^2][^1]

→ 観点Bも問題なしです。[^1][^2]

***

## 観点C: 2.2 ei 系一般化セット（seikou・keiei・seion）

チェック観点:

- 2.2 の「想定モーラ列」「V 例外が効くモーラ」「期待される result」が、5.7.2 の説明と 5.4.2 の表と一致しているか。[^2]

結果:

- 2.2 の 4 行は、いずれも 5.7.2 と 5.4.2 の内容と一致しています。[^1][^2]
    - `seikou`: `CV:se / V:i / CV:ko / V:u`、`V:i（se の後）`、`SeIKoU`
    - `keiei`: `CV:ke / V:i / V:e / V:i`、`1 個目の V:i`、`KeIEI`
    - `seisyohou`: 説明上の代表例として 5.7.2 にも挙がっており、ここでも `SeISyoHoU`
    - `seion`: `CV:se / V:i / V:o / N`、`V:i（se の後）`、`SeIOn`

→ ei 系一般化に関して、本文とテスト表の間に差分はありません。[^2][^1]

***

## 観点D: 2.3 suu 系（長音 U を立てない特例）

チェック観点:

- 2.3 の suu 行が、5.7.3 と 5.4.2 の記述と一致しているか。[^2]

結果:

- `suu`: `CV:su / V:u`、`V:u（su の後、語末だが小文字のまま）`、`Suu` となっており、5.7.3 の説明と完全一致です。[^1][^2]

→ 観点Dも問題なしです。[^1][^2]

***

## 観点E: 2.4 tou / toukyou 系（中間 U を立てる）

チェック観点:

- tou / toukyou の「想定モーラ列」と「どの V が例外対象か」と「result」が、5.7.4 と 5.4.2 の説明・表と一致するか。[^2]

結果:

- `tou`: `CV:to / V:u`、`例外なし（デフォルト V）`、`ToU`
- `toukyou`: `CV:to / V:u / CyV:kyo / V:u`、`中間 V:u（to の後, kyo の前）`、`ToUKyoU`
といった形で、5.7.4 の記述と整合しています。[^1][^2]

→ 観点Eも問題なしです。[^2][^1]

***

## 観点F: 2.5 siteori 系（eo 系）

チェック観点:

- siteori 行の「想定モーラ列」「例外対象 V」「result」が、5.7.5 と 5.4.2 の内容と一致しているか。[^2]

結果:

- `siteori`: `CV:si / CV:te / V:o / CV:ri`、`V:o（te の後）`、`SiTeORi` となっており、本文と一致しています。[^1][^2]

→ 観点Fも問題なしです。[^1][^2]

***

## 観点G: 2.6 osaete 系（ae 系）

チェック観点:

- osaete 行の「想定モーラ列」「対象 V:o / V:e」「result」が、5.7.6 と 5.4.2 の内容と一致しているか。[^2]

結果:

- `osaete`: `V:o / CV:sa / V:e / CV:te`、`語頭 V:o / V:e（sa の後）`、`OSaETe` となっており、本文どおりです。[^1][^2]

→ 観点Gも問題なしです。[^2][^1]

***

## 観点H: 2.7 sieawo 系（eo/ae 拡張）

チェック観点:

- sieawo 行が、5.7.7 と 5.4.3 の説明に対応しているか（標準ではなく extension 観測用であることを含む）。[^2]

結果:

- `sieawo`: `CV:si / V:e / V:a / CV:wo（想定）`、`V:e（si の後, a の前）`、`SieaWo` となっており、5.7.7 の説明と一致しています。[^1][^2]
- ガイドライン本文側で sieawo は scope-flag = extension として扱われており、required-regression-test-plan.md 側の 2.7 も「eo/ae 拡張」と明記した上で観測用扱いになっています。[^1][^2]

→ 観点Hも問題なしです。[^2][^1]

***

## 観点I: seion と N → 'n（三段ログと V 例外の両立）

チェック観点:

- seion が
    - 1.2 に `moras: CV:se, V:i, V:o, N`、`result: SeIOn`
    - 2.2 に「V:i（se の後）」が V 例外対象
として整理されているか。[^2]

結果:

- 上記の通り 1.2・2.2 両方で一致しており、
「ei 系一般化」と「N → 'n」が同時に効く例として、本文 5.7.2・5.5・7.4 の説明と完全に噛み合っています。[^1][^2]

→ 観点Iも問題なしです。[^1][^2]

***

## 観点J: 7章代表語リストとのリンク

チェック観点:

- 7.1〜7.3 に記載されている代表語・test-table-ref（1.1 / 1.2 / 2.x）が、 required-regression-test-plan.md 側の表構成と対応しているか。[^2]

結果:

- 7.1 の Q 基本セット（gakkou / toppu / kitte / kitteiru）は、test-table-ref = 1.1 / 2.1（kitteiru）となっており、required-regression-test-plan.md の 1.1 / 2.1 に対応します。[^1][^2]
- 7.2 の長音・eo/ae セット代表語は test-table-ref = 1.2 / 2.2〜2.6 の形で整理されており、required-regression-test-plan.md の 1.2 および 2.2〜2.6 の構成と一致します。[^2][^1]
- 7.3 の V 例外拡張セット代表語（sieawo）は test-table-ref = 2.7 で、required-regression-test-plan.md の 2.7 と対応しています。[^1][^2]

→ 観点Jも問題なしです。[^2][^1]

***

## まとめ（突き合わせ結果の位置づけ）

- 「5.4〜5.7 の再構成」「ei 系一般化」「seion の N → 'n」「sieawo の extension 扱い」という、前任者のメモで挙がっていた論点は、required-regression-test-plan.md にも漏れなく反映されています。[^1][^2]
- 特に seikou・keiei・seion・siteori・osaete・sieawo など V 系代表語は、本文とテスト表の tokens / moras / result・例外対象 V が完全に一致しており、仕様書とテスト表の同期は取れています。[^2][^1]

この状態であれば、「ガイドライン Ver 2.1-r1 本文」と「必須回帰テスト表」は、少なくとも V 系まわりについては安心してペアで配布できる水準だと思います。[^1][^2]

このあと、同じ調子で ny 系（1.3 / 1.4）と 6章ドラフト（SinYa / KinYoUBi）を突き合わせたい場合は、ny 代表・監視セットについても観点リストを作って一緒に見ていきましょうか。

<div align="center">⁂</div>

[^1]: required-regression-test-plan.md

[^2]: subaru-marks-roma-guideline.md

