const tableManager = new TableManager(document.querySelector("#notes-table tbody"));
const ankiConnect = new AnkiConnect();
ankiConnect.server = document.querySelector("#anki-connect-server").value;
ankiConnect.enabled = true;

const initTableBtn = document.querySelector("#init-table");
const addNotesBtn = document.querySelector("#add-anki-notes");
const ankiConnectStatus = document.querySelector("#anki-connect-status");
const ankiConnectSwitch = document.querySelector("#anki-connect-switch");

initTableBtn.addEventListener("click", (event) => {
    let gettingItem = browser.storage.local.get();
    gettingItem.then(
        items => tableManager.initTable(items),
        error => console.log(error)
    );
});

addNotesBtn.addEventListener("click", (event) => {
    jpnStorage.get(null).then(
        items => {
            const notes = [];
            for (const [hash, wordObj] of Object.entries(items)) {
                const note = {
                    deckName: "Jisho Grabber Test",
                    modelName: "Yomichan",
                    fields: {
                        Expression: wordObj.expression,
                        Reading: wordObj.expressionWithReadings,
                        Meaning: wordObj.englishMeaning,
                        "Parts of speech": wordObj.partsOfSpeech,
                        Tags: `${wordObj.common}, JLPT ${wordObj.jlpt}, Wanikani ${wordObj.wanikani}`
                    },
                    tags: [
                        "jisho-grabber"
                    ],
                    options: {
                        allowDuplicate: true
                    }
                }
                notes.push(note);
            }
            return notes;
        }
    ).then(
        notes => {
            ankiConnect.addNotes(notes);
        }
    ).then(
        value => console.log(value)
    ).catch(
        error => console.log(error)
    );
});

ankiConnectSwitch.addEventListener("change", (event) => {
    if (event.target.checked) {
        ankiConnect.server = document.querySelector("#anki-connect-server").value;
        ankiConnect.isConnected().then(
            isConnected => {
                ankiConnect.enabled = isConnected;
                if (isConnected) {
                    ankiConnectStatus.style.display = "block";
                    ankiConnectStatus.style.color = "green";
                    ankiConnectStatus.textContent = "Connected to Anki";
                } else {
                    ankiConnectStatus.style.display = "block";
                    ankiConnectStatus.style.color = "#ff4242";
                    ankiConnectStatus.textContent = "Failed to connect, see console for error";
                }
            },
            error => {
                ankiConnect.enabled = false;
                ankiConnectStatus.style.display = "block";
                ankiConnectStatus.style.color = "#ff4242";
                ankiConnectStatus.textContent = `Failed to connect: ${error.error}`;
            }
        );
    } else {
        ankiConnect.enabled = false;
        ankiConnectStatus.style.display = "none";
    }
});