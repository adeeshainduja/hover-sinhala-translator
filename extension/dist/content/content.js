"use strict";
const hoverManager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => {
        popup.showLoading(word, { x: lastMouseX, y: lastMouseY });
    },
});
const popup = new TranslationPopup({
    getTranslation: translateWord,
});
let lastMouseX = 0;
let lastMouseY = 0;
let lastDetectedWord = null;
document.addEventListener("mousemove", (event) => {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    const word = getWordAtPoint(document, event.clientX, event.clientY);
    if (word !== lastDetectedWord) {
        popup.hide();
        lastDetectedWord = word;
    }
    hoverManager.handleWord(word);
});
