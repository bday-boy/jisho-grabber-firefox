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
        const newAddBtn = newAddButtonElement(wordObj.noteID === undefined);
        newCell.appendChild(newAddBtn);
    }
}

function newAddButtonElement(isOn) {
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className += "button-wrapper";
    const addButton = document.createElement("button");
    addButton.className += "button-pretty";
    addButton.addEventListener("click", event => {
        // do stuff here to add card to Anki
        console.log("Clicked an add button");
        event.target.textContent = "Added";
    });
    addButton.disabled = !isOn;
    const addButtonText = document.createElement("span");
    addButtonText.textContent = isOn ? "Add" : "Added";
    addButton.appendChild(addButtonText);
    buttonWrapper.appendChild(addButton);
    return buttonWrapper;
}