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
        this._table.style.display = "none";
        while (this._table.firstChild) {
            this._table.removeChild(this._table.firstChild);
        }
        this.insertRows(wordObjs);
        this._table.removeAttribute("style");
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
        const newAddBtn = newAddButtonElement(wordObj.noteID !== -1);
        newCell.appendChild(newAddBtn);
    }
}

function newAddButtonElement(hasNoteID) {
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