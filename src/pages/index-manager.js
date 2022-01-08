const ankiConnect = new AnkiConnect();
ankiConnect.server = "http://127.0.0.1:8765/"
ankiConnect.enabled = true;

const storageLabel = document.querySelector("#storage-test");
const changeLabelBtn = document.querySelector("#change-storage-label");
const storagePrintBtn = document.querySelector("#print-storage");
const addNotesBtn = document.querySelector("#add-anki-notes");
const addNoteBtn = document.querySelector("#add-anki-note");

changeLabelBtn.addEventListener("click", (event) => {
    let gettingItem = browser.storage.local.get();
    gettingItem.then(
        item => storageLabel.innerHTML = "got items",
        error => console.log(error)
    );
});

storagePrintBtn.addEventListener("click", (event) => {
    jpnStorage.get(null).then(
        value => console.log(value)
    ).catch(
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
                        Tags: `${wordObj.common}, JLPT ${wordObj.jlpt.toUpperCase()}, Wanikani ${wordObj.wanikani}`
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