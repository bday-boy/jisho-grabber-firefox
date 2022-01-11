class TableManager {
    constructor(tableBody) {
        this._table = tableBody;
        this._tableKeys = [
            "expression",
            "englishMeaning",
            "partsOfSpeech",
            "common",
            "jlpt",
            "wanikani"
        ];
        this._tableSearchFields = {
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
                    return cellVal !== "n/a";
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
                    return cellVal === "add";
                }
            }
        };
    }

    initTable(wordObjs) {
        const table = this._table.closest("table");
        table.style.display = "none";
        while (this._table.firstChild) {
            this._table.removeChild(this._table.firstChild);
        }
        this.insertRows(wordObjs);
        table.style.display = "";
        table.style["table-layout"] = "fixed";
        table.style["word-wrap"] = "break-word";
        const searchFilters = document.querySelector("thead > tr");
        for (const searchFilter of searchFilters.querySelectorAll("input")) {
            searchFilter.oninput = event => {
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
            const text = wordObj[key] ? wordObj[key] : "N/A";
            const newText = document.createTextNode(text);
            newCell.appendChild(newText);
        }
        newCell = newRow.insertCell();
        const newAddBtn = this._newAddButtonElement(wordObj.noteID !== -1);
        newCell.appendChild(newAddBtn);
    }

    _updateSearchValues() {
        for (const filterType of Object.keys(this._tableSearchFields)) {
            const input = document.querySelector(`#filter-${filterType}`);
            if (input.type === "text") {
                this._tableSearchFields[filterType].value = input.value.toLowerCase();
            } else if (input.type === "checkbox") {
                this._tableSearchFields[filterType].value = input.checked ? "y" : "";
            }
        }
    }

    _filterTable() {
        this._updateSearchValues();
        const rows = document.querySelectorAll("tbody tr");
        for (const row of rows) {
            let show = true;
            for (const [key, searchFilter] of Object.entries(this._tableSearchFields)) {
                if (searchFilter.value !== '') {
                    const cellVal = this._getRowColumnValue(row, searchFilter.index);
                    show &= searchFilter.filterFunc(searchFilter.value, cellVal.toLowerCase());
                    if (!show) { break; }
                } else {
                    show &= true;
                }
            }
            this._hideOrUnhideRow(row, show);
        }
    }

    _hideOrUnhideRow(row, shouldShow) {
        row.style.display = shouldShow ? "" : "none";
    }

    _getRowColumnValue(row, colIndex) {
        return row.cells[colIndex].textContent || row.cells[colIndex].innerText;
    }

    _newAddButtonElement(hasNoteID) {
        const buttonWrapper = document.createElement("div");
        buttonWrapper.className += "button-wrapper";
        const addButton = document.createElement("button");
        addButton.className += "button-pretty";
        addButton.disabled = hasNoteID;
        const addButtonText = document.createElement("span");
        addButtonText.textContent = hasNoteID ? "Added" : "Add";
        addButton.appendChild(addButtonText);
        buttonWrapper.appendChild(addButton);
        if (!hasNoteID) {
            addButton.addEventListener("click", event => {
                addNoteOnClick(event);
            });
        } else {
            turnOffButton(addButton);
        }
        return buttonWrapper;
    }
}