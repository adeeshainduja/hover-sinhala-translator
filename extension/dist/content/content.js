"use strict";
let lastLoggedWord = null;
document.addEventListener("mousemove", (event) => {
    const word = getWordAtPoint(document, event.clientX, event.clientY);
    if (!word || word === lastLoggedWord) {
        return;
    }
    lastLoggedWord = word;
    console.log("Detected word:", word);
});
