class LocalStorageManager {
	constructor() {
		browser.storage.onChanged.addListener(logChange);
		this.storage = browser.storage.local;
		this._size = this.storage.getBytesInUse();
	}

	/**
	 * @param {Object} items - Object of JSONifiable values to store
	 * @returns {Promise} Promise to store items in local storage
	 */
	set(items) {
		if (items === []) {
			return;
		}
		this.storage.set(items).then(
			console.log(`Success storing ${Object.keys(items).length}`),
			console.log(error)
		);
	}

	/**
	 * @param {(string|string[]|null|undefined)} keys - key or keys to get
	 * @returns {Promise} Promise to get items from local storage
	 */
	async get(keys) {
		return this.storage.get(keys);
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
		console.log(`Old value: ${changes[item].oldValue}`);
		console.log(`New value: ${changes[item].newValue}`);
	}
}