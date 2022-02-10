/*
 * Author:      Andrew Smith
 * File:        search-selection.js
 * Project:     jisho-grabber-firefox
 * Description: This file contains functionality to add a search function to
 *              the right-click context menu in Firefox.
 */

const searchJisho = function (word) {
  if (word.length > 40) {
    throw new Error(`Word '${word}' is too long to search.`);
  } else {
    const tabData = {
      url: `https://jisho.org/search/${encodeURIComponent(word)}`,
    };
    browser.tabs.create(tabData);
  }
};

browser.contextMenus.create({
  id: 'select-search',
  title: 'Search %s on Jisho',
  contexts: ['selection'],
});

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'select-search') {
    const searchText = info.selectionText;
    searchJisho(searchText);
  }
});
