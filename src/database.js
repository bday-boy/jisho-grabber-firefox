/*
 * I took this file and then edited it from https://github.com/FooSoft/yomichan.
 * Almost none of the code is mine, but any of the documentation is. Yomichan
 * lacks documentation, I am new to JavaScript, and IndexedDB has one of the
 * weirdest database APIs I've ever seen, so I wanted to annotate the code in
 * order to make it easier for myself to keep track of what this class does. It
 * also gives me an excuse to familiarize myself with JSDoc.
 */

/*
 * Copyright (C) 2020-2021  Yomichan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/** Class for opening an IndexedDB database and safely interacting with it. */
class Database {
    constructor() {
        this._db = null;
        this._isOpening = false;
    }

    // Public

    /**
     * Tries to open an IndexedDB database.
     * @param {string} databaseName 
     * @param {number} version 
     * @param {Object[]} structure - Array of objects describing database schema
     */
    async open(databaseName, version, structure) {
        if (this._db !== null) {
            throw new Error('Database already open');
        }
        if (this._isOpening) {
            throw new Error('Already opening');
        }

        try {
            this._isOpening = true;
            this._db = await this._open(databaseName, version, (db, transaction, oldVersion) => {
                this._upgrade(db, transaction, oldVersion, structure);
            });
        }
        finally {
            this._isOpening = false;
        }
    }

    /**
     * Tries to close the database. Sets the database to null if it succeeds.
     */
    close() {
        if (this._db === null) {
            throw new Error('Database is not open');
        }

        this._db.close();
        this._db = null;
    }

    /**
     * If the database is still opening, returns true. Else, false.
     * @returns {boolean} Database is opening
     */
    isOpening() {
        return this._isOpening;
    }

    /**
     * If the database is available, returns true. Else, false.
     * @returns {boolean} Database exists
     */
    isOpen() {
        return this._db !== null;
    }

    /**
     * If the database is open, an IndexedDB transaction is returned. If not,
     * an error is thrown.
     * @param {string[]} storeNames 
     * @param {('readonly'|'readwrite'|'readwriteflush')} [mode=null] 
     * @returns {IDBTransaction} Transaction if database is open
     */
    transaction(storeNames, mode) {
        if (this._db === null) {
            throw new Error(this._isOpening ? 'Database not ready' : 'Database not open');
        }
        return this._db.transaction(storeNames, mode);
    }

    /**
     * Adds a number of items from an items array starting at the start index.
     * 
     * If start + count exceeds the length of the items array, all items
     * starting at the start index will be added.
     * 
     * If count is negative, nothing will be added.
     * @param {string} objectStoreName 
     * @param {Object[]} items - Array of "tuples" to add to the object store
     * @param {number} start 
     * @param {number} count 
     * @returns {Promise} Promise to add items to the object store.
     */
    bulkAdd(objectStoreName, items, start, count) {
        return new Promise((resolve, reject) => {
            if (start + count > items.length) {
                count = items.length - start;
            }

            if (count <= 0) {
                resolve();
                return;
            }

            const transaction = this._readWriteTransaction([objectStoreName], resolve, reject);
            const objectStore = transaction.objectStore(objectStoreName);
            for (let i = start, ii = start + count; i < ii; ++i) {
                objectStore.add(items[i]);
            }
            transaction.commit();
        });
    }

    /**
     * Gets all objects from an object store or index range.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} onSuccess 
     * @param {function} onError 
     * @param {*} data 
     */
    getAll(objectStoreOrIndex, query, onSuccess, onError, data) {
        if (typeof objectStoreOrIndex.getAll === 'function') {
            this._getAllFast(objectStoreOrIndex, query, onSuccess, onError, data);
        } else {
            this._getAllUsingCursor(objectStoreOrIndex, query, onSuccess, onError, data);
        }
    }

    /**
     * Gets all keys from an object store or index range.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} onSuccess 
     * @param {function} onError 
     */
    getAllKeys(objectStoreOrIndex, query, onSuccess, onError) {
        if (typeof objectStoreOrIndex.getAllKeys === 'function') {
            this._getAllKeysFast(objectStoreOrIndex, query, onSuccess, onError);
        } else {
            this._getAllKeysUsingCursor(objectStoreOrIndex, query, onSuccess, onError);
        }
    }

    /**
     * Finds the first object of a given key or key range.
     * @param {string} objectStoreName 
     * @param {string} indexName 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} predicate 
     * @param {*} predicateArg 
     * @param {*} defaultValue 
     * @returns Promise for finding an object with a given key or key range
     */
    find(objectStoreName, indexName, query, predicate, predicateArg, defaultValue) {
        return new Promise((resolve, reject) => {
            const transaction = this.transaction([objectStoreName], 'readonly');
            const objectStore = transaction.objectStore(objectStoreName);
            const objectStoreOrIndex = indexName !== null ? objectStore.index(indexName) : objectStore;
            this.findFirst(objectStoreOrIndex, query, resolve, reject, null, predicate, predicateArg, defaultValue);
        });
    }

    /**
     * I honestly have no idea how this function works, but I'm assuming by the
     * name that it uses a cursor to find the first value of some object store
     * or index range. I just don't know why it needs to take in like 3
     * functions as arguments. But it doesn't return anything so you'd better
     * be sure one of those functions stores the cursor value somewhere.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} resolve 
     * @param {function} reject 
     * @param {*} data 
     * @param {function} predicate 
     * @param {*} predicateArg 
     * @param {*} defaultValue 
     */
    findFirst(objectStoreOrIndex, query, resolve, reject, data, predicate, predicateArg, defaultValue) {
        const noPredicate = (typeof predicate !== 'function');
        const request = objectStoreOrIndex.openCursor(query, 'next');
        request.onerror = (e) => reject(e.target.error, data);
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                const {value} = cursor;
                if (noPredicate || predicate(value, predicateArg)) {
                    resolve(value, data);
                } else {
                    cursor.continue();
                }
            } else {
                resolve(defaultValue, data);
            }
        };
    }

    /**
     * I'll keep it 💯, I'm not entirely sure what this function does. I'm not
     * sure in what context one would produce an array of targets. But if you
     * can, I imagine this function just counts the number of objects
     * in the object stores of all targets.
     * @param {event.target[]} targets 
     * @param {function} resolve 
     * @param {function} reject 
     */
    bulkCount(targets, resolve, reject) {
        const targetCount = targets.length;
        if (targetCount <= 0) {
            resolve();
            return;
        }

        let completedCount = 0;
        const results = new Array(targetCount).fill(null);

        const onError = (e) => reject(e.target.error);
        const onSuccess = (e, index) => {
            const count = e.target.result;
            results[index] = count;
            if (++completedCount >= targetCount) {
                resolve(results);
            }
        };

        for (let i = 0; i < targetCount; ++i) {
            const index = i;
            const [objectStoreOrIndex, query] = targets[i];
            const request = objectStoreOrIndex.count(query);
            request.onerror = onError;
            request.onsuccess = (e) => onSuccess(e, index);
        }
    }

    /**
     * Deletes a single key from the database.
     * @param {string} objectStoreName 
     * @param {string} key 
     * @returns Promise for deleting the singular key
     */
    delete(objectStoreName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this._readWriteTransaction([objectStoreName], resolve, reject);
            const objectStore = transaction.objectStore(objectStoreName);
            objectStore.delete(key);
            transaction.commit();
        });
    }

    /**
     * Creates a promise for deleting keys. Gets all keys and then passes the
     * key deletion function into the onSuccess argument of this.getAllKeys.
     * 
     * If filterKeys is null, all keys will be deleted. If it is not null, only
     * keys filtered out will be deleted.
     * @param {string} objectStoreName 
     * @param {string} indexName 
     * @param {(IDBValidKey|IDBKeyRange)} [query=null] 
     * @param {function} [filterKeys=null] 
     * @param {function} [onProgress=null] 
     * @returns {Promise} Promise for deleting objects
     */
    bulkDelete(objectStoreName, indexName, query, filterKeys=null, onProgress=null) {
        return new Promise((resolve, reject) => {
            const transaction = this._readWriteTransaction([objectStoreName], resolve, reject);
            const objectStore = transaction.objectStore(objectStoreName);
            const objectStoreOrIndex = indexName !== null ? objectStore.index(indexName) : objectStore;

            const onGetKeys = (keys) => {
                try {
                    if (typeof filterKeys === 'function') {
                        keys = filterKeys(keys);
                    }
                    this._bulkDeleteInternal(objectStore, keys, onProgress);
                    transaction.commit();
                } catch (e) {
                    reject(e);
                }
            };

            this.getAllKeys(objectStoreOrIndex, query, onGetKeys, reject);
        });
    }

    /**
     * Creates a promise for deleting a database with name databaseName.
     * @param {string} databaseName 
     * @returns {Promise} Promise for deleting the database
     */
    static deleteDatabase(databaseName) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(databaseName);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
            request.onblocked = () => reject(new Error('Database deletion blocked'));
        });
    }

    // Private

    /**
     * Creates a promise for opening a new database.
     * @param {string} name - IndexedDB name
     * @param {number} version - Integer for IndexedDB database version
     * @param {function} onUpgradeNeeded - Function for request.onupgradeneeded
     * @returns {Promise} Promise for opening the database
     */
    _open(name, version, onUpgradeNeeded) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);

            request.onupgradeneeded = (event) => {
                try {
                    request.transaction.onerror = (e) => reject(e.target.error);
                    onUpgradeNeeded(request.result, request.transaction, event.oldVersion, event.newVersion);
                } catch (e) {
                    reject(e);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Uses old database schema to upgrade to the newest version of the
     * IndexedDB Database.
     * @param {IDBDatabase} db
     * @param {IDBTransaction} transaction
     * @param {number} oldVersion - Integer value of old version
     * @param {Object[]} upgrades - Objects describing database schema
     */
    _upgrade(db, transaction, oldVersion, upgrades) {
        for (const {version, stores} of upgrades) {
            if (oldVersion >= version) { continue; }

            for (const [objectStoreName, {primaryKey, indices}] of Object.entries(stores)) {
                const existingObjectStoreNames = transaction.objectStoreNames || db.objectStoreNames;
                const objectStore = (
                    this._listContains(existingObjectStoreNames, objectStoreName) ?
                    transaction.objectStore(objectStoreName) :
                    db.createObjectStore(objectStoreName, primaryKey)
                );
                const existingIndexNames = objectStore.indexNames;

                for (const index of indices) {
                    if (this._listContains(existingIndexNames, index.name)) { continue; }

                    objectStore.createIndex(index.name, index.name, {unique: index.unique});
                }
            }
        }
    }

    /**
     * Searches the list in order for the value. Returns true if found at any
     * point, and returns false if the list is exhausted before finding.
     * Equality is done strictly (===).
     * @param {Array} list - The list to search
     * @param {*} value - The value to find in list
     * @returns {boolean}
     */
    _listContains(list, value) {
        for (let i = 0, ii = list.length; i < ii; ++i) {
            if (list[i] === value) { return true; }
        }
        return false;
    }

    /**
     * Gets all objects in an object store or index range.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} onSuccess 
     * @param {function} onReject 
     * @param {*} data - To be frank, idk what this one is for
     */
    _getAllFast(objectStoreOrIndex, query, onSuccess, onReject, data) {
        const request = objectStoreOrIndex.getAll(query);
        request.onerror = (e) => onReject(e.target.error, data);
        request.onsuccess = (e) => onSuccess(e.target.result, data);
    }

    /**
     * Gets all objects in an object store or index range from a cursor.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex 
     * @param {(IDBValidKey|IDBKeyRange)} query 
     * @param {function} onSuccess 
     * @param {function} onReject 
     * @param {*} data - To be frank, idk what this one is for
     */
    _getAllUsingCursor(objectStoreOrIndex, query, onSuccess, onReject, data) {
        const results = [];
        const request = objectStoreOrIndex.openCursor(query, 'next');
        request.onerror = (e) => onReject(e.target.error, data);
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                onSuccess(results, data);
            }
        };
    }

    /**
     * Uses an object store or index range and returns all keys in the given
     * range, if applicable.
     * 
     * If query is null, all keys are matched and returned.
     * 
     * The onSuccess function defines what will happen with the array of keys,
     * rather than it actually being returned by this function.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex
     * @param {(IDBValidKey|IDBKeyRange)} [query=null]
     * @param {function} onSuccess - Function to call on successful getAllKeys call
     * @param {function} onError - Function to call on erroneous getAllKeys call
     */
    _getAllKeysFast(objectStoreOrIndex, query, onSuccess, onError) {
        const request = objectStoreOrIndex.getAllKeys(query);
        request.onerror = (e) => onError(e.target.error);
        request.onsuccess = (e) => onSuccess(e.target.result);
    }

    /**
     * Uses an object store or index range to create a key cursor and returns
     * all keys from the given cursor.
     * 
     * If query is null, all keys are matched and returned.
     * 
     * The onSuccess function defines what will happen with the array of keys,
     * rather than it actually being returned by this function.
     * @param {(IDBObjectStore|IDBIndex)} objectStoreOrIndex
     * @param {(IDBValidKey|IDBKeyRange)} [query=null]
     * @param {function} onSuccess - Function to call on successful cursor request
     * @param {function} onError - Function to call on erroneous cursor request
     */
    _getAllKeysUsingCursor(objectStoreOrIndex, query, onSuccess, onError) {
        const results = [];
        const request = objectStoreOrIndex.openKeyCursor(query, 'next');
        request.onerror = (e) => onError(e.target.error);
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                results.push(cursor.primaryKey);
                cursor.continue();
            } else {
                onSuccess(results);
            }
        };
    }

    /**
     * Deletes all objects in the keys array from the objectStore.
     * @param {IDBObjectStore} objectStore - An IndexedDB ObjectStore Object
     * @param {string[]} keys - The unique keys of the objects to delete
     * @param {function} [onProgress=null] - The function to call while deleting objects
     */
    _bulkDeleteInternal(objectStore, keys, onProgress) {
        const count = keys.length;
        if (count === 0) { return; }

        let completedCount = 0;
        const onSuccess = () => {
            ++completedCount;
            try {
                onProgress(completedCount, count);
            } catch (e) {
                console.log(e.target.error);
            }
        };

        const hasProgress = (typeof onProgress === 'function');
        for (const key of keys) {
            const request = objectStore.delete(key);
            if (hasProgress) {
                request.onsuccess = onSuccess;
            }
        }
    }

    /**
     * Safely creates a database transaction only if the database is done
     * opening.
     * @param {string[]} storeNames - Array of object store names
     * @param {function} resolve - Function for transaction.oncomplete
     * @param {function} reject - Function for transaction.onabort/onerror
     * @returns {IDBTransaction} An IndexedDB transaction
     */
    _readWriteTransaction(storeNames, resolve, reject) {
        const transaction = this.transaction(storeNames, 'readwrite');
        transaction.onerror = (e) => reject(e.target.error);
        transaction.onabort = () => reject(new Error('Transaction aborted'));
        transaction.oncomplete = () => resolve();
        return transaction;
    }
}
