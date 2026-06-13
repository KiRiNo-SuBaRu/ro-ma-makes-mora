# すばる式ローマ字 モーラ強調装飾ガイドライン     改訂版　Ver 2.0-r01

1. 章: このガイドラインの位置づけ
1.1 目的
1.2 適用範囲
1.3 標準モードの設計思想（拍優先・ノイズ許容）
2. 章: 処理フロー概要（標準モード）
2.1 全体フロー概要（convertText → convertWord → tokenizeJP → buildMoras → displayMoras）[^1]
2.2 三段ログ（tokens / moras / output）の位置づけ[^1]
3. 章: 単語分類仕様（classifyWord）
3.1 classifyWord の役割（JP_ROMAJI / LATIN_WORD / UNKNOWN）[^1]
3.2 単語単体判定ルール（classifyWordBase）
　3.2.1 前処理（trim, lower）[^1]
　3.2.2 固有名ブラックリスト（国名・都市名・言語名 等）[^1]
　3.2.3 機能語ブラックリスト（the, of, in, to, no 等）[^1]
　3.2.4 アクセント付きラテン文字の扱い[^1]
　3.2.5 tokenizeJP による JP_ROMAJI 判定[^1]
　3.2.6 非ラテン混在時の UNKNOWN 判定[^1]
3.3 文脈補正仕様（classifyWordsWithContext）
　3.3.1 no の助詞補正ルール[^1]
　3.3.2 英語文脈での no（LATIN_WORD 維持）[^1]
3.4 classifyWord 用テストケース（単語単体＋文脈付き）
　3.4.1 単語単体判定テーブル（JP_ROMAJI / LATIN_WORD / UNKNOWN）[^2][^1]
　3.4.2 文脈付き判定テーブル（no の補正有無）[^1]
4. 章: モーラ構築仕様（buildMoras）
4.1 tokenizeJP のトークン種別（CV / CyV / V / N / Q / C?）[^1]
4.2 モーラ統合ルール
　4.2.1 Q + CV → QCV
　4.2.2 Q + CyV → QCyV
　4.2.3 それ以外は 1 トークン = 1 モーラ[^1]
4.3 代表例（gakkou / toppu / kitte / kitteiru）の tokens → moras[^2]
5. 章: モーラ種別ごとの表示ルール（displayMoras・標準）
5.1 共通方針（モーラ単位の視覚的区切りを最優先）[^1]
5.2 CV モーラ表示（子音大文字＋母音小文字）[^1]
5.3 CyV モーラ表示（先頭子音のみ大文字）[^1]
5.4 QCV モーラ表示（小文字子音＋大文字子音＋母音）[^1]
5.5 N モーラ表示（常に N）[^1]
5.6 V モーラ表示の基本（デフォルトは語末のみ大文字）[^1]
5.7 V モーラ例外ルールの評価順
　5.7.1 kitteiru 系（QCV + V + CV）[^2][^1]
　5.7.2 ei 系一般化（se / ke + V:i）[^1]
　5.7.3 suu（末尾 U を立てない）[^2][^1]
　5.7.4 toukyou（中間 U を立てる）[^2][^1]
　5.7.5 siteori（eo）[^2][^1]
　5.7.6 osaete（ae）[^2][^1]
　5.7.7 sieawo（eo/ae 拡張候補）[^2]
　5.7.8 デフォルト V（語中小文字／語末大文字）[^1]
6. 章: 単語レベルの個別例外（SinYa / KinYoUBi）
6.1 位置づけと設計方針（夜／曜日モチーフの強調）[^2][^1]
6.2 `sinya` の仕様
　6.2.1 入力・分類（JP_ROMAJI）[^2]
　6.2.2 想定モーラ構造（CV:si / CyV:nya）[^2]
　6.2.3 最終表示 `SinYa`（convertWord 単語例外）[^2]
　6.2.4 崩しの意図（夜モチーフの視覚的立ち上がり）
6.3 `kinyoubi` の仕様
　6.3.1 入力・分類（JP_ROMAJI）[^2]
　6.3.2 想定モーラ構造（CV:ki / CyV:nyo / V:u / CV:bi）[^2]
　6.3.3 最終表示 `KinYoUBi`（convertWord 単語例外）[^2]
　6.3.4 中間 U 強調の位置づけ（toukyou 系との対応）[^2]
6.4 ny 系一般との関係と銀薬系への言及
　6.4.1 ny 一般は通常表示にとどめる方針[^2]
　6.4.2 ginyaku（銀薬）を将来拡張候補として名前のみ保留[^1]
6.5 単語例外一覧表（SinYa / KinYoUBi）[^2]
7. 章: 代表語リスト（回帰テスト用）
7.1 Q / 促音系代表語（gakkou / toppu / kitte / kitteiru）[^2]
7.2 長音・二重母音・ei / eo / ae セット（suu / oi / tou / toukyou / yasai / seisyohou / siteori / osaete / sieawo）[^2]
7.3 ny 代表セット（sinya / kinyoubi）[^2]
7.4 ny 監視セット（nyanko / nyuugaku / nyoro / ginyaku ほか）[^2]
7.5 全代表語まとめセット（4 行入力例）[^2]
8. 章: 回帰テスト表と運用手順
8.1 required-regression-test-plan との対応関係[^2]
8.2 V 系回帰テスト表の利用方法（2.1〜2.7）[^2]
8.3 回帰テスト時のチェック手順メモ（重点項目）[^2]
9. 章: 拡張・保留項目（将来モード用メモ）
9.1 ei 一般化の範囲（`*e + i` 全般に拡張するか）[^1]
9.2 ae 一般化（`mae` 等）の扱い[^1]
9.3 強ノイズ例（sieawo など）の位置づけ再検討[^2]
9.4 ny 系一般化の検討（nYa / nYo / nYu など）と影響範囲
9.5 「読みやすさ重視モード」「異質感重視モード」への派生方針メモ
