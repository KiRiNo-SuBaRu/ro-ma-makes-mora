'use strict';

// --------------------------------------------------
// 更新内容（整合性チェック課題リストより）
// --------------------------------------------------
// - 課題3対応: ローマ字語判定を、ブラックリスト方式から
//   TS コア (tokenize.ts) の looksLikeJpRomaji() 相当の
//   ヒューリスティック方式へ変更した。
// - 課題4対応: 長大トークン境界は本ファイルの
//   `normalized.length >= settings.maxLength`（閾値含む）
//   をそのまま維持している（こちらが正のため変更なし）。
// - 課題5対応: モーラ分解を TS コア (mora.ts) に揃えて
//   MoraToken（CV/CyV/V/N/Q/C?）→
//   MoraUnit（QCV/QCyV 等への統合）の2段階構成にし、
//   OTHER 検出時は非変換（scope: 'ERROR'）にするフェイル
//   セーフを追加した。
// --------------------------------------------------

const settings = {
  maxLength: 32,
};

// ヒューリスティックでは除外しきれない既知の例外語を
// 安全策として残す（例: "boat" は CV パターンに一致してしまう）。
const NON_JP_LATIN_WORDS = new Set([
  'english',
  'boat',
  'no',
]);

function normalizeMaxLength(value) {
  const n = Number(value);

  if (Number.isInteger(n) && n > 0) {
    settings.maxLength = n;
    return n;
  }

  settings.maxLength = 32;
  return settings.maxLength;
}

function isAsciiAlphaWord(value) {
  return /^[A-Za-z]+$/.test(value);
}

// --------------------------------------------------
// 課題3: ローマ字語らしさのヒューリスティック判定
// （TS コア tokenize.ts の looksLikeJpRomaji() を反映）
// --------------------------------------------------
function looksLikeJpRomaji(raw) {
  const s = String(raw || '').toLowerCase();

  if (!/^[A-Za-z0-9']+$/.test(String(raw || ''))) {
    return false;
  }

  if (!/[aeiou]/.test(s)) {
    return false;
  }

  if (s === 'no') {
    return false;
  }

  if (s.includes("'")) {
    return true;
  }

  if (
    /(ka|ki|ku|ke|ko|sa|shi|su|se|so|ta|chi|tsu|te|to|na|ni|nu|ne|ha|hi|fu|he|ho|ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|ga|gi|gu|ge|go|za|ji|zu|ze|zo|da|de|do|ba|bi|bu|be|bo|pa|pi|pu|pe|po|kya|kyu|kyo|sha|shu|sho|cha|chu|cho|nya|nyu|nyo|hya|hyu|hyo|mya|myu|myo|rya|ryu|ryo|gya|gyu|gyo|ja|ju|jo|bya|byu|byo|pya|pyu|pyo|nn|pp|tt|kk|ss|ou|aa|ii|uu|ee|oo)/.test(
      s
    )
  ) {
    return true;
  }

  if (/^[bcdfghjklmnpqrstvwxyz]+[aeiou]/.test(s)) {
    return true;
  }

  return false;
}

function isVowel(ch) {
  return !!ch && /^[aeiou]$/i.test(ch);
}

function isConsonant(ch) {
  return !!ch && /^[bcdfghjklmnpqrstvwxyz]$/i.test(ch);
}

// --------------------------------------------------
// 課題5: モーラ分解 第1段
// JP ローマ字文字列を MoraToken 列
// （CV / CyV / V / N / Q / C?）へ分解する。
// （TS コア mora.ts の tokenizeToMoraTokens() を反映）
// --------------------------------------------------
function tokenizeToMoraTokens(jpRomaji) {
  const s = String(jpRomaji || '').toLowerCase();
  const result = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (ch === 'n') {
      const next = s[i + 1] || '';
      if (!isVowel(next) && next !== 'y' && next !== 'n') {
        result.push({ kind: 'N', raw: 'n' });
        i += 1;
        continue;
      }
    }

    if (isConsonant(ch)) {
      const next = s[i + 1] || '';
      if (next === ch && isConsonant(next) && ch !== 'n') {
        result.push({ kind: 'Q', raw: ch });
        i += 1;
        continue;
      }
    }

    if (isConsonant(ch) && s[i + 1] === 'y' && isVowel(s[i + 2] || '')) {
      const raw = s.slice(i, i + 3);
      result.push({ kind: 'CyV', raw });
      i += 3;
      continue;
    }

    if (isConsonant(ch) && isVowel(s[i + 1] || '')) {
      const raw = s.slice(i, i + 2);
      result.push({ kind: 'CV', raw });
      i += 2;
      continue;
    }

    if (isVowel(ch)) {
      result.push({ kind: 'V', raw: ch });
      i += 1;
      continue;
    }

    result.push({ kind: 'C?', raw: ch });
    i += 1;
  }

  return result;
}

// --------------------------------------------------
// 課題5: モーラ分解 第2段
// MoraToken 列を MoraUnit 列へまとめ直す。
// Q + CV は QCV、Q + CyV は QCyV として結合し、
// C? は OTHER として扱う。
// （TS コア mora.ts の buildMoraUnits() を反映）
// --------------------------------------------------
function buildMoraUnits(tokens) {
  const result = [];
  let i = 0;

  while (i < tokens.length) {
    const current = tokens[i];
    const next = tokens[i + 1];

    if (current.kind === 'Q' && next && next.kind === 'CV') {
      result.push({ kind: 'QCV', raw: current.raw + next.raw });
      i += 2;
      continue;
    }

    if (current.kind === 'Q' && next && next.kind === 'CyV') {
      result.push({ kind: 'QCyV', raw: current.raw + next.raw });
      i += 2;
      continue;
    }

    if (current.kind === 'C?') {
      result.push({ kind: 'OTHER', raw: current.raw });
      i += 1;
      continue;
    }

    if (
      current.kind === 'CV' ||
      current.kind === 'CyV' ||
      current.kind === 'V' ||
      current.kind === 'N'
    ) {
      result.push({ kind: current.kind, raw: current.raw });
      i += 1;
      continue;
    }

    result.push({ kind: 'OTHER', raw: current.raw });
    i += 1;
  }

  return result;
}

function buildMoraAnalysis(normalized) {
  const moraTokens = tokenizeToMoraTokens(normalized);
  const moraUnits = buildMoraUnits(moraTokens);
  const hasOther = moraUnits.some((u) => u.kind === 'OTHER');

  return { moraTokens, moraUnits, hasOther };
}

// 単一モーラ単位の表示用大文字小文字変換。
// V（単独母音）は先頭大文字化、単独子音（N 等）は小文字化、
// それ以外（CV/CyV/QCV/QCyV 等の複数文字）は
// 先頭大文字化＋残りを小文字化する。
function moraToDisplay(mora) {
  const raw = String(mora || '');
  if (!raw) return '';

  if (/^[aeiou]$/i.test(raw)) {
    return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
  }

  if (/^[bcdfghjklmnpqrstvwxyz]$/i.test(raw)) {
    return raw.toLowerCase();
  }

  return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
}

// OTHER（非対応文字）は変形せずそのまま表示する。
function unitToDisplay(unit) {
  if (!unit) return '';
  if (unit.kind === 'OTHER') {
    return unit.raw;
  }
  return moraToDisplay(unit.raw);
}

function tokenToDebugObject(t) {
  return {
    type: t.kind,
    kind: t.kind,
    raw: t.raw,
    mora: unitToDisplay(t),
  };
}

function unitToDebugObject(u) {
  return {
    type: u.kind,
    kind: u.kind,
    raw: u.raw,
    mora: unitToDisplay(u),
  };
}

function defaultConvertFromUnits(units) {
  return units.map((u) => unitToDisplay(u)).join('');
}

function getRepresentativeInfo(normalized) {
  const key = String(normalized || '').toLowerCase();

  if (key === 'oi') {
    return {
      matched: true,
      representativeKey: 'V:oi',
      result: 'Oi',
      note: '代表語 current 表示を適用',
    };
  }

  if (key === 'sieawo') {
    return {
      matched: true,
      representativeKey: 'V:sieawo',
      result: 'SieAWo',
      note: '代表語 current 表示を適用',
    };
  }

  if (key === 'nippon') {
    return {
      matched: true,
      representativeKey: 'N:nippon',
      result: 'NipPon',
      note: '代表語 current 表示を適用',
    };
  }

  if (key === 'tou') {
    return {
      matched: true,
      representativeKey: 'V:tou',
      result: 'ToU',
      note: '代表語 current 表示を適用',
    };
  }

  return {
    matched: false,
    representativeKey: undefined,
    result: null,
    note: null,
  };
}

function nonApplicableLatin(raw, normalized, note) {
  return {
    raw,
    normalized,
    type: 'LATIN_WORD',
    scope: 'NON_APPLICABLE',
    blockedByLength: false,
    representativeMatched: false,
    representativeKey: undefined,
    tokens: [],
    moras: [],
    result: raw,
    note,
  };
}

function analyzeWord(word) {
  const raw = String(word || '');
  const normalized = raw.toLowerCase();

  // 1. ASCII アルファベットのみで構成されているか
  if (!isAsciiAlphaWord(raw)) {
    return nonApplicableLatin(
      raw,
      normalized,
      'JP_ROMAJI ではないため非変換'
    );
  }

  // 2. 課題3: ヒューリスティックでローマ字語らしさを判定
  if (!looksLikeJpRomaji(raw)) {
    return nonApplicableLatin(
      raw,
      normalized,
      'JP_ROMAJI ではないため非変換'
    );
  }

  // 3. ヒューリスティックでは除外しきれない既知の例外語
  if (NON_JP_LATIN_WORDS.has(normalized)) {
    return nonApplicableLatin(
      raw,
      normalized,
      'JP_ROMAJI ではないため非変換（除外リスト）'
    );
  }

  // 4. 課題4: 長大トークン境界は `>=`（閾値含む）のまま維持
  if (normalized.length >= settings.maxLength) {
    return {
      raw,
      normalized,
      type: 'JP_ROMAJI',
      scope: 'NON_APPLICABLE',
      blockedByLength: true,
      representativeMatched: false,
      representativeKey: undefined,
      tokens: [],
      moras: [],
      result: raw,
      note: '長大トークン閾値により非変換',
    };
  }

  // 5. 課題5: 2段構成のモーラ分解
  const { moraTokens, moraUnits, hasOther } = buildMoraAnalysis(normalized);

  if (hasOther) {
    return {
      raw,
      normalized,
      type: 'JP_ROMAJI',
      scope: 'ERROR',
      blockedByLength: false,
      representativeMatched: false,
      representativeKey: undefined,
      tokens: moraTokens.map(tokenToDebugObject),
      moras: moraUnits.map(unitToDebugObject),
      result: raw,
      note: '非対応文字（OTHER）を検出したため非変換',
    };
  }

  const rep = getRepresentativeInfo(normalized);

  return {
    raw,
    normalized,
    type: 'JP_ROMAJI',
    scope: 'APPLICABLE',
    blockedByLength: false,
    representativeMatched: rep.matched,
    representativeKey: rep.representativeKey,
    tokens: moraTokens.map(tokenToDebugObject),
    moras: moraUnits.map(unitToDebugObject),
    result: rep.matched ? rep.result : defaultConvertFromUnits(moraUnits),
    note: rep.matched ? rep.note : '一般モーラ変換を適用',
  };
}

function convertWord(word) {
  const info = analyzeWord(word);
  return {
    type: info.type,
    tokens: info.tokens,
    moras: info.moras,
    result: info.result,
  };
}

function splitEdgePunctuation(token) {
  const raw = String(token || '');

  const leadMatch = raw.match(/^[^A-Za-z]+/);
  const trailMatch = raw.match(/[^A-Za-z]+$/);

  const leading = leadMatch ? leadMatch[0] : '';
  const trailing = trailMatch ? trailMatch[0] : '';

  const core = raw.slice(
    leading.length,
    raw.length - trailing.length
  );

  return {
    leading,
    core,
    trailing,
  };
}

function convertText(text) {
  const input = String(text || '');
  if (!input) return input;

  const parts = input.split(/(\s+)/);

  const analyzed = parts.map((part) => {
    if (part === '') {
      return {
        raw: part,
        kind: 'EMPTY',
        output: '',
        core: '',
        leading: '',
        trailing: '',
        analysis: null,
      };
    }

    if (/^\s+$/.test(part)) {
      return {
        raw: part,
        kind: 'SPACE',
        output: part,
        core: '',
        leading: '',
        trailing: '',
        analysis: null,
      };
    }

    const split = splitEdgePunctuation(part);
    const core = split.core;

    if (!core) {
      return {
        raw: part,
        kind: 'PUNCT_ONLY',
        output: part,
        core: '',
        leading: split.leading,
        trailing: split.trailing,
        analysis: null,
      };
    }

    const analysis = analyzeWord(core);

    return {
      raw: part,
      kind: 'WORD',
      output: null,
      core,
      leading: split.leading,
      trailing: split.trailing,
      analysis,
    };
  });

  function isSkippableContextToken(item) {
    return !!(
      item &&
      (item.kind === 'EMPTY' ||
        item.kind === 'SPACE' ||
        item.kind === 'PUNCT_ONLY')
    );
  }

  function isApplicableJpRomajiToken(item) {
    return !!(
      item &&
      item.kind === 'WORD' &&
      item.analysis &&
      item.analysis.type === 'JP_ROMAJI' &&
      item.analysis.scope === 'APPLICABLE'
    );
  }

  function findPreviousMeaningfulToken(index) {
    for (let i = index - 1; i >= 0; i -= 1) {
      const item = analyzed[i];
      if (isSkippableContextToken(item)) {
        continue;
      }
      return item;
    }
    return null;
  }

  function findNextMeaningfulToken(index) {
    for (let i = index + 1; i < analyzed.length; i += 1) {
      const item = analyzed[i];
      if (isSkippableContextToken(item)) {
        continue;
      }
      return item;
    }
    return null;
  }

  function hasAdjacentApplicableWord(index) {
    const prev = findPreviousMeaningfulToken(index);
    const next = findNextMeaningfulToken(index);

    return (
      isApplicableJpRomajiToken(prev) ||
      isApplicableJpRomajiToken(next)
    );
  }

  for (let i = 0; i < analyzed.length; i += 1) {
    const item = analyzed[i];

    if (item.kind !== 'WORD') {
      continue;
    }

    const a = item.analysis;
    let converted = a.result;

    if (
      a.type === 'LATIN_WORD' &&
      a.normalized === 'no' &&
      hasAdjacentApplicableWord(i)
    ) {
      converted = 'No';
    }

    item.output = item.leading + converted + item.trailing;
  }

  return analyzed.map((x) => x.output).join('');
}

const api = {
  settings,
  normalizeMaxLength,
  analyzeWord,
  convertWord,
  convertText,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

if (typeof window !== 'undefined') {
  window.SubaruRomaMora = api;
}
