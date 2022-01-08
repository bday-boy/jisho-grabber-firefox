/**
 * @author Andrew Smith
 * @file Class for managing the Japanese words in local storage. Database keys
 * are created by concatenating the Japanese expression and meaning of a
 * selected word and hashing them.
 */

class JapaneseStorage {
	constructor(hashFunc) {
		browser.storage.onChanged.addListener(logChange);
		this._storage = browser.storage.local;
		this._hashFunc = hashFunc;
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
	async set(items, hashKeys) {
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
		this._storage.set(setObject);
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
	async get(items, hashKeys) {
		if (items === null || items === undefined || items.length === 0) {
			// browser.storage.local.get returns all stored objects when no
			// argument is passed in
			return this._storage.get();
		}
		if (!Array.isArray(hashKeys) || hashKeys.length === 0) {
			throw new TypeError("hashKeys must be an array with length > 0 unless items is null, undefined, or [].");
		}
		const keys = [];
		for (let item of items) {
			keys.push(this._getHash(item, hashKeys));
		}
		return this._storage.get(keys);
	}

	/**
	 * Takes an object and updates a single property of it and then puts it in
	 * local storage.
	 * @param {Object} item - the object to be update in storage
	 * @param {string[]} hashKeys - string values of object keys to use in the
	 * md5 hash
	 * @param {string} property - the property to update
	 * @param {*} newValue - JSONifiable new value for the property
	 */
	changeProperty(item, hashKeys, property, newValue) {
		if (!isObject(item)) {
			throw new TypeError("item must be an object.");
		}
		if (!Array.isArray(hashKeys) || hashKeys.length === 0) {
			throw new TypeError("hashKeys must be an array with length > 0.");
		}
		const hash = this._getHash(item, hashKeys);
		item[property] = newValue;
		const changedItem = {
			[hash]: item
		};
		this.set([changedItem], hashKeys).then(
			value => console.log(value),
			this._onError
		);
	}

	/**
	 * Logs an error from storage.js.
	 * @param {Error} error 
	 */
	_onError(error) {
		console.log("Something went wrong with my code in storage.js! :(");
		console.log(error);
	}

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

function logChange(changes, area) {
	if (area !== 'local') {
		return;
	}
	console.log(`Change in storage area: ${area}`);

	const changedItems = Object.keys(changes);

	for (const item of changedItems) {
		console.log(`${item} has changed:`);
		console.log('Old value and new value shown below: ');
		console.log(changes[item].oldValue);
		console.log(changes[item].newValue);
	}
}