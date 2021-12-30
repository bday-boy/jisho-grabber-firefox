/*
** Author:      Andrew Smith
** File:        jisho-search-selector.js
** Project:     jisho-grabber-firefox
** Description: This file contains functionality to highlight a definition of
**              a word on Jisho and save it locally.
*/

browser.contextMenus.create({
    id: "select-definition",
    title: "Select a definition on Jisho",
    contexts: ["page"],
});

// browser.contextMenus.onClicked.addListener((info, tab) => {
//     if (info.menuItemId === "select-definition") {
//         if (info.targetElementId !== undefined) {
//             let elem = browser.contextMenus.getTargetElement(info.targetElementId);
//             elem = get_word_element(elem);
//             highlightElement(elem);
//         }
//     }
// });