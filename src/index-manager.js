const storageLabel = document.querySelector("#storage-test");
const storageBtn = document.querySelector("button.button");

storageBtn.addEventListener("click", (event) => {
    let gettingItem = browser.storage.local.get('testObj');
    gettingItem.then((item) => storageLabel.innerHTML = item.testObj.reading, (error) => console.log(error));
})