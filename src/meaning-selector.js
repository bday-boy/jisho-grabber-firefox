/*
 * Author:      Andrew Smith
 * File:        jisho-page-selector.js
 * Project:     jisho-grabber-firefox
 * Description: This file contains functionality to highlight a definition of
 *              a word on Jisho and save it locally.
 */

let drawn = false;
const parser = new WordParser();
const db = new AnkiDatabase();
db.loadDB().then((value) => console.log(value), (error) => console.log(error));

(function() {
    let meaningWrappers = document.querySelectorAll("div.meaning-wrapper");
    for (let meaningWrapperElement of meaningWrappers) {
        meaningWrapperElement.style.cursor = "crosshair";
        meaningWrapperElement.addEventListener("mouseenter", (event) => {
            if (meaningWrapperElement !== null && !drawn) {
                highlightElement(meaningWrapperElement);
                drawn = true;
            }
        });
        meaningWrapperElement.addEventListener("mouseleave", (event) => {
            if (myCanvas !== undefined && myCanvas.parentNode !== undefined) {
                let ctx = myCanvas.getContext('2d', {alpha: true});
                ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
                drawn = false;
            }
        });
        meaningWrapperElement.addEventListener("click", (event) => {
            saveDefinition(event.target);
        });
    }
})();

async function ankiConnected() {
    const fulfilled = await ankiComm.isConnected();
    return fulfilled;
}

function saveDefinition(wordResultElement) {
    parser.parseWord(wordResultElement);
    const newItem = [parser.wordObject];
    db.bulkAdd('notes', newItem, 0, 1)
    .then((value) => console.log(value), (error) => console.log(error));
}