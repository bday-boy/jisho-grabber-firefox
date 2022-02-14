/* eslint-disable no-param-reassign */
/**
 * Initialize all classes
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
const delNotesBtn = document.querySelector('#remove-added-notes');
const refreshTable = function () {
  jpnStorage.load()
    .then(() => {
      tableManager.initTable(jpnStorage.get());
      const editableCells = document.querySelectorAll(
        '#notes-table > tbody td[contenteditable=true]',
      );
      Array.from(editableCells).forEach((cell) => {
        cell.addEventListener('focus', function saveOldValue() {
          this.oldValue = this.childNodes[0].textContent;
        });
        cell.addEventListener('blur', function updateStorage() {
          const newValue = this.childNodes[0].textContent;
          if (this.oldValue !== undefined && this.oldValue !== newValue) {
            const table = this.closest('table');
            const th = table.querySelector(`thead th:nth-child(${1 + this.cellIndex})`);
            const property = th.getAttribute('data-word-obj-key');
            const wordObj = getRowWordObj(this);
            wordObj[property] = this.oldValue;
            jpnStorage.changeProperty(wordObj, property, newValue);
            jpnStorage.save();
          }
        });
      });
    });
};

refreshTableBtn.addEventListener('click', () => { refreshTable(); });

addNotesBtn.addEventListener('click', () => {
  const addButtons = document.querySelectorAll('#notes-table tbody tr button:not([disabled])');
  Array.from(addButtons).forEach((btn) => {
    const wordObj = getRowWordObj(btn);
    addNote(wordObj, ankiConfig.toObject(), jpnStorage, ankiConnect)
      .then((added) => {
        if (added) turnOffButton(btn);
      })
      .catch((error) => {
        console.log(error);
      });
  });
  jpnStorage.save();
});
delNotesBtn.addEventListener('click', () => {
  if (confirm('Are you sure? Deleted entires cannot be recovered.')) {
    const delRows = document.querySelectorAll('#notes-table tbody tr button[disabled]');
    Array.from(delRows).forEach((btn) => {
      const wordObj = getRowWordObj(btn);
      jpnStorage.del(wordObj);
      const thisRow = btn.closest('tr');
      if (thisRow) {
        thisRow.parentNode.removeChild(thisRow);
      }
    });
    jpnStorage.save();
  }
});

window.addEventListener('focus', () => {
  console.log('Window focused');
  jpnStorage.load();
});

window.addEventListener('blur', () => {
  console.log('Window blurred');
  jpnStorage.save();
});

window.addEventListener('load', () => {
  console.log('Window loaded');
  refreshTable();
});
