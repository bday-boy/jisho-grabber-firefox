class TableManager {
  constructor(tableBody) {
    this._table = tableBody;
    this._tableKeys = [
      'expression',
      'englishMeaning',
      'partsOfSpeech',
      'common',
      'jlpt',
      'wanikani'
    ];
    this._tableFilters = {
      japanese: {
        index: 0,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal.indexOf(enteredVal) > -1;
        }
      },
      english: {
        index: 1,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal.indexOf(enteredVal) > -1;
        }
      },
      partsOfSpeech: {
        index: 2,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal.indexOf(enteredVal) > -1;
        }
      },
      common: {
        index: 3,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal !== NO_VAL_STRING;
        }
      },
      jlpt: {
        index: 4,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal.indexOf(enteredVal) > -1;
        }
      },
      wanikani: {
        index: 5,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal.indexOf(enteredVal) > -1;
        }
      },
      added: {
        index: 6,
        value: '',
        filterFunc: (enteredVal, cellVal) => {
          return cellVal === ADD;
        }
      }
    };
    this._anki = new Anki();
  }

  initTable(wordObjs) {
    const table = this._table.closest('table');
    while (this._table.firstChild) {
      this._table.removeChild(this._table.firstChild);
    }
    this.insertRows(wordObjs);
    table.style.display = '';
    table.style.tableLayout = 'fixed';
    const searchFilters = document.querySelector('thead > tr');
    for (const searchFilter of searchFilters.querySelectorAll('input')) {
      searchFilter.oninput = () => {
        this._filterTable();
      };
    }
  }

  insertRows(wordObjs) {
    for (const [hash, wordObj] of Object.entries(wordObjs)) {
      this.insertRow(wordObj);
    }
  }

  insertRow(wordObj) {
    const newRow = this._table.insertRow();
    this.insertExpressionCell(
      newRow, wordObj.expression, wordObj.expressionWithReadings
    );
    this.insertMeaningCell(newRow, wordObj.englishMeaning);
    this.insertPartsOfSpeechCell(newRow, wordObj.partsOfSpeech);
    this.insertCommonWordCell(newRow, wordObj.common);
    this.insertJLPTCell(newRow, wordObj.jlpt);
    this.insertWaniKaniCell(newRow, wordObj.wanikani);
    this.insertButtonCell(newRow, wordObj.noteID !== -1);
  }

  insertExpressionCell(newRow, expression, reading) {
    const exprCell = this._newTextCell(newRow, expression, true, 'expression');
    exprCell.classList.add('expression')
    const hiddenReading = document.createElement('span');
    const hoverReading = this._anki.makeKana(reading);
    hiddenReading.textContent = hoverReading;
    hiddenReading.classList.add('hidden-reading');
    exprCell.appendChild(hiddenReading);
    exprCell.title = hoverReading;
  }

  insertMeaningCell(newRow, meaning) {
    this._newTextCell(newRow, meaning, true, 'englishMeaning');
  }

  insertPartsOfSpeechCell(newRow, partsOfSpeech) {
    this._newTextCell(newRow, partsOfSpeech, true, 'partsOfSpeech');
  }

  insertCommonWordCell(newRow, commonWord) {
    this._newTextCell(newRow, commonWord, true, 'common');
  }

  insertJLPTCell(newRow, jlptLevel) {
    this._newTextCell(newRow, jlptLevel, true, 'jlpt');
  }

  insertWaniKaniCell(newRow, wanikaniLevel) {
    this._newTextCell(newRow, wanikaniLevel, true, 'wanikani');
  }

  insertButtonCell(newRow, hasNoteID) {
    const newCell = newRow.insertCell();
    const newAddBtn = this._newAddButtonElement(hasNoteID);
    newCell.appendChild(newAddBtn);
  }

  getRowWordObj(element) {
    const row = element.closest('tr');
    if (!row) {
      return {};
    }
    const expressionText = row.querySelector('[data-word-obj-key=expression]').childNodes[0];
    const englishText = row.querySelector('[data-word-obj-key=englishMeaning]').childNodes[0];
    return {
      expression: expressionText.textContent.trim(),
      englishMeaning: englishText.textContent.trim(),
    };
  }

  _newTextCell(newRow, text, editable, data) {
    const newCell = newRow.insertCell();
    if (data) {
      newCell.setAttribute('data-word-obj-key', data);
    }
    if (editable) {
      newCell.setAttribute('contenteditable', 'true');
      newCell.setAttribute('spellcheck', 'false');
    }
    newCell.textContent = text ? text : NO_VAL_STRING;
    return newCell;
  }

  _updateFilterValues() {
    for (const filterType of Object.keys(this._tableFilters)) {
      const input = document.querySelector(`#filter-${filterType}`);
      switch (filterType) {
        case 'japanese':
          this._tableFilters[filterType].value = this._anki.makeKana(input.value);
          break;
        case 'english':
        case 'partsOfSpeech':
        case 'jlpt':
        case 'wanikani':
          this._tableFilters[filterType].value = input.value.toLowerCase();
          break;
        case 'added':
        case 'common':
          this._tableFilters[filterType].value = input.checked ? 'y' : '';
          break;
        default:
          console.log(`Filter type ${filterType} has not been added yet.`)
          break;
      }
    }
  }

  _filterTable() {
    this._updateFilterValues();
    const rows = document.querySelectorAll('tbody tr');
    const activeFilters = {};
    for (const [key, searchFilter] of Object.entries(this._tableFilters)) {
      if (searchFilter.value !== '') {
        activeFilters[key] = searchFilter;
      }
    }
    for (const row of rows) {
      let show = true;
      for (const [key, searchFilter] of Object.entries(activeFilters)) {
        let cellVal = this._getRowColumnValue(row, searchFilter.index);
        switch (key) {
          case 'japanese':
            cellVal += ' ' + row.cells[searchFilter.index].querySelector('span').textContent;
            break;
          case 'jlpt':
          case 'common':
          case 'english':
          case 'partsOfSpeech':
          case 'wanikani':
          case 'added':
            break;
          default:
            console.log(`Filter type ${key} has not been added yet.`)
            break;
        }
        show &= searchFilter.filterFunc(searchFilter.value, cellVal.toLowerCase());
        if (!show) {
          break;
        }
      }
      this._hideOrUnhideRow(row, show);
    }
  }

  _hideOrUnhideRow(row, shouldShow) {
    row.style.display = shouldShow ? '' : 'none';
  }

  _getRowColumnValue(row, colIndex) {
    return row.cells[colIndex].innerText || row.cells[colIndex].textContent;
  }

  _newAddButtonElement(hasNoteID) {
    const newAddBtn = document.createElement('button');
    newAddBtn.classList.add('button-pushable');
    newAddBtn.role = 'button';
    const spanShadow = document.createElement('span');
    spanShadow.classList.add('button-pushable-shadow');
    const spanEdge = document.createElement('span');
    spanEdge.classList.add('button-pushable-edge');
    const spanText = document.createElement('span');
    spanText.classList.add('button-pushable-front');
    spanText.classList.add('add-button');
    spanText.textContent = hasNoteID ? ADDED : ADD;
    newAddBtn.appendChild(spanShadow);
    newAddBtn.appendChild(spanEdge);
    newAddBtn.appendChild(spanText);
    if (!hasNoteID) {
      newAddBtn.addEventListener('click', event => {
        addNoteOnClick(event);
      });
    } else {
      turnOffButton(newAddBtn);
    }
    return newAddBtn;
  }
}