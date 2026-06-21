'use strict';

const messages = {
  ja: {
    help: [
      'すばる式ローマ字モーラ強調装飾 CUI 版',
      '',
      '使用法:',
      '  subaru-mora-marker.exe [options]',
      '',
      'オプション:',
      '  -L <n>           1語あたりの最大強調対象文字数',
      '                   (1〜200, 既定値 32)',
      '  --lang <ja|en>   メッセージ表示言語を指定',
      '  -h, --help       このヘルプを表示',
      '',
      '標準入力からテキストを読み込み、標準出力に',
      '変換結果を出力します。',
    ].join('\r\n'),
    invalidL:
      'L の値が無効です。1〜200 の整数を指定してくだ' +
      'さい（既定値 32 を使用します）。',
  },
  en: {
    help: [
      'SuBaRu-style Romaji Mora Decorator (CUI)',
      '',
      'Usage:',
      '  subaru-mora-marker.exe [options]',
      '',
      'Options:',
      '  -L <n>           Max mora-decoration length per word',
      '                   (1-200, default 32)',
      '  --lang <ja|en>   Specify message language',
      '  -h, --help       Show this help',
      '',
      'Reads text from stdin and writes converted text to',
      'stdout.',
    ].join('\r\n'),
    invalidL:
      'Invalid L value. Use an integer between 1 and 200 ' +
      '(fallback to 32).',
  },
};

function getMessages(lang) {
  return messages[lang] || messages.en;
}

module.exports = { getMessages };