class Anki {
    constructor() {
        this.jpnUtil = new JapaneseUtil();
        this.ankiConnect = new AnkiConnect();
    }

    /**
     * Convert an expression of Japanese characters into just kana, like how
     * Anki's {{kana:expression}} functionality works.
     * @param   {String} expression The Japanese expression
     * @returns {String}            The Japanese expression with only kana
     */
    makeKana(expression) {
        if (!expression) {
            throw new Error(`${expression} is a null-type value.`);
        }
        else if (typeof expression !== 'string') {
            throw new Error(`${expression} is not a string.`);
        }
        else {
            const allKana = [];
            for (const jpnchar of expression) {
                if (this.jpnUtil.isKana(jpnchar)) {
                    allKana.push(jpnchar);
                }
            }
            return allKana.join('');
        }
    }

    /**
     * Convert an expression of Japanese characters into just kanji and
     * okurigana, like how Anki's {{kanji:expression}} functionality works. For
     * example, makeKanji(緊[きん] 張[ちょう]する) -> 緊張する
     * @param   {String} expression The Japanese expression
     * @returns {String}            The Japanese expression without readings
     */
    makeKanji(expression) {
        if (!expression) {
            throw new Error(`${expression} is a null-type value.`);
        }
        else if (typeof expression !== 'string') {
            throw new Error(`${expression} is not a string.`);
        }
        else {
            expression = expression.replace(this.jpnUtil.LAZY_BRACKETS, '').replaceAll(' ', '');
            const allJpnChars = [];
            for (const jpnchar of expression) {
                if (this.jpnUtil.isKana(jpnchar)) {
                    allJpnChars.push(jpnchar);
                }
            }
            return allJpnChars.join('');
        }
    }
}