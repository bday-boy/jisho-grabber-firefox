/*
** Author:      Andrew Smith
** File:        search-selection.js
** Project:     jisho-grabber-firefox
** Description: This file contains functionality to add a search function to
**              the right-click context menu in Firefox.
*/

browser.contextMenus.create({
    id: "select-search",
    title: "Search %s on Jisho",
    contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "select-search") {
        let search_text = info.selectionText;
        search_jisho(search_text);
    }
});

const search_jisho = function(word) {
    let tab_data = {
        url: `https://jisho.org/search/${escapeHTML(word)}`
    };
    browser.tabs.create(tab_data);
};

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable,
    // e.g. a Symbol. Most often this is not the case though.
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
