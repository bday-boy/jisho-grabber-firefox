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
    }

    initTable(wordObjs) {
        while (this._table.firstChild) {
            this._table.removeChild(this._table.firstChild);
        }
        this.insertRows(wordObjs);
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
        const newAddBtn = newAddButtonElement();
        newCell.appendChild(newAddBtn);
    }
}

function newAddButtonElement() {
    const addSVG = document.getElementById("plusSVG");
    const addSVGNew = addSVG.cloneNode();
    addSVGNew.removeAttribute("id");
    return addSVGNew;
}