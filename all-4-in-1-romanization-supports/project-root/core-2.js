'use strict';

const settings = {
  maxLength: 32,
};

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

function splitSimpleRomanMoras(normalized) {
  const s = String(normalized || '').toLowerCase();
  const result = [];
  let i = 0;

  while (i < s.length) {
    const rest = s.slice(i);

    if (rest.startsWith('nn')) {
      result.push('n');
      i += 1;
      continue;
    }

    if (rest.startsWith('pp')) {
      result.push('p');
      i += 1;
      continue;
    }

    if (rest.startsWith('tt')) {
      result.push('t');
      i += 1;
      continue;
    }

    if (rest.startsWith('kk')) {
      result.push('k');
      i += 1;
      continue;
    }

    if (rest.startsWith('ss')) {
      result.push('s');
      i += 1;
      continue;
    }

    if (rest.startsWith('mm')) {
      result.push('m');
      i += 1;
      continue;
    }

    if (rest.startsWith('rr')) {
      result.push('r');
      i += 1;
      continue;
    }

    if (rest.startsWith('gg')) {
      result.push('g');
      i += 1;
      continue;
    }

    if (rest.startsWith('zz')) {
      result.push('z');
      i += 1;
      continue;
    }

    if (rest.startsWith('dd')) {
      result.push('d');
      i += 1;
      continue;
    }

    if (rest.startsWith('bb')) {
      result.push('b');
      i += 1;
      continue;
    }

    const tri = rest.match(
      /^(sh|ch|ky|gy|ny|hy|my|ry|py|by|j)([aeiou])/
    );
    if (tri) {
      result.push(tri[0]);
      i += tri[0].length;
      continue;
    }

    const bi = rest.match(/^([bcdfghjklmnpqrstvwxyz]?)([aeiou])/);
    if (bi && bi[0]) {
      result.push(bi[0]);
      i += bi[0].length;
      continue;
    }

    if (rest[0] === 'n') {
      result.push('n');
      i += 1;
      continue;
    }

    result.push(rest[0]);
    i += 1;
  }

  return result;
}

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

function buildTokenObjects(normalized) {
  return splitSimpleRomanMoras(normalized).map((raw) => ({
    type: /^[aeiou]$/i.test(raw) ? 'V' : 'CV',
    kind: /^[aeiou]$/i.test(raw) ? 'V' : 'CV',
    raw,
    mora: moraToDisplay(raw),
  }));
}

function buildMoraObjects(tokens) {
  return (tokens || []).map((t) => ({
    type: t.type,
    kind: t.kind,
    raw: t.raw,
    mora: t.mora,
  }));
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

function defaultConvertFromNormalized(normalized) {
  const tokens = buildTokenObjects(normalized);
  return tokens.map((t) => t.mora).join('');
}

function analyzeWord(word) {
  const raw = String(word || '');
  const normalized = raw.toLowerCase();

  if (!isAsciiAlphaWord(raw)) {
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
      note: 'JP_ROMAJI ではないため非変換',
    };
  }

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

  if (NON_JP_LATIN_WORDS.has(normalized)) {
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
      note: 'JP_ROMAJI ではないため非変換',
    };
  }

  const tokens = buildTokenObjects(normalized);
  const moras = buildMoraObjects(tokens);
  const rep = getRepresentativeInfo(normalized);

  return {
    raw,
    normalized,
    type: 'JP_ROMAJI',
    scope: 'APPLICABLE',
    blockedByLength: false,
    representativeMatched: rep.matched,
    representativeKey: rep.representativeKey,
    tokens,
    moras,
    result: rep.matched
      ? rep.result
      : defaultConvertFromNormalized(normalized),
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