/*
** Author:      Andrew Smith
** File:        utils.js
** Project:     jisho-grabber-firefox
** Description: This file contains functions that are useful mostly for
**              processing meaning/word data and such.
*/

function isHiragana(c) {
    if (!c) {
        throw new Error(`${c} is a null-type value.`);
    }
    else if (typeof c !== 'string') {
        throw new Error(`${c} is not a string.`);
    }
    else if (c.length !== 1) {
        throw new Error(`${c} is not a single character.`);
    }
    else {
        return '\u3041' <= c && c <= '\u3096';
    }
};

function isKatakana(c) {
    if (!c) {
        throw new Error(`${c} is a null-type value.`);
    }
    else if (typeof c !== 'string') {
        throw new Error(`${c} is not a string.`);
    }
    else if (c.length !== 1) {
        throw new Error(`${c} is not a single character.`);
    }
    else {
        return '\u30a1' <= c && c <= '\u30ff';
    }
};

function isKana(c) {
    return isHiragana(c) || isKatakana(c);
};

function kana(word) {
    if (!word) {
        throw new Error(`${word} is a null-type value.`);
    }
    else if (typeof word !== 'string') {
        throw new Error(`${word} is not a string.`);
    }
    else {
        const allKana = [];
        for (let jpnchar of word) {
            if (isKana(jpnchar)) {
                allKana.push(jpnchar);
            }
        }
        return allKana.join('');
    }
};

// This one doesn't work yet lmao
function kanji(word) {
    if (!word) {
        throw new Error(`${word} is a null-type value.`);
    }
    else if (typeof word !== 'string') {
        throw new Error(`${word} is not a string.`);
    }
    else {
        const bracketRegex = new RegExp('[\[].*?[\]]');
        return word.replace(bracketRegex, '').replace(' ', '');
    }
};