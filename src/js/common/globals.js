/* eslint-disable no-unused-vars */
const jpnStorage = new JapaneseStorage(window.md5, browser.storage.local);
const ADD = '+';
const ADDED = '✓';
const NO_NOTEID = -1;
const NO_VAL_STRING = '—';
const WORDOBJ_KEYS = [
  'expressionWithReadings',
  'expression',
  'englishMeaning',
  'partsOfSpeech',
  'common',
  'jlpt',
  'wanikani',
  'allTags',
  'noteID',
];
const WORDOBJ_KEY_OPTIONS = [
  NO_VAL_STRING,
  'expressionWithReadings',
  'expression',
  'englishMeaning',
  'partsOfSpeech',
  'common',
  'jlpt',
  'wanikani',
  'allTags',
];

/**
 * Thoroughly checks if variable is an {} object. Arrays and null also
 * count as objects in JavaScript, so we need to first check that variable
 * is an object and then check that it is neither an array nor null.
 * @param {*} variable
 * @returns {boolean} true if variable is an object, false otherwise
 */
function isObject(variable) {
  return (
    typeof variable === 'object'
    && !Array.isArray(variable)
    && variable !== null
  );
}

/**
 * Checks if a given object is empty. Also returns false if variable isn't an
 * object in the first place.
 * @param {*} variable
 * @returns {boolean} true if variable is an empty object
 */
const isEmptyObject = function (variable) {
  return (
    isObject(variable)
    && Object.keys(variable).length === 0
    && Object.getPrototypeOf(variable) === Object.prototype
  );
};

const objectHasKeys = function (obj, keys) {
  return !keys.some((key) => !Object.prototype.hasOwnProperty.call(obj, key));
};
