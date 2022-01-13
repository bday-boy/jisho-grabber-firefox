/**
 * @author Andrew Smith
 * @file Class for managing the Japanese words in local storage. Database keys
 * are created by concatenating the Japanese expression and meaning of a
 * selected word and hashing them.
 */

class JapaneseStorage {
	constructor(hashFunc, storageArea) {
		browser.storage.onChanged.addListener((changes, area) => {
			if (area !== 'local') { return; }
			console.log(`Change in storage area: ${area}`);
			const changedItems = Object.keys(changes);
			for (const item of changedItems) {
				console.log(`${item} has changed:`);
				console.log('Old value and new value shown below: ');
				console.log(changes[item].oldValue);
				console.log(changes[item].newValue);
			}
		});
		this._storage = storageArea;
		this._hashFunc = hashFunc;
		this._hashKeys = ["expression", "englishMeaning"];
	}

	/**
	 * Sets new values into local storage. Since this will be used for storing
	 * word-definition pairs of Japanese words, we will need to be able to
	 * store multiple definitions for each word. So objects in local storage
	 * will be keyed by a hash, ideally produced by concatenating the word and
	 * the meaning and then hashing that.
	 * @param {Object[]} items - Object of JSONifiable values to store
	 * @param {string[]} hashKeys - String values of object keys to use in the
	 * md5 hash
	 * @returns {Promise} Promise to store items in local storage
	 */
	set(items, hashKeys) {
		if (!Array.isArray(items) || items === []) {
			throw new TypeError("items must be a non-empty array of objects.");
		}
		if (!Array.isArray(hashKeys) || hashKeys.length === 0) {
			throw new TypeError("hashKeys must be an array with length > 0.");
		}
		const setObject = {};
		for (const item of items) {
			setObject[this._getHash(item, hashKeys)] = item;
		}
		return this._storage.set(setObject);
	}

	/**
	 * Gets objects from local storage. Objects are keyed by hash and that
	 * hash is ideally produced by concatenating the Japanese expression and its
	 * meaning.
	 * 
	 * When items has value null or undefined, all objects in storage are
	 * retrieved.
	 * @param {(Object[]|null|undefined)} items - Array of objects with
	 * JSONifiable values
	 * @param {string[]} [hashKeys=null] - String values of object keys to use
	 * in the md5 hash
	 * @returns {Promise} Promise to get items from local storage
	 */
	get(items, hashKeys) {
		if (items === null || items === undefined || items.length === 0) {
			// browser.storage.local.get returns all stored objects when no
			// argument is passed in
			return this._storage.get();
		}
		if (!Array.isArray(hashKeys) || hashKeys.length === 0) {
			throw new TypeError("hashKeys must be an array with length > 0 unless items is null, undefined, or [].");
		}
		const keys = [];
		for (const item of items) {
			keys.push(this._getHash(item, hashKeys));
		}
		return this._storage.get(keys);
	}

	/**
	 * Checks local storage for the given item and sees if the noteID field is
	 * not empty.
	 * @param {Object} item 
	 * @param {string[]} hashKeys 
	 * @returns {Promise} A promise that resolve to true if the item has a note
	 * ID, false otherwise, and throws an error on rejection
	 */
	checkForNoteID(item, hashKeys) {
		return this.get([item], hashKeys)
			.then(foundItem => {
				if (isEmptyObject(foundItem)) {
					return false;
				}
				const wordObj = Object.entries(foundItem)[0][1];
				return wordObj.noteID !== NO_NOTEID;
			}, error => {
				console.log("Couldn't check storage item for note ID.");
				throw error;
			});
	}

	/**
	 * 
	 * @param {Object} item 
	 * @param {string[]} hashKeys 
	 * @returns {Promise} A promise that resolves to a new Anki note and rejects
	 * with an error.
	 */
	createAnkiNote(item, hashKeys) {
		return this.get([item], hashKeys)
			.then(storageWordObj => {
				if (isEmptyObject(storageWordObj)) { return {}; }
				const wordObj = Object.entries(storageWordObj)[0][1];
				const note = {
					deckName: ankiSettings.deck,
					modelName: ankiSettings.model,
					fields: {},
					tags: ankiSettings.tags,
					options: {
						allowDuplicate: true
					}
				};
				for (const [fieldKey, wordObjKey] of ankiSettings.fields) {
					if (wordObjKey) {
						note.fields[fieldKey] = wordObj[wordObjKey];
					} else {
						note.fields[fieldKey] = '';
					}
				}
				return note;
			}, error => {
				console.log("Couldn't create anki note from storage item.");
				throw error;
			});
	}

	/**
	 * Takes an object and updates a single property of it and then puts it in
	 * local storage.
	 * @param {Object} item - the object to be update in storage
	 * @param {string[]} hashKeys - string values of object keys to use in the
	 * md5 hash
	 * @param {string} property - the property to update
	 * @param {*} newValue - JSONifiable new value for the property
	 * @returns {Promise} A promise to change the item's property in local
	 * storage.
	 */
	changeProperty(item, hashKeys, property, newValue) {
		if (!isObject(item)) {
			throw new TypeError("item must be an object.");
		}
		return this.get([item], hashKeys)
			.then(storageItem => {
				if (isEmptyObject(storageItem)) {
					throw new Error("Object does not exist in storage.");
				}
				const hash = Object.entries(storageItem)[0][0];
				storageItem[hash][property] = newValue;
				this._storage.set(storageItem);
			}, error => {
				console.log("Could not change property in database.");
				throw error;
			});
	}

	// ankiSync(ankiConnect, hashKeys, hashFields) {
	// 	if (ankiConnect.enabled !== true) { return; }
	// 	const addedItems = {};
	// 	this.get()
	// 	    .then(storageItems => {
	// 			const allNoteIDs = [];
	// 			for (const [hash, wordObj] of Object.entries(storageItems)) {
	// 				if (wordObj.noteID !== NO_NOTEID) {
	// 					addedItems[wordObj.noteID] = {
	// 						hash: hash,
	// 						wordObj: wordObj
	// 					};
	// 					allNoteIDs.push(wordObj.noteID);
	// 				}
	// 			}
	// 			return allNoteIDs;
	// 		})
	// 		.then(allNoteIDs => {
	// 			return ankiConnect.notesInfo(allNoteIDs);
	// 		})
	// 		.then(response => {
	// 			if (response.result === undefined) { return; }
	// 			for (const note of response.result) {
	// 				const wordObj = {
	// 					[hashFields[0]]: note.fields[hashFields[0]],
	// 					[hashFields[1]]: note.fields[hashFields[1]]
	// 				};
	// 				const noteHash = this._getHash(wordObj, hashFields);
	// 				const itemHash = addedItems[note.noteId].hash;
	// 				if (noteHash !== itemHash) {
	// 					addedItems[note.noteId].wordObj[hashKeys[0]] = wordObj[hashFields[0]];
	// 					addedItems[note.noteId].wordObj[hashKeys[1]] = wordObj[hashFields[1]];
	// 					const newItem = {
	// 						noteHash: addedItems[note.noteId].wordObj
	// 					};
	// 					Promise.all(
	// 						this._storage.remove(itemHash),
	// 						this.set([newItem])
	// 					);
	// 				}
	// 			}
	// 		})
	// }

	/**
	 * Uses an object and a list of keys to concatenate values from the object
	 * and hash them.
	 * @param {Object} items - Object with JSONifiable values
	 * @param {string[]} hashKeys - String values of object keys to use in the
	 * md5 hash
	 * @returns {string} Hex string MD5 hash
	 */
	_getHash(item, hashKeys) {
		let stringToHash = '';
		for (const key of hashKeys) {
			stringToHash += item[key];
		}
		return this._hashFunc(stringToHash);
	}
}