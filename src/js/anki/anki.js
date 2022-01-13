/** Class for preparing data for Anki. */
class Anki {
    constructor() {
        this.jpnUtil = new JapaneseUtil();
    }

    /**
     * Convert an expression of Japanese characters into just kana, like how
     * Anki's {{kana:expression}} functionality works. For example,
     * makeKana(緊[きん] 張[ちょう]する) -> きんちょうする
     * @param {string} expression - The Japanese expression
     * @returns {string} The Japanese expression with only kana
     */
    makeKana(expression) {
        return this._filterString(
            expression,
            str => this.jpnUtil.isKana(str)
        );
    }

    /**
     * Convert an expression of Japanese characters into just kanji and
     * okurigana, like how Anki's {{kanji:expression}} functionality works. For
     * example, makeKanji(緊[きん] 張[ちょう]する) -> 緊張する
     * @param {string} expression - The Japanese expression
     * @returns {string} The Japanese expression without readings
     */
    makeKanji(expression) {
        expression = expression.replace(this.jpnUtil.LAZY_BRACKETS, '').replaceAll(' ', '')
        return this._filterString(
            expression,
            str => this.jpnUtil.isKanaOrKanji(str)
        );
    }

    /**
     * Filter out non-kana or -kanji characters from a string.
     * @param {string} expression - The Japanese expression
     * @returns {string} The Japanese expression without readings
     */
    makeJapanese(expression) {
        return this._filterString(
            expression,
            str => this.jpnUtil.isKanaOrKanji(str)
        );
    }

    _filterString(str, filterFunc) {
        if (str === "") {
            return "";
        } else if (!str) {
            throw new Error(`${str} is a null-type value.`);
        } else if (typeof str !== 'string') {
            throw new Error(`${str} is not a string.`);
        } else {
            let allJpnChars = '';
            for (const c of str) {
                if (filterFunc(c)) {
                    allJpnChars += c;
                }
            }
            return allJpnChars;
        }
    }
}