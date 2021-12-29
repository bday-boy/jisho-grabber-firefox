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
    tabs.create(tab_data);
};

/* code for getting to search element */
elem = document.getElementById("main_results");
elem.onclick = function(event) {
  let temp = event.target;
  let word_class = "concept_light clearfix";
  while (temp !== null && temp.getAttribute("class") !== word_class) {
    temp = temp.parentElement;
  }
  console.log(temp);
}
/* code for getting to search element*/

// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
    // Most often this is not the case though.
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
