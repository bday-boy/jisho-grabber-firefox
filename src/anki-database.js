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
                            primaryKey: {keyPath: 'expression_no_readings', autoIncrement: false},
                            indices: [
                                {name: 'expression_with_readings', unique: false},
                                {name: 'expression', unique: true},
                                {name: 'eng_meaning', unique: false},
                                {name: 'parts_of_speech', unique: false},
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
}