/*
** Author:      Andrew Smith
** File:        word-parser.js
** Project:     jisho-grabber-firefox
** Description: Uses the element the user selected to get various word
**              information, like meaning, tags, and reading.
*/

function getWordAndReading(wordResult) {
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
    }
    else {
        furiTags = wordResult.querySelectorAll("ruby.furigana-justify rt");
        for (let furi of furiTags) {
            furigana.push(furi.textContent.trim());
        }
    }

    // if num_kanji !== num_furi, then something is wrong
    let numKanji = 0, numFuri = 0;
    for (let c of word) { if (!isKana(c)) { numKanji++; } }
    for (let furi of furigana) { if (furi) { numFuri++; } }

    let finalWord = "";
    if (word.length === furigana.length && numKanji === numFuri) {
        // attempt to assign readings to each kanji
        for (let i = 0; i < word.length; i++) {
            finalWord += isKana(word[i]) ? word[i] : ` ${word[i]}[${furigana[i]}]`;
        }
    }
    else {
        // assign reading to whole word in worst case
        finalWord = `${word}[${furigana.join("")}]`;
    }

    return finalWord.trim();
};

function getWordTags(wordResult) {
    const wordTagsElement = wordResult.querySelectorAll("div.concept_light-status span.concept_light-tag");
    const wordTags = {
        common: null,
        jlpt: null,
        wanikani: null
    };
    for (let tag of wordTagsElement) {
        const tagText = tag.textContent.toLowerCase().trim();
        switch(tagText.split(' ')[0]) {
            case 'common':
                wordTags.common = "Common word<br>";
                break;
            case 'jlpt':
                wordTags.jlpt = tagText[tagText.length - 1];
                break;
            case 'wanikani':
                wordTags.wanikani = tagText[tagText.length - 1];
                break;
            default:
                console.log("The parser reached a tag that it didn't expect.");
                break;
        }
    }
    return wordTags;
};

function getMeaning()