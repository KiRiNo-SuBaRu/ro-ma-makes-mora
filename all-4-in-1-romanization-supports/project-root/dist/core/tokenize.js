"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIntoRawSegments = splitIntoRawSegments;
exports.detectTokenKind = detectTokenKind;
exports.decideScopeKind = decideScopeKind;
exports.tokenizeForMoraAnalysis = tokenizeForMoraAnalysis;
const PUNCT_OR_SYMBOL_RE = /^[\p{P}\p{S}]+$/u;
const HIRAGANA_KATAKANA_RE = /^[\p{Script=Hiragana}\p{Script=Katakana}]+$/u;
const LATIN_DIGIT_APOSTROPHE_RE = /^[A-Za-z0-9']+$/;
function hasKanji(text) {
    return /[\p{Script=Han}]/u.test(text);
}
function hasLatin(text) {
    return /[A-Za-z]/.test(text);
}
function looksLikeJpRomaji(raw) {
    const s = raw.toLowerCase();
    if (!LATIN_DIGIT_APOSTROPHE_RE.test(raw)) {
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
    if (/(ka|ki|ku|ke|ko|sa|shi|su|se|so|ta|chi|tsu|te|to|na|ni|nu|ne|ha|hi|fu|he|ho|ma|mi|mu|me|mo|ya|yu|yo|ra|ri|ru|re|ro|wa|wo|ga|gi|gu|ge|go|za|ji|zu|ze|zo|da|de|do|ba|bi|bu|be|bo|pa|pi|pu|pe|po|kya|kyu|kyo|sha|shu|sho|cha|chu|cho|nya|nyu|nyo|hya|hyu|hyo|mya|myu|myo|rya|ryu|ryo|gya|gyu|gyo|ja|ju|jo|bya|byu|byo|pya|pyu|pyo|nn|pp|tt|kk|ss|ou|aa|ii|uu|ee|oo)/.test(s)) {
        return true;
    }
    if (/^[bcdfghjklmnpqrstvwxyz]+[aeiou]/.test(s)) {
        return true;
    }
    return false;
}
/**
 * 入力文字列を、生セグメント列へ分割する。
 *
 * 空白、約物、連続した非空白・非約物のまとまりを
 * それぞれ独立したセグメントとして切り出す。
 *
 * @param input 入力文字列
 * @returns 生セグメント列
 */
function splitIntoRawSegments(input) {
    const segments = input.match(/\s+|[\p{P}\p{S}]+|[^\s\p{P}\p{S}]+/gu);
    return segments ?? [];
}
/**
 * 生セグメントの文字種をもとに TokenKind を推定する。
 *
 * ラテン文字列についてはヒューリスティクスで
 * JP_ROMAJI と LATIN_WORD を振り分ける。
 *
 * @param raw 生セグメント文字列
 * @returns 推定した TokenKind
 */
function detectTokenKind(raw) {
    if (raw.length === 0) {
        return 'UNKNOWN';
    }
    // 完全空白は SPACE とする
    if (/^\s+$/.test(raw)) {
        return 'SPACE';
    }
    // 約物のみで構成される場合は PUNCT とする
    if (PUNCT_OR_SYMBOL_RE.test(raw)) {
        return 'PUNCT';
    }
    // 漢字とラテン文字の混在は MIXED とする
    if (hasKanji(raw) && hasLatin(raw)) {
        return 'MIXED';
    }
    // 判定不能なものは UNKNOWN とする
    if (HIRAGANA_KATAKANA_RE.test(raw)) {
        return 'UNKNOWN';
    }
    // ラテン文字列はローマ字らしさを見て JP_ROMAJI / LATIN_WORD を振り分ける
    if (LATIN_DIGIT_APOSTROPHE_RE.test(raw)) {
        return looksLikeJpRomaji(raw) ? 'JP_ROMAJI' : 'LATIN_WORD';
    }
    return 'UNKNOWN';
}
/**
 * TokenKind とフィールド種別から ScopeKind を決定する。
 *
 * @param kind トークン種別
 * @param fieldType 入力フィールド種別
 * @returns 適用可否を表す ScopeKind
 */
function decideScopeKind(kind, fieldType) {
    // id / checksum 系フィールドでは変換を適用しない
    if (fieldType === 'id' || fieldType === 'checksum') {
        return 'NON_APPLICABLE';
    }
    switch (kind) {
        case 'SPACE':
        case 'PUNCT':
        case 'MIXED':
        case 'LATIN_WORD':
            return 'NON_APPLICABLE';
        // JP_ROMAJI のみ通常フィールドで APPLICABLE とする
        case 'JP_ROMAJI':
            return 'APPLICABLE';
        // 判定不能なものは ERROR とする
        case 'UNKNOWN':
        default:
            return 'ERROR';
    }
}
/**
 * 入力文字列をモーラ解析向けのトークン列へ分割する。
 *
 * 文字列を空白・約物・その他のセグメントへ分けたうえで、
 * 各セグメントに TokenKind と ScopeKind を付与して返す。
 *
 * @param input 入力文字列
 * @param fieldType 入力フィールド種別
 * @returns モーラ解析向けに整形したトークン列
 */
function tokenizeForMoraAnalysis(input, fieldType) {
    // まず入力文字列を生セグメントへ分割する
    const segments = splitIntoRawSegments(input);
    // 各セグメントに kind と scope を付与する
    return segments.map((raw) => {
        const kind = detectTokenKind(raw);
        const scope = decideScopeKind(kind, fieldType);
        return {
            raw,
            kind,
            scope,
            punct: kind === 'PUNCT' ? raw : undefined,
            core: undefined,
            output: raw,
            decision: undefined,
        };
    });
}
