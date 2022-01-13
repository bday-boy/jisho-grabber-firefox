/*
** Author:      Andrew Smith
** File:        utils.js
** Project:     jisho-grabber-firefox
** Description: This file contains functions that are useful mostly for
**              processing meaning/word data and such.
*/

/** Class for processing Japanese characters. */
class JapaneseUtil {
    constructor() {
        this.SYMBOLS_AND_PUNCTUATION = /[\u3000-\u303f]/;

        this.HIRAGANA = /[\u3041-\u3096\u3099-\u309f]/;
        this.KATAKANA = /[\u30a0-\u30ff]/;
        this.KATAKANA_PUNCTUATION = /[\u30fb\u30fc]/;
        this.HALFWIDTH_KATAKANA = /[\uff66-\uff9f]/;

        this.FULLWIDTH_ROMAN = /[\uff01-\uff5e]/;

        this.KANJI = /[\u3400-\u4db5\u4e00-\u9fcb\uf900-\ufa6a\u3005\u3006]/;
        this.KANJI_RADICALS = /[\u2e80-\u2fd5]/;

        // katakana variants, characters in circles, numbers in parentheses,
        // 1-width months, points, etc.
        this.MISC = /[\u31f0-\u31ff\u3220-\u3243\u3280-\u337f]/;

        this.LAZY_BRACKETS = /\[.*?\]/g;
    }

    /**
     * Tests if the input char c is Hiragana. No error handling is done, so c
     * is assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is Hiragana, false otherwise
     */
    isHiragana(c) {
        return this.HIRAGANA.test(c);
    }

    /**
     * Tests if the input char c is Katakana. No error handling is done, so c
     * is assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is Katakana, false otherwise
     */
    isKatakana(c) {
        return this.KATAKANA.test(c);
    }

    /**
     * Tests if the input char c is Kana. No error handling is done, so c is
     * assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is Kana, false otherwise
     */
    isKana(c) {
        return this.isHiragana(c) || this.isKatakana(c);
    }

    /**
     * Tests if the input char c is Kanji. No error handling is done, so c is
     * assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is Kanji, false otherwise
     */
    isKanji(c) {
        return this.KANJI.test(c) || this.KANJI_RADICALS.test(c);
    }

    /**
     * Tests if the input char c is a Kanji radical. No error handling is done,
     * so c is assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is a Kanji radical, false otherwise
     */
    isKanjiRadical(c) {
        return this.KANJI_RADICALS.test(c);
    }

    /**
     * Tests if the input char c is Kana or Kanji. No error handling is done,
     * so c is assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is Kana or Kanji, false otherwise
     */
    isKanaOrKanji(c) {
        return this.isKana(c) || this.isKanji(c);
    }

    /**
     * Tests if the input char c is Kana or Kanji. No error handling is done,
     * so c is assumed to already only be a 1-length string.
     * @param {string} c - Character to test
     * @returns {boolean} true if c is a Japanese character, false otherwise
     */
    isJapanese(c) {
        return (
            this.isKanaOrKanji(c)
            || this.SYMBOLS_AND_PUNCTUATION.test(c)
            || this.KATAKANA_PUNCTUATION.test(c)
            || this.HALFWIDTH_KATAKANA.test(c)
            || this.FULLWIDTH_ROMAN.test(c)
            || this.MISC.test(c)
        );
    }
}