const initTableBtn = document.querySelector("#init-table");
const addNotesBtn = document.querySelector("#add-anki-notes");
const ankiConnectStatus = document.querySelector("#anki-connect-status");
const ankiConnectSwitch = document.querySelector("#anki-connect-switch");
const ankiConnect = new AnkiConnect();
const tableManager = new TableManager(document.querySelector("#notes-table tbody"));
jpnStorage.get().then(
    items => tableManager.initTable(items),
    error => console.log(error)
);
const ankiSettings = {
    deck: "Jisho Grabber Test",
    model: "Jisho Test",
    fields: [
        ["Expression", "expression"],
        ["Reading", "expressionWithReadings"],
        ["Meaning", "englishMeaning"],
        ["Parts of speech", "partsOfSpeech"],
        ["Tags", "common"]
    ]
};

initTableBtn.addEventListener("click", (event) => {
    jpnStorage.get().then(
        items => tableManager.initTable(items),
        error => console.log(error)
    );
});

addNotesBtn.addEventListener("click", (event) => {
    const addButtons = document.querySelectorAll("#notes-table tbody tr button");
    let count = 1;
    for (const button of addButtons) {
        if (!button.disabled) {
            setTimeout(button.click(), 200 * count);
        }
    }
    // jpnStorage.get().then(
    //     items => {
    //         const notes = [];
    //         for (const [hash, wordObj] of Object.entries(items)) {
    //             const note = {
    //                 deckName: ankiSettings.deck,
    //                 modelName: ankiSettings.model,
    //                 fields: {
    //                     Expression: wordObj.expression,
    //                     Reading: wordObj.expressionWithReadings,
    //                     Meaning: wordObj.englishMeaning,
    //                     "Parts of speech": wordObj.partsOfSpeech,
    //                     Tags: `${wordObj.common}, JLPT ${wordObj.jlpt}, Wanikani ${wordObj.wanikani}`
    //                 },
    //                 tags: document.querySelector("#anki-tags").value.split(","),
    //                 options: {
    //                     allowDuplicate: true
    //                 }
    //             }
    //             notes.push(note);
    //         }
    //         return notes;
    //     }
    // ).then(
    //     notes => {
    //         ankiConnect.addNotes(notes);
    //     }
    // ).then(
    //     value => console.log(value)
    // ).catch(
    //     error => console.log(error)
    // );
});

ankiConnectSwitch.checked = false;
ankiConnectSwitch.addEventListener("change", (event) => {
    if (event.target.checked) {
        ankiConnect.server = document.querySelector("#anki-connect-server").value;
        ankiConnect.isConnected().then(
            isConnected => {
                ankiConnect.enabled = isConnected;
                ankiConnectStatus.style.display = "block";
                if (isConnected) {
                    ankiConnectStatus.style.color = "green";
                    ankiConnectStatus.textContent = "Connected to Anki";
                } else {
                    ankiConnectStatus.style.color = "#ff4242";
                    ankiConnectStatus.textContent = "Failed to connect, see console for error";
                }
            },
            error => {
                ankiConnect.enabled = false;
                ankiConnectStatus.style.display = "block";
                ankiConnectStatus.style.color = "#ff4242";
                ankiConnectStatus.textContent = `Failed to connect: ${error.error}`;
                throw error;
            }
        );
    } else {
        ankiConnect.enabled = false;
        ankiConnectStatus.style.display = "none";
    }
});

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
    ankiSettings.tags = document.querySelector("#anki-tags").value.split(",");
    if ( /* Make sure ankiConnect works and ankiSettings is correct */
        !ankiConnector.enabled
        || !objectHasKeys(ankiSettings, ["deck", "model", "tags", "fields"])
    ) {
        return Promise.resolve(false);
    }
    const hashKeys = ["expression", "englishMeaning"];
    const wordObj = {
        expression: word,
        englishMeaning: meaning
    };
    return jpnStorage.createAnkiNote(wordObj, hashKeys)
        .then(note => {
            if (isEmptyObject(note)) { return {}; }
            return ankiConnector.addNote(note);
        })
        .then(response => {
            if (response.result === undefined) { return false; }
            return jpnStorage.changeProperty(wordObj, hashKeys, "noteID", response.result);
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
    const buttonElement = event.target.closest("button.button-pushable");
    const dataRow = event.target.closest("tr");
    const rowCells = dataRow.querySelectorAll("td")
    const word = rowCells[0].childNodes[0].textContent;
    const meaning = rowCells[1].childNodes[0].textContent;
    addNote(word, meaning, ankiSettings, jpnStorage, ankiConnect)
        .then(added => {
            if (added) { turnOffButton(buttonElement); }
        })
        .catch(error => {
            console.log(error);
        });
}

function turnOffButton(buttonElement) {
    buttonElement.style.cursor = "not-allowed";
    buttonElement.disabled = "disabled";
    const buttonSpan = buttonElement.querySelector("span.button-pushable-front");
    buttonSpan.textContent = ADDED;
    buttonSpan.classList.remove("add-button");
    buttonSpan.classList.add("added-button");
}