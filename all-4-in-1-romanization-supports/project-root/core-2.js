'use strict';

const defaultMaxLength = 32;
const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

const settings = {
  maxLength: defaultMaxLength,
};

function normalizeMaxLength(value) {
  const n = Number(value);
  if (
    !Number.isFinite(n) ||
    !Number.isInteger(n) ||
    n < MIN_LENGTH ||
    n > MAX_LENGTH
  ) {
    return defaultMaxLength;
  }
  return n;
}

/* =====================================================
 * tokenizeJP
 * CV / CyV / V / N / Q / C? に分割する軽量トークナイザ
 * （ブラウザ版 HTML から移植）
 * ===================================================== */
function tokenizeJP(word) {
  const s = word.toLowerCase();
  const tokens = [];
  let i = 0;

  while (i < s.length) {
    if (s[i] === 'n' && s[i + 1] === "'") {
      tokens.push({ kind: 'N', raw: "n'" });
      i += 2;
      continue;
    }

    if (
      /[bcdfghjklmpqrstvwxyz]/.test(s[i]) &&
      i + 1 < s.length &&
      s[i + 1] === s[i] &&
      s[i] !== 'n'
    ) {
      tokens.push({ kind: 'Q', raw: s[i] });
      i += 1;
      continue;
    }

    if (s[i] === 'n' && s[i + 1] === 'n') {
      tokens.push({ kind: 'N', raw: 'n' });
      i += 1;
      continue;
    }

    if (s[i] === 'n' && i + 1 >= s.length) {
      tokens.push({ kind: 'N', raw: 'n' });
      i += 1;
      continue;
    }

    if (
      s[i] === 'n' &&
      /[bcdfghjklmpqrstvwxyz]/.test(s[i + 1] || '')
    ) {
      tokens.push({ kind: 'N', raw: 'n' });
      i += 1;
      continue;
    }

    if (
      i + 1 < s.length &&
      s[i] === 'y' &&
      /[auo]/.test(s[i + 1])
    ) {
      tokens.push({ kind: 'CyV', raw: s.slice(i, i + 2) });
      i += 2;
      continue;
    }

    if (
      i + 2 < s.length &&
      /[bcdfghjklmnpqrstvwxyz]/.test(s[i]) &&
      s[i + 1] === 'y' &&
      /[aeiou]/.test(s[i + 2])
    ) {
      tokens.push({ kind: 'CyV', raw: s.slice(i, i + 3) });
      i += 3;
      continue;
    }

    if (
      i + 1 < s.length &&
      /[bcdfghjklmnpqrstvwxyz]/.test(s[i]) &&
      /[aeiou]/.test(s[i + 1])
    ) {
      tokens.push({ kind: 'CV', raw: s.slice(i, i + 2) });
      i += 2;
      continue;
    }

    if (/[aeiou]/.test(s[i])) {
      tokens.push({ kind: 'V', raw: s[i] });
      i += 1;
      continue;
    }

    tokens.push({ kind: 'C?', raw: s[i] });
    i += 1;
  }

  return tokens;
}

/* =====================================================
 * buildMoras
 * Q + CV -> QCV / Q + CyV -> QCyV に結合。
 * ===================================================== */
function buildMoras(tokens) {
  const moras = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind === 'Q') {
      const next = tokens[i + 1];
      if (next && next.kind === 'CV') {
        moras.push({ kind: 'QCV', raw: t.raw + next.raw });
        i += 2;
        continue;
      }
      if (next && next.kind === 'CyV') {
        moras.push({ kind: 'QCyV', raw: t.raw + next.raw });
        i += 2;
        continue;
      }
    }
    moras.push({ kind: t.kind, raw: t.raw });
    i++;
  }
  return moras;
}

/* =====================================================
 * displayMoras
 * モーラ種別ごとに SuBaRu 風強調表示。
 * ===================================================== */
function displayMoras(moras) {
  let out = '';

  function cvVowel(raw) {
    return raw[raw.length - 1];
  }

  for (let idx = 0; idx < moras.length; idx++) {
    const m = moras[idx];
    const prev = idx > 0 ? moras[idx - 1] : null;
    const next = idx < moras.length - 1 ? moras[idx + 1] : null;
    const prev2 = idx > 1 ? moras[idx - 2] : null;
    const isLast = idx === moras.length - 1;
    const mv = m.raw;

    switch (m.kind) {
      case 'CV':
        if (
          mv === 'ki' &&
          next && next.kind === 'N' && next.raw === "n'"
        ) {
          out += 'KI';
        } else {
          out += mv[0].toUpperCase() + mv.slice(1).toLowerCase();
        }
        break;

      case 'CyV':
        out += mv[0].toUpperCase() + mv.slice(1).toLowerCase();
        break;

      case 'QCV':
        out += mv[0].toLowerCase()
          + mv[1].toUpperCase()
          + mv.slice(2).toLowerCase();
        break;

      case 'QCyV':
        out += mv[0].toLowerCase()
          + mv[1].toUpperCase()
          + mv.slice(2).toLowerCase();
        break;

      case 'N': {
        if (m.raw === "n'") {
          out += "n'";
          break;
        }
        if (isLast) {
          out += 'n';
          break;
        }
        out += 'n';
        break;
      }

      case 'V':
        if (
          mv === 'i' &&
          prev && prev.kind === 'QCV' && prev.raw === 'tte' &&
          next && next.kind === 'CV' && next.raw === 'ru'
        ) {
          out += 'I';
          break;
        }

        if (mv === 'i') {
          if (
            prev && prev.kind === 'CV' && prev.raw === 'se' &&
            next && (next.raw === 'ko' || next.raw === 'o' ||
                     next.kind === 'N')
          ) {
            out += 'I';
            break;
          }
          if (prev && prev.kind === 'CV' && prev.raw === 'ke') {
            out += 'I';
            break;
          }
        }

        if (
          mv === 'e' &&
          prev && prev.kind === 'V' && prev.raw === 'i' &&
          prev2 && prev2.kind === 'CV' &&
          cvVowel(prev2.raw) === 'e'
        ) {
          out += 'E';
          break;
        }

        if (mv === 'o') {
          if (
            prev && prev.kind === 'V' && prev.raw === 'i' &&
            next && next.kind === 'N'
          ) {
            out += 'O';
            break;
          }
          if (prev && prev.kind === 'CV' && prev.raw === 'te') {
            out += 'O';
            break;
          }
        }

        if (mv === 'o' && !prev) {
          out += 'O';
          break;
        }
        if (
          mv === 'e' &&
          prev && prev.kind === 'CV' && prev.raw === 'sa'
        ) {
          out += 'E';
          break;
        }

        if (
          mv === 'a' &&
          prev && prev.kind === 'V' && prev.raw === 'e'
        ) {
          out += 'A';
          break;
        }

        if (
          mv === 'u' &&
          prev && prev.kind === 'CV' && prev.raw === 'su'
        ) {
          out += 'u';
          break;
        }

        if (
          mv === 'u' &&
          prev && prev.kind === 'CV' && prev.raw === 'to' &&
          next && next.kind === 'CyV' && next.raw === 'kyo'
        ) {
          out += 'U';
          break;
        }

        if (
          mv === 'u' &&
          prev && prev.kind === 'CyV' && prev.raw === 'yo'
        ) {
          out += 'U';
          break;
        }

        if (!prev || isLast) out += mv.toUpperCase();
        else out += mv.toLowerCase();
        break;

      default:
        out += mv;
    }
  }

  return out;
}

/* =====================================================
 * classifyWord（軽量版） 
 * ===================================================== */
function classifyWord(word) {
  const s = word.toLowerCase();

  if (!/^[a-z']+$/.test(s)) return 'UNKNOWN';

  if (s === 'no') return 'LATIN_WORD';

  if (s.includes("'")) return 'JP_ROMAJI';

  if (
    /(?:tion|sion|ough|ould|ead|oat|iano|ylon)$/.test(s) ||
    /(?:str|spr|spl|thr|sch|ght)/.test(s)
  ) {
    return 'LATIN_WORD';
  }

  if ([
    'boat', 'coat', 'head', 'piano',
    'japan', 'nylon', 'the', 'english',
    'case', 'in',
  ].includes(s)) {
    return 'LATIN_WORD';
  }

  if (
    /^(?:n'|n|[bcdfghjklmnpqrstvwxyz]?y?[aeiou]|([bcdfghjklmpqrstvwxyz])\1(?=[aeiouy]))+$/
      .test(s)
  ) {
    return 'JP_ROMAJI';
  }

  return 'LATIN_WORD';
}

/* =====================================================
* analyzeWord
* Web デモ用の単語デバッグ返却関数。
* convertWord 相当の処理に、debug 表示用メタ情報を足して返す。
* ===================================================== */
function analyzeWord(word) {
const raw = word || '';
const normalized = raw.toLowerCase();
const type = classifyWord(normalized);

if (type !== 'JP_ROMAJI') {
return {
raw,
normalized,
type,
scope: 'NON_APPLICABLE',
blockedByLength: false,
representativeMatched: false,
representativeKey: undefined,
tokens: [],
moras: [],
result: raw,
note: 'JP_ROMAJI ではないため非変換',
};
}

if (normalized.length >= settings.maxLength) {
return {
raw,
normalized,
type,
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

const tokens = tokenizeJP(normalized);
const moras = buildMoras(tokens);

if (normalized === 'oi') {
return {
raw,
normalized,
type,
scope: 'APPLICABLE',
blockedByLength: false,
representativeMatched: true,
representativeKey: 'V:oi',
tokens,
moras,
result: 'Oi',
note: '代表語 current 表示を適用',
};
}

if (normalized === 'sieawo') {
return {
raw,
normalized,
type,
scope: 'APPLICABLE',
blockedByLength: false,
representativeMatched: true,
representativeKey: 'V:sieawo',
tokens,
moras,
result: 'SieAWo',
note: '代表語 current 表示を適用',
};
}

if (normalized === 'nippon') {
return {
raw,
normalized,
type,
scope: 'APPLICABLE',
blockedByLength: false,
representativeMatched: true,
representativeKey: 'N:nippon',
tokens,
moras,
result: 'NipPon',
note: '代表語 current 表示を適用',
};
}

const result = displayMoras(moras);

return {
raw,
normalized,
type,
scope: 'APPLICABLE',
blockedByLength: false,
representativeMatched: false,
representativeKey: undefined,
tokens,
moras,
result,
note: '汎用モーラ大文字化を適用',
};
}

/* =====================================================
 * convertWord
 * nippon → NipPon、sieawo → SieAWo 等をサポート。
 * 長大トークン閾値設定を追加。[file:3]
 * ===================================================== */
function convertWord(word) {
const analysis = analyzeWord(word);
  return {
  type: analysis.type,
  tokens: analysis.tokens,
  moras: analysis.moras,
  result: analysis.result,
  };
}

/* =====================================================
 * splitWords / convertText
 * 「no」文脈補正を含むブラウザ版相当の処理。
 * ===================================================== */
function splitWords(text) {
  return text.split(/(\s+)/);
}

function convertText(text) {
  const parts = splitWords(text);
  const analyses = parts.map((part) => {
    if (/^\s+$/.test(part)) {
      return { raw: part, isSpace: true };
    }

    const r = convertWord(part);
    return { raw: part, isSpace: false, ...r };
  });

  function hasNearbyJPRomaji(index) {
    for (let d = 1; d <= 2; d++) {
      const left = analyses[index - d];
      const right = analyses[index + d];

      if (left && !left.isSpace && left.type === 'JP_ROMAJI') {
        return true;
      }
      if (right && !right.isSpace && right.type === 'JP_ROMAJI') {
        return true;
      }
    }
    return false;
  }

  let output = '';

  for (let i = 0; i < analyses.length; i++) {
    const a = analyses[i];

    if (a.isSpace) {
      output += a.raw;
      continue;
    }

    if (
      a.raw.toLowerCase() === 'no' &&
      a.type === 'LATIN_WORD' &&
      hasNearbyJPRomaji(i)
    ) {
      output += 'No';
      continue;
    }

    output += a.result;
  }

  return output;
}

const api = {
  settings,
  normalizeMaxLength,
  analyzeWord,
  convertText,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

if (typeof window !== 'undefined') {
  window.SubaruRomaMora = api;
}