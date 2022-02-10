/* eslint-disable no-param-reassign */
/**
 * Initialize all classes first
 */
const ankiConnect = new AnkiConnect();
const ankiConfig = new AnkiConfig(ankiConnect);
const tableManager = new TableManager(document.querySelector('#notes-table tbody'));

/**
 * ANKI CONNECT SETUP
 */
const ankiConnectStatus = document.querySelector('#anki-connect-status');
const ankiConnectSwitch = document.querySelector('#anki-connect-switch');

ankiConnectSwitch.checked = false;
ankiConnectSwitch.addEventListener('change', (event) => {
  if (event.target.checked) {
    ankiConnect.server = document.querySelector('#anki-connect-server').value;
    ankiConnect.isConnected()
      .then((isConnected) => {
        ankiConnect.enabled = isConnected;
        ankiConnectStatus.style.display = 'block';
        if (isConnected) {
          ankiConnectStatus.style.color = 'green';
          ankiConnectStatus.textContent = 'Connected to Anki';
          ankiConfig.initDeckOptions();
          ankiConfig.initModelOptions();
          ankiConfig.loadOptions();
        } else {
          ankiConnectStatus.style.color = '#ff4242';
          ankiConnectStatus.textContent = 'Failed to connect, see console for error';
        }
      }, (error) => {
        ankiConnect.enabled = false;
        ankiConnectStatus.style.display = 'block';
        ankiConnectStatus.style.color = '#ff4242';
        ankiConnectStatus.textContent = `Failed to connect: ${error.error}`;
        throw error;
      });
  } else {
    ankiConnect.enabled = false;
    ankiConnectStatus.style.display = 'none';
  }
});

/**
 * ANKI CONFIGURATION AND CONFIG MODAL SETUP
 */
const ankiConfigSelect = document.querySelector('#anki-config');
const configModal = document.querySelector('#anki-config-modal');
const configDeckSelect = document.querySelector('#select-deck');
const configModelSelect = document.querySelector('#select-model');
const configCloseBtn = document.querySelector('#cancel-config');
const configResetBtn = document.querySelector('#refresh-config');
const configSaveBtn = document.querySelector('#save-config');
const ankiSettings = {
  deck: 'Jisho Grabber Test',
  model: 'Jisho Test',
  fields: [
    ['Expression', 'expression'],
    ['Reading', 'expressionWithReadings'],
    ['Meaning', 'englishMeaning'],
    ['Parts of speech', 'partsOfSpeech'],
    ['Tags', 'allTags'],
  ],
};

configModelSelect.addEventListener('change', () => {
  ankiConfig.initFieldOptions(configModelSelect.value);
});

configCloseBtn.addEventListener('click', () => {
  configModal.style.display = 'none';
});

configResetBtn.addEventListener('click', () => {
  configDeckSelect.selectedIndex = 0;
  configModelSelect.selectedIndex = 0;
  ankiConfig.resetOptions();
});

configSaveBtn.addEventListener('click', () => {
  if (ankiConfig.saveOptions(configDeckSelect.value, configModelSelect.value)) {
    alert('Successfully saved Anki configuration.');
  } else {
    alert('There was an error.');
  }
});

ankiConfigSelect.addEventListener('click', () => {
  configModal.style.display = 'block';
});

/**
 * JAPANESE VOCAB TABLE SETUP
 */
const refreshTableBtn = document.querySelector('#init-table');
const addNotesBtn = document.querySelector('#add-anki-notes');

tableManager.initTable(jpnStorage.get());

refreshTableBtn.addEventListener('click', () => {
  tableManager.initTable(jpnStorage.get());
});

addNotesBtn.addEventListener('click', () => {
  const addButtons = document.querySelectorAll('#notes-table tbody tr button');
  let count = 1;
  Array.from(addButtons).forEach((button) => {
    if (!button.disabled) {
      setTimeout(button.click(), 200 * count);
      count += 1;
    }
  });
});

/**
 * FUNCTIONS FOR PAGE FUNCTIONALITY
 */

const turnOffButton = function (buttonElement) {
  buttonElement.style.cursor = 'not-allowed';
  buttonElement.disabled = 'disabled';
  const buttonSpan = buttonElement.querySelector('span.button-pushable-front');
  buttonSpan.textContent = ADDED;
  buttonSpan.classList.remove('add-button');
  buttonSpan.classList.add('added-button');
};

/**
 * Adds a single note to Anki.
 * @param {string} word
 * @param {string} meaning
 * @param {string} deck
 * @param {string} model
 * @param {Array[]} fields - Pairs/map of model fields -> WordParser.wordObj
 * keys
 */
const addNote = function (word, meaning, ankiSettings, jpnStorage, ankiConnector) {
  if (/* Make sure ankiConnect works and ankiSettings is correct */
    !ankiConnector.enabled
    || !objectHasKeys(ankiSettings, ['deck', 'model', 'tags', 'fields'])
  ) {
    return Promise.resolve(false);
  }
  const wordObj = {
    expression: word,
    englishMeaning: meaning,
  };
  const note = jpnStorage.createAnkiNote(wordObj, ankiSettings);
  return ankiConnector.addNote(note)
    .then((response) => {
      if (response.result === undefined) { return false; }
      return jpnStorage.changeProperty(wordObj, 'noteID', response.result);
    })
    .then(() => true)
    .catch((error) => {
      console.log(error);
      return false;
    });
};

const addNoteOnClick = function (event) {
  const buttonElement = event.target.closest('button.button-pushable');
  const dataRow = event.target.closest('tr');
  const rowCells = dataRow.querySelectorAll('td');
  const word = rowCells[0].childNodes[0].textContent;
  const meaning = rowCells[1].childNodes[0].textContent;
  addNote(word, meaning, ankiConfig.toObject(), jpnStorage, ankiConnect)
    .then((added) => {
      if (added) turnOffButton(buttonElement);
    })
    .catch((error) => {
      console.log(error);
    });
};

let jpnStorageTest;
window.addEventListener('focus', () => {
  console.log('Window focused');
  jpnStorage.load();
});
window.addEventListener('blur', () => {
  console.log('Window blurred');
  console.log(jpnStorage.get());
});
