class TableManager {
    constructor(tableBody) {
        this._table = tableBody;
        this._tableKeys = [
            'expression',
            'englishMeaning',
            'partsOfSpeech',
            'common',
            'jlpt',
            "wanikani"
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
            searchFilter.oninput = (event) => {
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
        let newCell;
        for (const key of this._tableKeys) {
            newCell = newRow.insertCell();
            const text = wordObj[key] ? wordObj[key] : NO_VAL_STRING;
            const newText = document.createTextNode(text);
            newCell.appendChild(newText);
        }
        const hiddenReading = document.createElement('span');
        const reading = this._anki.makeKana(wordObj['expressionWithReadings']);
        hiddenReading.textContent = reading;
        hiddenReading.classList.add('hidden-reading');
        newRow.childNodes[0].appendChild(hiddenReading);
        newRow.childNodes[0].title = reading;
        newCell = newRow.insertCell();
        const newAddBtn = this._newAddButtonElement(wordObj.noteID !== -1);
        newCell.appendChild(newAddBtn);
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
            if (searchFilter.value !== '') { activeFilters[key] = searchFilter; }
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
                if (!show) { break; }
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