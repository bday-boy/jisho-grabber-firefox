const insertFieldSelection = function (field, modelFieldSelector, loadedVal) {
  // create wrapper elements for the span and select
  const fieldItem = document.createElement('div');
  fieldItem.classList.add('content-item');
  const fieldLeft = document.createElement('div');
  fieldLeft.classList.add('content-item-left');
  const fieldRight = document.createElement('div');
  fieldRight.classList.add('content-item-right');

  // span with Anki note field
  const fieldName = document.createElement('span');
  fieldName.textContent = field;

  // select with all wordObj keys as options, plus the empty string
  const selectKey = document.createElement('select');
  selectKey.classList.add('select-input');
  WORDOBJ_KEY_OPTIONS.forEach((wordObjKey) => {
    const keyOption = document.createElement('option');
    keyOption.value = wordObjKey;
    keyOption.textContent = wordObjKey;
    selectKey.appendChild(keyOption);
  });
  if (loadedVal) {
    selectKey.value = loadedVal;
  }

  fieldRight.appendChild(selectKey);
  fieldLeft.appendChild(fieldName);
  fieldItem.appendChild(fieldLeft);
  fieldItem.appendChild(fieldRight);

  modelFieldSelector.appendChild(fieldItem);
};

class AnkiConfig {
  constructor(ankiConnect) {
    this._deck = undefined;
    this._model = undefined;
    this._fields = [];
    this._tags = [];
    this._ankiConnect = ankiConnect;
  }

  get deck() {
    return this._deck;
  }

  set deck(deckName) {
    this._deck = undefined;
    if (deckName && typeof deckName === 'string') {
      this._deck = deckName;
    }
  }

  get model() {
    return this._model;
  }

  set model(modelName) {
    this._model = undefined;
    this._fields = [];
    if (modelName && typeof modelName === 'string') {
      this._model = modelName;
    }
  }

  get fields() {
    return this._fields;
  }

  set fields(fieldKeyMap) {
    this._fields = [];
    if (fieldKeyMap && Array.isArray(fieldKeyMap)) {
      this._fields = fieldKeyMap;
    }
  }

  get tags() {
    return this._tags;
  }

  set tags(tagsString) {
    this._tags = [];
    if (tagsString && typeof tagsString === 'string') {
      const tagsList = tagsString.split(',');
      tagsList.forEach((tag) => this._tags.push(tag.trim()));
    }
  }

  /**
     * Initializes an HTML select of deck options for the user based on the
     * decks in their AnkiConnect. If the user has already selected a deck,
     * nothing happens.
     */
  initDeckOptions(loadedVal) {
    const options = document.querySelectorAll('#select-deck :not([id="default-deck"])');
    Array.from(options).forEach(
      (deckOption) => deckOption.parentNode.removeChild(deckOption),
    );
    this._ankiConnect.getDeckNames()
      .then((response) => {
        if (response.result === undefined) return;
        const selectDeck = document.querySelector('#select-deck');
        response.result.forEach((deckName) => {
          const deckOption = document.createElement('option');
          deckOption.textContent = deckName;
          deckOption.value = deckName;
          selectDeck.appendChild(deckOption);
        });
        if (loadedVal) {
          selectDeck.value = loadedVal;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
     * Initializes an HTML select of model options for the user based on the
     * models in their AnkiConnect. If the user has already selected a model,
     * nothing happens.
     */
  initModelOptions(loadedVal) {
    const options = document.querySelectorAll('#select-model :not([id="default-model"])');
    Array.from(options).forEach(
      (modelOption) => modelOption.parentNode.removeChild(modelOption),
    );
    this._ankiConnect.getModelNames()
      .then((response) => {
        if (response.result === undefined) return;
        const selectModel = document.querySelector('#select-model');
        response.result.forEach((modelName) => {
          const deckOption = document.createElement('option');
          deckOption.textContent = modelName;
          deckOption.value = modelName;
          selectModel.appendChild(deckOption);
        });
        if (loadedVal) {
          selectModel.value = loadedVal;
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
  initFieldOptions(model, loadedVals) {
    const modelFieldSelector = document.querySelector('#select-model-fields');
    while (modelFieldSelector.firstChild) {
      modelFieldSelector.removeChild(modelFieldSelector.firstChild);
    }
    if (!model) {
      return;
    }
    if (!isObject(loadedVals)) {
      /* eslint-disable-next-line no-param-reassign */
      loadedVals = {};
    }
    this._ankiConnect.getModelFieldNames(model)
      .then((response) => {
        if (response.result === undefined) return;
        response.result.forEach((fieldName) => {
          insertFieldSelection(fieldName, modelFieldSelector, loadedVals[fieldName]);
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  loadOptions() {
    browser.storage.local.get('prevConfig')
      .then((prevConfig) => {
        if (!prevConfig || isEmptyObject(prevConfig)) {
          return;
        }
        this._fromObject(prevConfig);
        this.initDeckOptions(this.deck);
        this.initModelOptions(this.model);
        this.initFieldOptions(this.model, this.fieldsToObject());
        document.querySelector('#anki-tags').value = this._tags.join(',');
      })
      .catch((e) => {
        console.log(e);
      });
  }

  saveOptions(deckVal, modelVal) {
    this.deck = deckVal;
    this.model = modelVal;
    if (!(this.deck && this.model)) {
      return false;
    }
    const fields = document.querySelectorAll('#select-model-fields .content-item');
    Array.from(fields).forEach((field) => {
      const noteField = field.querySelector('span').textContent;
      const wordObjKey = field.querySelector('select').value;
      this._fields.push([noteField, wordObjKey]);
    });
    this.tags = document.querySelector('#anki-tags').value;
    browser.storage.local.set({ prevConfig: this.toObject() })
      .then(() => {
        console.log('Saved Anki config to storage.');
      })
      .catch(() => {
        console.log('Could not save Anki config to storage.');
      });
    return true;
  }

  resetOptions() {
    this._resetConfig();
    this.initDeckOptions();
    this.initModelOptions();
    this.initFieldOptions();
  }

  fieldsToObject() {
    const fieldsObj = {};
    this.fields.forEach((fieldKeyMap) => {
      const [field, key] = fieldKeyMap;
      fieldsObj[field] = key;
    });
    return fieldsObj;
  }

  toObject() {
    const ankiConfigObj = {
      deck: this.deck ? this.deck : null,
      model: this.model ? this.model : null,
      fields: this.fields,
      tags: this.tags,
    };
    return ankiConfigObj;
  }

  _resetConfig() {
    this.deck = undefined;
    this.model = undefined;
    this.tags = [];
    this.fields = [];
  }

  _fromObject(prevConfig) {
    const ankiConfigObj = prevConfig.prevConfig;
    this.deck = ankiConfigObj.deck;
    this.model = ankiConfigObj.model;
    this._fields = ankiConfigObj.fields;
    this._tags = ankiConfigObj.tags;
  }
}
