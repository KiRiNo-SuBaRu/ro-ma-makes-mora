"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenizeToMoraTokens = tokenizeToMoraTokens;
exports.buildMoraUnits = buildMoraUnits;
exports.summarizeMoras = summarizeMoras;
exports.buildMoraForToken = buildMoraForToken;
function isVowel(ch) {
    return !!ch && /^[aeiou]$/i.test(ch);
}
function isConsonant(ch) {
    return !!ch && /^[bcdfghjklmnpqrstvwxyz]$/i.test(ch);
}
/**
 * JP ローマ字文字列を MoraToken 列へ分解する。
 *
 * 文字列を左から走査し、
 * CV / CyV / V / N / Q / C? の各トークンへ分割する。
 * 分解できない要素は C? として保持する。
 *
 * @param jpRomaji JP ローマ字文字列
 * @returns MoraToken 列
 */
function tokenizeToMoraTokens(jpRomaji) {
    const s = jpRomaji.toLowerCase();
    const result = [];
    let i = 0;
    while (i < s.length) {
        const ch = s[i];
        if (ch === 'n') {
            const next = s[i + 1] ?? '';
            if (!isVowel(next) && next !== 'y' && next !== 'n') {
                result.push({ kind: 'N', raw: 'n' });
                i += 1;
                continue;
            }
        }
        if (isConsonant(ch)) {
            const next = s[i + 1] ?? '';
            if (next === ch && isConsonant(next) && ch !== 'n') {
                result.push({ kind: 'Q', raw: ch });
                i += 1;
                continue;
            }
        }
        if (isConsonant(ch) &&
            s[i + 1] === 'y' &&
            isVowel(s[i + 2] ?? '')) {
            const raw = s.slice(i, i + 3);
            result.push({ kind: 'CyV', raw });
            i += 3;
            continue;
        }
        if (isConsonant(ch) && isVowel(s[i + 1] ?? '')) {
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
/**
 * MoraToken 列を MoraUnit 列へまとめ直す。
 *
 * Q + CV は QCV、Q + CyV は QCyV として結合し、
 * C? は OTHER として扱う。
 *
 * @param tokens MoraToken 列
 * @returns MoraUnit 列
 */
function buildMoraUnits(tokens) {
    const result = [];
    let i = 0;
    while (i < tokens.length) {
        const current = tokens[i];
        const next = tokens[i + 1];
        // Q + CV を QCV にまとめる
        if (current.kind === 'Q' && next?.kind === 'CV') {
            result.push({
                kind: 'QCV',
                raw: current.raw + next.raw,
            });
            i += 2;
            continue;
        }
        // Q + CyV を QCyV にまとめる
        if (current.kind === 'Q' && next?.kind === 'CyV') {
            result.push({
                kind: 'QCyV',
                raw: current.raw + next.raw,
            });
            i += 2;
            continue;
        }
        // C? は OTHER として扱う
        if (current.kind === 'C?') {
            result.push({
                kind: 'OTHER',
                raw: current.raw,
            });
            i += 1;
            continue;
        }
        // それ以外は 1 対 1 で MoraUnit へ写像する
        if (current.kind === 'CV' ||
            current.kind === 'CyV' ||
            current.kind === 'V' ||
            current.kind === 'N') {
            result.push({
                kind: current.kind,
                raw: current.raw,
            });
            i += 1;
            continue;
        }
        result.push({
            kind: 'OTHER',
            raw: current.raw,
        });
        i += 1;
    }
    return result;
}
// 各カテゴリの有無を集計する
function summarizeMoras(units) {
    // 拗音 CyV の判定
    const hasQ = units.some((unit) => unit.kind === 'QCV' || unit.kind === 'QCyV');
    // 通常の CV の判定
    const hasV = units.some((unit) => unit.kind === 'V' ||
        unit.kind === 'QCV' ||
        unit.kind === 'QCyV');
    const hasN = units.some((unit) => unit.kind === 'N');
    const hasOther = units.some((unit) => unit.kind === 'OTHER');
    const categories = [];
    // 促音 Q の判定
    if (hasQ) {
        categories.push('Q');
    }
    // 母音単独 V の判定
    if (hasV) {
        categories.push('V');
    }
    // 撥音 N の判定
    if (hasN) {
        categories.push('N');
    }
    // どの規則にも当てはまらないものは C? とする
    if (hasOther) {
        categories.push('OTHER');
    }
    // 集計結果から categories 配列を組み立てる
    return {
        hasQ,
        hasV,
        hasN,
        hasOther,
        categories,
    };
}
/**
 * 解析対象トークンに対してモーラ解析を適用する。
 *
 * JP_ROMAJI かつ APPLICABLE のトークンに対してのみ
 * MoraToken / MoraUnit / MoraSummary を構築する。
 * MoraUnit に OTHER が含まれる場合は ERROR とし、
 * 出力は元の文字列を保持する。
 *
 * @param token 解析対象トークン
 * @returns モーラ解析結果を付与したトークン
 */
function buildMoraForToken(token) {
    // モーラ解析対象外のトークンはそのまま返す
    if (token.kind !== 'JP_ROMAJI' || token.scope !== 'APPLICABLE') {
        return token;
    }
    const moraTokens = tokenizeToMoraTokens(token.raw);
    // MoraToken 列を MoraUnit 列へまとめる
    const moras = buildMoraUnits(moraTokens);
    const moraSummary = summarizeMoras(moras);
    // OTHER を含む場合は ERROR として非変換扱いにする
    const hasOther = moras.some((mora) => mora.kind === 'OTHER');
    if (hasOther) {
        const prevDecision = token.decision;
        return {
            ...token,
            scope: 'ERROR',
            core: {
                text: token.raw,
                category: 'OTHER',
                tokens: moraTokens,
                moras,
                result: token.raw,
                moraSummary,
            },
            output: token.raw,
            decision: {
                ...(prevDecision ?? {}),
                note: prevDecision?.note
                    ? `${prevDecision.note}; OTHER mora detected`
                    : 'OTHER mora detected',
            },
        };
    }
    const category = moraSummary.categories.length === 1
        ? moraSummary.categories[0]
        : 'OTHER';
    return {
        ...token,
        core: {
            text: token.raw,
            category,
            tokens: moraTokens,
            moras,
            result: token.raw,
            moraSummary,
        },
        output: token.raw,
    };
}
