/**
 * @file Uses the element the user selected to get various word information,
 * like meaning, tags, and reading.
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
    // while (element !== null && element.getAttribute('class') !== 'meaning-wrapper') {
    //   element = element.parentNode;
    // }
    this._meaningElement = element.closest('.meaning-wrapper');
    // while (element !== null && element.getAttribute('class') !== 'concept_light clearfix') {
    //   element = element.parentNode;
    // }
    this._wordElement = element.closest('.concept_light.clearfix');
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
        allTags: '',
        noteID: NO_NOTEID,
      };
      return;
    }

    const word = this._getWordAndReading(this._wordElement);
    const meaning = this._getMeaning(this._meaningElement);
    const tags = this._getWordTags(this._wordElement);

    const allTags = [];
    if (tags.common) {
      allTags.push(tags.common);
    }
    if (tags.jlpt) {
      allTags.push(`JLPT level: ${tags.jlpt}`);
    }
    if (tags.wanikani) {
      allTags.push(`WaniKani level(s): ${tags.wanikani}`);
    }

    this.wordObject = {
      expressionWithReadings: word,
      expression: this._anki.makeKanji(word),
      englishMeaning: meaning.meaning,
      partsOfSpeech: meaning.tags,
      common: tags.common,
      jlpt: tags.jlpt,
      wanikani: tags.wanikani,
      allTags: allTags.join('<br>'),
      noteID: NO_NOTEID,
    };
  }

  _getWordAndReading(wordResult) {
    const wordInfo = wordResult.querySelector('div.concept_light-representation');
    const wordSpans = Array.from(wordInfo.querySelectorAll('span.text'));
    const fullWord = wordSpans.reduce((word, span) => word + span.textContent.trim(), '');

    /* trying my damnedest to get furigana for the word */
    const furigana = [];
    let furiTags;
    if (wordResult.querySelector('ruby.furigana-justify') === null) {
      furiTags = wordInfo.querySelectorAll('span.furigana span');
    } else {
      furiTags = wordResult.querySelectorAll('ruby.furigana-justify rt');
    }
    furiTags.forEach((tag) => { furigana.push(tag.textContent.trim()); });

    /* if numKanji !== numFuri, then something is wrong */
    const numKanji = Array.from(fullWord).reduce((sum, c) => (
      sum + !this._anki.jpnUtil.isKana(c)
    ), 0);
    const numFuri = Array.from(furigana).reduce((sum, c) => sum + (c !== ''), 0);

    let finalWord = '';
    if (fullWord.length === furigana.length && numKanji === numFuri) {
      /* attempt to assign readings to each kanji */
      finalWord = Array.from(fullWord).reduce((word, c, i) => (
        word + (this._anki.jpnUtil.isKana(c) ? c : ` ${c}[${furigana[i]}]`)
      ), '');
    } else {
      /* assign reading to whole word in worst case */
      finalWord = `${fullWord}[${furigana.join('')}]`;
    }

    return finalWord.trim();
  }

  _getWordTags(wordResult) {
    const wordTagsElement = wordResult.querySelectorAll('div.concept_light-status span.concept_light-tag');
    const wordTags = {
      common: '',
      jlpt: '',
      wanikani: [],
    };
    wordTagsElement.forEach((tag) => {
      const tagText = tag.textContent.toLowerCase().trim().split(' ');
      switch (tagText[0]) {
        case 'common':
          wordTags.common = 'Common word';
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
    });
    wordTags.wanikani = wordTags.wanikani.join(', ');
    return wordTags;
  }

  _getMeaning(meaningWrapper) {
    const meaning = meaningWrapper.querySelector('span.meaning-meaning').textContent;
    const prevSibling = meaningWrapper.previousSibling;
    let meaningTags = '';
    if (prevSibling !== null && prevSibling.className === 'meaning-tags') {
      meaningTags = prevSibling.textContent.trim();
    }
    return {
      meaning,
      tags: meaningTags.replace('Wikipedia definition', ''),
    };
  }
}
