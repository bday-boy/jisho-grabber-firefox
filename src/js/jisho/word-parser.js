/*
** Author:      Andrew Smith
** File:        word-parser.js
** Project:     jisho-grabber-firefox
** Description: Uses the element the user selected to get various word
**              information, like meaning, tags, and reading.
*/

class WordParser {
    constructor() {
        this.wordObject = null;
        this._meaningElement = null;
        this._wordElement = null;
        this._anki = new Anki();
    }

    parseWord(element) {
        this._setMeaningElement(element);
        this._setWordObject();
    }

    _setMeaningElement(element) {
        while (element !== null && element.getAttribute('class') !== 'meaning-wrapper') {
            element = element.parentNode;
        }
        this._meaningElement = element;
        while (element !== null && element.getAttribute('class') !== 'concept_light clearfix') {
            element = element.parentNode;
        }
        this._wordElement = element;
        if (this._meaningElement === null || this._wordElement === null) {
            this._meaningElement = null;
            this._wordElement = null;
        }
    }

    _setWordObject() {
        if (this._meaningElement === null || this._wordElement === null) {
            this.wordObject = {
                expressionWithReadings: '',
                expression: '',
                englishMeaning: '',
                partsOfSpeech: '',
                common: '',
                jlpt: '',
                wanikani: '',
                noteID: NO_NOTEID
            };
            return;
        }
        const word = this._getWordAndReading(this._wordElement);
        const meaning = this._getMeaning(this._meaningElement);
        const tags = this._getWordTags(this._wordElement);
        this.wordObject = {
            expressionWithReadings: word,
            expression: this._anki.makeKanji(word),
            englishMeaning: meaning.meaning,
            partsOfSpeech: meaning.tags,
            common: tags.common,
            jlpt: tags.jlpt,
            wanikani: tags.wanikani,
            noteID: NO_NOTEID
        };
    }

    _getWordAndReading(wordResult) {
        // wordResult should be an element like below:
        // const wordResult = document.querySelector("div.concept_light.clearfix");
        const wordInfo = wordResult.querySelector("div.concept_light-representation");
        const wordSpans = wordInfo.querySelectorAll("span.text");
        let word = "";
        for (let span of wordSpans) {
            word += span.textContent.trim();
        }

        // trying my damnedest to get furigana for the word
        let furigana = [];
        let furiTags;
        if (wordResult.querySelector("ruby.furigana-justify") === null) {
            furiTags = wordInfo.querySelectorAll("span.furigana span");
            for (let furi of furiTags) {
                furigana.push(furi.textContent.trim());
            }
        } else {
            furiTags = wordResult.querySelectorAll("ruby.furigana-justify rt");
            for (let furi of furiTags) {
                furigana.push(furi.textContent.trim());
            }
        }

        // if num_kanji !== num_furi, then something is wrong
        let numKanji = 0, numFuri = 0;
        for (let c of word) { if (!this._anki.jpnUtil.isKana(c)) { numKanji++; } }
        for (let furi of furigana) { if (furi) { numFuri++; } }

        let finalWord = "";
        if (word.length === furigana.length && numKanji === numFuri) {
            // attempt to assign readings to each kanji
            for (let i = 0; i < word.length; i++) {
                finalWord += this._anki.jpnUtil.isKana(word[i]) ? word[i] : ` ${word[i]}[${furigana[i]}]`;
            }
        } else {
            // assign reading to whole word in worst case
            finalWord = `${word}[${furigana.join("")}]`;
        }

        return finalWord.trim();
    }

    _getWordTags(wordResult) {
        const wordTagsElement = wordResult.querySelectorAll("div.concept_light-status span.concept_light-tag");
        const wordTags = {
            common: '',
            jlpt: '',
            wanikani: []
        };
        for (let tag of wordTagsElement) {
            const tagText = tag.textContent.toLowerCase().trim().split(' ');
            switch(tagText[0]) {
                case 'common':
                    wordTags.common = "Common word";
                    break;
                case 'jlpt':
                    wordTags.jlpt = tagText[tagText.length - 1].toUpperCase();
                    break;
                case 'wanikani':
                    wordTags.wanikani.push(tagText[tagText.length - 1]);
                    break;
                default:
                    console.log("The parser reached a tag that it didn't expect.");
                    break;
            }
        }
        wordTags.wanikani = wordTags.wanikani.join(', ');
        return wordTags;
    }

    _getMeaning(meaningWrapper) {
        const meaning = meaningWrapper.querySelector("span.meaning-meaning").textContent;
        const prevSibling = meaningWrapper.previousSibling;
        let meaningTags = '';
        if (prevSibling !== null && prevSibling.className === "meaning-tags") {
            meaningTags = prevSibling.textContent.trim();
        }
        return {
            meaning: meaning,
            tags: meaningTags
        };
    }
}