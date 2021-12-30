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

function search_jisho(word) {
    if (word.length > 40) {
        throw new Error(`Word "${word}" is too long to search.`)
    }
    else {
        let tab_data = {
            url: `https://jisho.org/search/${encodeURIComponent(word)}`
        };
        browser.tabs.create(tab_data);
    }
};
