const jpnStorage = new JapaneseStorage(window.md5);
const storageLabel = document.querySelector("#storage-test");
const changeLabelBtn = document.querySelector("#change-storage-label");
const storagePrintBtn = document.querySelector("#print-storage");

changeLabelBtn.addEventListener("click", (event) => {
    let gettingItem = browser.storage.local.get('testObj');
    gettingItem.then((item) => storageLabel.innerHTML = item.testObj.reading, (error) => console.log(error));
});

storagePrintBtn.addEventListener("click", (event) => {
    jpnStorage.get(null).then(
        value => console.log(value)
    ).catch(
        error => console.log(error)
    );
});