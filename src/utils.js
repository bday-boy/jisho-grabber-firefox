/*
** Author:      Andrew Smith
** File:        utils.js
** Project:     jisho-grabber-firefox
** Description: This file contains functions that are useful mostly for
**              processing meaning/word data and such.
*/

const isHiragana = function(c) {
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

const isKatakana = function(c) {
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

const isKana = function(c) {
    return isHiragana(c) || isKatakana(c);
};

const kana = function(word) {
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

const kanji = function(word) {
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