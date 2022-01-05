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

        this.KANJI = /[\u3400-\u4db5\u4e00-\u9fcb\uf900-\ufa6a]/;
        this.KANJI_RADICALS = /[\u2e80-\u2fd5]/;

        // katakana variants, characters in circles, numbers in parentheses,
        // 1-width months, points, etc.
        this.MISC = /[\u31f0-\u31ff\u3220-\u3243\u3280-\u337f]/;

        this.LAZY_BRACKETS = /\[.*?\]/g;
    }

    isHiragana(c) {
        return this.HIRAGANA.test(c);
    }

    isKatakana(c) {
        return this.KATAKANA.test(c);
    }

    isKana(c) {
        return this.isHiragana(c) || this.isKatakana(c);
    }

    isKanji(c) {
        return this.KANJI.test(c);
    }

    isKanjiRadical(c) {
        return this.KANJI_RADICALS.test(c);
    }

    isKanaOrKanji(c) {
        return this.isKana(c) || this.isKanji(c);
    }
}