/*
** Author:      Andrew Smith
** File:        jisho-page-selector.js
** Project:     jisho-grabber-firefox
** Description: This file contains functionality to highlight a definition of
**              a word on Jisho and save it locally.
*/

elem = document.getElementById("main_results");
elem.onclick = function(event) {
    let clicked_elem = event.target;
    let word_class = "meaning-wrapper";
    while (clicked_elem !== null && clicked_elem.getAttribute("class") !== word_class) {
        clicked_elem = clicked_elem.parentElement;
    }
    if (clicked_elem !== null) {
        highlightElement(clicked_elem);
    }
};