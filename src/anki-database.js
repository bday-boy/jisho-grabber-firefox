class AnkiDatabase {
    constructor() {
        this._db = new Database();
        this._dbName = 'notesdb';
    }

    async loadDB() {
        await this._db.open(
            this._dbName,
            1,
            [
                {
                    version: 1,
                    stores: {
                        notes: {
                            primaryKey: {
                                keyPath: 'expression_no_readings',
                                autoIncrement: false
                            },
                            indices: [
                                {name: 'expressionWithReadings', unique: false},
                                {name: 'expression', unique: true},
                                {name: 'engMeaning', unique: false},
                                {name: 'partsOfSpeech', unique: false},
                                {name: 'tags', unique: false}
                            ]
                        }
                    }
                }
            ]
        );
    }

    async close() {
        this._db.close();
    }

    _findFirstBulk(objectStoreName, indexName, items, createQuery, predicate) {
        return new Promise((resolve, reject) => {
            const itemCount = items.length;
            const results = new Array(itemCount);
            if (itemCount === 0) {
                resolve(results);
                return;
            }

            const transaction = this._db.transaction([objectStoreName], 'readonly');
            const objectStore = transaction.objectStore(objectStoreName);
            const index = objectStore.index(indexName);
            let completeCount = 0;
            const onFind = (row, itemIndex) => {
                results[itemIndex] = row;
                if (++completeCount >= itemCount) {
                    resolve(results);
                }
            };
            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                const query = createQuery(item);
                this._db.findFirst(index, query, onFind, reject, i, predicate, item, void 0);
            }
        });
    }
}