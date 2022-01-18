/**
 * ANKI CONNECT SETUP
 */
const ankiConnect = new AnkiConnect();
const ankiConfig = new AnkiConfig(ankiConnect);
const ankiConnectStatus = document.querySelector('#anki-connect-status');
const ankiConnectSwitch = document.querySelector('#anki-connect-switch');

ankiConnectSwitch.checked = false;
ankiConnectSwitch.addEventListener('change', (event) => {
    if (event.target.checked) {
        ankiConnect.server = document.querySelector('#anki-connect-server').value;
        ankiConnect.isConnected()
            .then(isConnected => {
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
            }, error => {
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
        ['Tags', 'allTags']
    ]
};

configModelSelect.addEventListener('change', (event) => {
    ankiConfig.initFieldOptions(configModelSelect.value);
});

configCloseBtn.addEventListener('click', (event) => {
    configModal.style.display = 'none';
});

configResetBtn.addEventListener('click', (event) => {
    configDeckSelect.selectedIndex = 0;
    configModelSelect.selectedIndex = 0;
    ankiConfig.resetOptions();
});

configSaveBtn.addEventListener('click', (event) => {
    if (ankiConfig.saveOptions(configDeckSelect.value, configModelSelect.value)) {
        alert('Successfully saved Anki configuration.');
    } else {
        alert('There was an error.');
    }
});

ankiConfigSelect.addEventListener('click', (event) => {
    configModal.style.display = 'block';
});

/**
 * JAPANESE VOCAB TABLE SETUP
 */
const refreshTableBtn = document.querySelector('#init-table');
const addNotesBtn = document.querySelector('#add-anki-notes');
const tableManager = new TableManager(document.querySelector('#notes-table tbody'));

jpnStorage.get().then(
    items => tableManager.initTable(items),
    error => console.log(error)
);

refreshTableBtn.addEventListener('click', (event) => {
    jpnStorage.get().then(
        items => tableManager.initTable(items),
        error => console.log(error)
    );
});

addNotesBtn.addEventListener('click', (event) => {
    const addButtons = document.querySelectorAll('#notes-table tbody tr button');
    let count = 1;
    for (const button of addButtons) {
        if (!button.disabled) {
            setTimeout(button.click(), 200 * count);
        }
    }
});

/**
 * FUNCTIONS FOR PAGE FUNCTIONALITY
 */

/**
 * 
 * @param {string} word 
 * @param {string} meaning 
 * @param {string} deck 
 * @param {string} model 
 * @param {Array[]} fields - Pairs/map of model fields -> WordParser.wordObj
 * keys
 */
function addNote(word, meaning, ankiSettings, jpnStorage, ankiConnector) {
    if ( /* Make sure ankiConnect works and ankiSettings is correct */
        !ankiConnector.enabled
        || !objectHasKeys(ankiSettings, ['deck', 'model', 'tags', 'fields'])
    ) {
        return Promise.resolve(false);
    }
    const hashKeys = ['expression', 'englishMeaning'];
    const wordObj = {
        expression: word,
        englishMeaning: meaning
    };
    return jpnStorage.createAnkiNote(wordObj, hashKeys, ankiSettings)
        .then(note => {
            if (isEmptyObject(note)) { return {}; }
            return ankiConnector.addNote(note);
        })
        .then(response => {
            if (response.result === undefined) { return false; }
            return jpnStorage.changeProperty(wordObj, hashKeys, 'noteID', response.result);
        })
        .then(() => {
            return true;
        })
        .catch(error => {
            console.log(error);
            return false;
        });
}

function addNoteOnClick(event) {
    const buttonElement = event.target.closest('button.button-pushable');
    const dataRow = event.target.closest('tr');
    const rowCells = dataRow.querySelectorAll('td')
    const word = rowCells[0].childNodes[0].textContent;
    const meaning = rowCells[1].childNodes[0].textContent;
    addNote(word, meaning, ankiConfig.toObject(), jpnStorage, ankiConnect)
        .then(added => {
            if (added) { turnOffButton(buttonElement); }
        })
        .catch(error => {
            console.log(error);
        });
}

function turnOffButton(buttonElement) {
    buttonElement.style.cursor = 'not-allowed';
    buttonElement.disabled = 'disabled';
    const buttonSpan = buttonElement.querySelector('span.button-pushable-front');
    buttonSpan.textContent = ADDED;
    buttonSpan.classList.remove('add-button');
    buttonSpan.classList.add('added-button');
}