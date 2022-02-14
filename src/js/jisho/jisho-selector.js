/**
 * @file This file contains functionality to highlight a definition of
 * a word on Jisho and save it locally.
 */

let drawn = false;
const parser = new WordParser();

/**
 * Stores a definition in Jisho if it doesn't already exist in storage.
 * @param {Element} wordResultElement - The DOM element of the definition to store
 */
const storeWord = function (wordResultElement) {
  parser.parseWord(wordResultElement);
  const newItem = parser.wordObject;
  if (!jpnStorage.checkForNoteID(newItem)) {
    jpnStorage.set(newItem);
  }
};

/**
 * The main function to add page functionality for saving definitions from Jisho.
 */
const onLoad = function () {
  (function highlightDefinitions() {
    const meaningWrappers = document.querySelectorAll('div.meaning-wrapper');
    Array.from(meaningWrappers).forEach((meaningWrapperElement) => {
      // eslint-disable-next-line no-param-reassign
      meaningWrapperElement.style.cursor = 'crosshair';
      meaningWrapperElement.addEventListener('mouseenter', () => {
        if (meaningWrapperElement !== null && !drawn) {
          highlightElement(meaningWrapperElement);
          drawn = true;
        }
      });
      meaningWrapperElement.addEventListener('mouseleave', () => {
        if (myCanvas !== undefined && myCanvas.parentNode !== undefined) {
          const ctx = myCanvas.getContext('2d', { alpha: true });
          ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
          drawn = false;
        }
      });
      meaningWrapperElement.addEventListener('click', (event) => {
        storeWord(event.target);
        console.log(jpnStorage.get());
      });
    });
  }());
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onLoad);
} else {
  onLoad();
}

window.addEventListener('focus', () => {
  console.log('Loading content from Japanese storage...');
  jpnStorage.load();
});

window.addEventListener('blur', () => {
  console.log('Saving content to Japanese storage...');
  jpnStorage.save();
});
