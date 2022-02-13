class TableManager {
  constructor(tableBody) {
    this._anki = new Anki();
    this._table = tableBody;
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
  }

  getRowWordObj(element) {
    const row = element.closest('tr');
    if (!row) {
      return {};
    }
    const expressionText = row.cells[0].childNodes[0];
    const englishText = row.cells[1].childNodes[0];
    return {
      expression: expressionText.textContent.trim(),
      englishMeaning: englishText.textContent.trim(),
    };
  }

  initTable(wordObjs) {
    while (this._table.firstChild) {
      this._table.removeChild(this._table.firstChild);
    }
    this._insertRows(wordObjs);

    const table = this._table.closest('table');
    table.style.display = '';
    table.style.tableLayout = 'fixed';

    const searchFilters = document.querySelector('thead > tr');
    for (const searchFilter of searchFilters.querySelectorAll('input')) {
      searchFilter.oninput = () => {
        this._filterTable();
      };
    }
  }

  _insertRows(wordObjs) {
    for (const [hash, wordObj] of Object.entries(wordObjs)) {
      this._insertRow(wordObj);
    }
  }

  _insertRow(wordObj) {
    const newRow = this._table.insertRow();
    this._insertExpressionCell(
      newRow, wordObj.expression, wordObj.expressionWithReadings
    );
    this._insertMeaningCell(newRow, wordObj.englishMeaning);
    this._insertPartsOfSpeechCell(newRow, wordObj.partsOfSpeech);
    this._insertCommonWordCell(newRow, wordObj.common);
    this._insertJLPTCell(newRow, wordObj.jlpt);
    this._insertWaniKaniCell(newRow, wordObj.wanikani);
    this._insertButtonCell(newRow, wordObj.noteID !== -1);
  }

  _insertExpressionCell(newRow, expression, reading) {
    const exprCell = this._newTextCell(newRow, expression, true, 'expression');
    exprCell.classList.add('expression')
    const hiddenReading = document.createElement('span');
    const hoverReading = this._anki.makeKana(reading);
    hiddenReading.textContent = hoverReading;
    hiddenReading.classList.add('hidden-reading');
    exprCell.appendChild(hiddenReading);
    exprCell.title = hoverReading;
  }

  _insertMeaningCell(newRow, meaning) {
    this._newTextCell(newRow, meaning, true);
  }

  _insertPartsOfSpeechCell(newRow, partsOfSpeech) {
    this._newTextCell(newRow, partsOfSpeech, true);
  }

  _insertCommonWordCell(newRow, commonWord) {
    this._newTextCell(newRow, commonWord, true);
  }

  _insertJLPTCell(newRow, jlptLevel) {
    this._newTextCell(newRow, jlptLevel, true);
  }

  _insertWaniKaniCell(newRow, wanikaniLevel) {
    this._newTextCell(newRow, wanikaniLevel, true);
  }

  _insertButtonCell(newRow, hasNoteID) {
    const newCell = newRow.insertCell();
    const newAddBtn = this._newAddButtonElement(hasNoteID);
    newCell.appendChild(newAddBtn);
  }

  _newTextCell(newRow, text, editable) {
    const newCell = newRow.insertCell();
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
      newAddBtn.addEventListener('click', addNoteOnClick);
    } else {
      turnOffButton(newAddBtn);
    }
    return newAddBtn;
  }
}