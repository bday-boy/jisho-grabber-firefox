class AnkiConfig {
    constructor(ankiConnect) {
        this._deck = undefined;
        this._model = undefined;
        this._fields = [];
        this._ankiConnect = ankiConnect;
    }

    get deck() {
        return this._deck;
    }

    set deck(deckName) {
        if (deckName === '') {
            this._deck = undefined;
        } else {
            this._deck = deckName
        }
    }

    get model() {
        return this._model;
    }

    set model(modelName) {
        if (modelName === '') {
            this._model = undefined;
        } else {
            this._model = modelName
            this._fields = [];
        }
    }

    get fields() {
        return this._fields;
    }

    set fields(fieldKeyMap) {
        this._fields.push(fieldKeyMap);
    }

    /**
     * Initializes a an HTML select of deck options for the user based on the
     * decks in their AnkiConnect. If the user has already selected a deck,
     * nothing happens.
     */
    initDeckOptions() {
        if (this._deck !== undefined) return;
        this._ankiConnect.getDeckNames()
            .then((response) => {
                if (response.result === undefined) return;
                const selectDeck = document.querySelector('#select-deck');
                for (const deckName of response.result) {
                    const deckOption = document.createElement('option');
                    deckOption.textContent = deckName;
                    deckOption.value = deckName;
                    selectDeck.appendChild(deckOption);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /**
     * Initializes a an HTML select of model options for the user based on the
     * models in their AnkiConnect. If the user has already selected a model,
     * nothing happens.
     */
    initModelOptions() {
        if (this._model !== undefined) return;
        this._ankiConnect.getModelNames()
            .then((response) => {
                if (response.result === undefined) return;
                const selectDeck = document.querySelector('#select-model');
                for (const modelName of response.result) {
                    const deckOption = document.createElement('option');
                    deckOption.textContent = modelName;
                    deckOption.value = modelName;
                    selectDeck.appendChild(deckOption);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /**
     * Initializes several HTML selects of field options based on the user's
     * model selection.
     */
    initFieldOptions() {
        const modelFieldSelector = document.querySelector('#select-model-fields');
        while (modelFieldSelector.firstChild) {
            modelFieldSelector.removeChild(modelFieldSelector.firstChild);
        }
        if (this._model === undefined) return;
        this._ankiConnect.getModelFieldNames(this._model)
            .then((response) => {
                if (response.result === undefined) return;
                for (const fieldName of response.result) {
                    this._insertFieldSelection(fieldName, modelFieldSelector);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    _insertFieldSelection(field, modelFieldSelector) {
        // create wrapper elements for the span and select
        const fieldItem = document.createElement('div');
        fieldItem.classList.add('content-item')
        const fieldLeft = document.createElement('div');
        fieldLeft.classList.add('content-item-left')
        const fieldRight = document.createElement('div');
        fieldRight.classList.add('content-item-right')

        // span with Anki note field
        const fieldName = document.createElement('span');
        fieldName.textContent = field;

        // select with all wordObj keys as options, plus the empty string
        const selectKey = document.createElement('select');
        selectKey.classList.add('select-input');
        for (const wordObjKey of WORDOBJ_KEY_OPTIONS) {
            const keyOption = document.createElement('option');
            keyOption.value = wordObjKey;
            keyOption.textContent = wordObjKey;
            selectKey.appendChild(keyOption);
        }

        fieldRight.appendChild(selectKey);
        fieldLeft.appendChild(fieldName);
        fieldItem.appendChild(fieldLeft);
        fieldItem.appendChild(fieldRight);

        modelFieldSelector.appendChild(fieldItem);
    }
}