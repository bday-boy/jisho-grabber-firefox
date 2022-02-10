/**
 * @author Andrew Smith
 * @file Class for managing the Japanese words in local storage. Database keys
 * are created by concatenating the Japanese expression and meaning of a
 * selected word and hashing them.
 */

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return;
  }
  console.log(`Change in storage area: ${area}`);
  const changedItems = Object.keys(changes);
  changedItems.forEach((item) => {
    console.log(`${item} has changed:`);
    console.log('Old value and new value shown below: ');
    console.log(changes[item].oldValue);
    console.log(changes[item].newValue);
  });
});

class JapaneseStorage {
  constructor(hashFunc, storageArea) {
    this._japanese = null;
    this._loaded = false;
    this._storage = storageArea;
    this._hashFunc = hashFunc;
    this._hashKeys = ['expression', 'englishMeaning'];
    this.load();
  }

  load() {
    this._loaded = false;
    return this._storage.get('japanese')
      .then((jpnObj) => {
        if (isEmptyObject(jpnObj)) {
          this._japanese = {};
        } else {
          this._japanese = jpnObj.japanese;
        }
        this._loaded = true;
      }, (error) => {
        console.log(error);
        this._loaded = false;
      });
  }

  save() {
    if (!this._loaded) return;
    return this._storage.set({ japanese: this._japanese })
      .then(() => {
        alert('Saved changes to storage.')
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * Sets new values into local storage. Since this will be used for storing
   * word-definition pairs of Japanese words, we will need to be able to
   * store multiple definitions for each word. So objects in local storage
   * will be keyed by a hash, ideally produced by concatenating the word and
   * the meaning and then hashing that.
   * @param {Object[]} item - Object of JSONifiable values to store
   */
  set(item) {
    if (!this._loaded) return;
    if (isEmptyObject(item)) {
      throw new TypeError('item must be a nonempty object.');
    }
    this._japanese[this._getHash(item)] = item;
  }

  /**
   * Gets objects from local storage. Objects are keyed by hash and that
   * hash is ideally produced by concatenating the Japanese expression and its
   * meaning.
   *
   * When items has value null or undefined, all objects in storage are
   * retrieved.
   * @param {(Object[]|null|undefined)} item - Array of objects with
   * JSONifiable values
   * @returns {Object} Object with all Japanese vocab
   */
  get(item) {
    if (!this._loaded) return {};
    if (item === null || item === undefined) {
      return this._japanese;
    }
    if (isEmptyObject(item)) {
      throw new TypeError('item must be a nonempty object.');
    }
    const gotItem = this._japanese[this._getHash(item)];
    if (gotItem !== undefined && !isEmptyObject(gotItem)) {
      return gotItem;
    } else {
      return {};
    }
  }

  /**
   * Deletes items from the Japanese object.
   * @param {(Object[]|null|undefined)} item - Array of objects with
   * JSONifiable values
   */
  del(item) {
    if (!this._loaded) return;
    if (isEmptyObject(item)) {
      throw new TypeError('item must be a nonempty object.');
    }
    delete this._japanese[this._getHash(item)];
  }

  /**
   * Checks local storage for the given item and sees if the noteID field is
   * not empty.
   * @param {Object} item
   * @returns {boolean} True if the item has a noteID, false otherwise.
   */
  checkForNoteID(item) {
    const wordObj = this.get(item);
    if (wordObj !== undefined) {
      return wordObj.noteID !== undefined && wordObj.noteID !== NO_NOTEID;
    }
    return false;
  }

  /**
   * Gets an item from storage and creates a note object to be sent to Anki.
   * @param {Object} item
   * @returns {Object} A new Anki note.
   */
  createAnkiNote(item, ankiSettings) {
    const wordObj = this.get(item);
    if (isEmptyObject(wordObj)) {
      throw new Error('Object does not exist in storage.');
    }
    const note = {
      deckName: ankiSettings.deck,
      modelName: ankiSettings.model,
      fields: {},
      tags: ankiSettings.tags,
      options: {
        allowDuplicate: true,
      },
    };
    Object.entries(ankiSettings.fields).forEach((entry) => {
      const [fieldKey, wordObjKey] = entry;
      if (wordObjKey !== NO_VAL_STRING) {
        note.fields[fieldKey] = wordObj[wordObjKey];
      } else {
        note.fields[fieldKey] = '';
      }
    });
    return note;
  }

  /**
   * Takes an object and updates a single property of it and then puts it in
   * local storage.
   * @param {Object} item - the object to be update in storage
   * @param {string} property - the property to update
   * @param {*} newValue - JSONifiable new value for the property
   */
  changeProperty(item, property, newValue) {
    if (!isObject(item)) {
      throw new TypeError('item must be an object.');
    }
    const wordObj = this.get(item);
    if (isEmptyObject(wordObj)) {
      throw new Error('Object does not exist in storage.');
    }
    this.del(wordObj);
    wordObj[property] = newValue;
    this.set(wordObj);
  }

  /**
   * Uses an object and a list of keys to concatenate values from the object
   * and hash them.
   * @param {Object} items - Object with JSONifiable values
   * @returns {string} Hex string MD5 hash
   */
  _getHash(item) {
    const hashString = this._hashKeys.reduce((prevHash, key) => prevHash + item[key], '');
    return this._hashFunc(hashString);
  }
}
