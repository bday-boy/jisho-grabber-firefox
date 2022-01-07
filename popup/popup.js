(function() {
    const btnOpenDB = document.querySelector("div.button.action-open-db");
    btnOpenDB.addEventListener('click', (e) => {
        try {
            const tab_data = {
                url: '../index.html'
            };
            browser.tabs.create(tab_data);
        } catch(e) {
            console.log(e.error)
        }
    })
})();