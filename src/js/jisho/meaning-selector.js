/**
 * @author Andrew Smith
 * @file This file contains functionality to highlight a definition of
 * a word on Jisho and save it locally.
 */

let drawn = false;
const parser = new WordParser();

(function() {
    const meaningWrappers = document.querySelectorAll('div.meaning-wrapper');
    for (const meaningWrapperElement of meaningWrappers) {
        meaningWrapperElement.style.cursor = 'crosshair';
        meaningWrapperElement.addEventListener('mouseenter', (event) => {
            if (meaningWrapperElement !== null && !drawn) {
                highlightElement(meaningWrapperElement);
                drawn = true;
            }
        });
        meaningWrapperElement.addEventListener('mouseleave', (event) => {
            if (myCanvas !== undefined && myCanvas.parentNode !== undefined) {
                let ctx = myCanvas.getContext('2d', {alpha: true});
                ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
                drawn = false;
            }
        });
        meaningWrapperElement.addEventListener('click', (event) => {
            storeWord(event.target);
            jpnStorage.get().then(
                value => console.log(value),
                error => console.log(error)
            );
        });
    }
})();

function storeWord(wordResultElement) {
    parser.parseWord(wordResultElement);
    const newItem = parser.wordObject;
    const hashKeys = ['expression', 'englishMeaning'];
    jpnStorage.checkForNoteID(newItem, hashKeys)
        .then(alreadyAdded => {
            if (!alreadyAdded) {
                return jpnStorage.set([newItem], hashKeys);
            }
        })
        .then(value => console.log(value))
        .catch(error => console.log(error));
}