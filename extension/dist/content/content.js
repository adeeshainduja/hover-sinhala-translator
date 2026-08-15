"use strict";
let lastWord = "";
let hoverTimer = null;
document.addEventListener("mousemove", (event) => {
    const word = getWordUnderCursor(event.clientX, event.clientY);
    if (!word) {
        lastWord = "";
        if (hoverTimer !== null) {
            window.clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        return;
    }
    // Same word - do nothing
    if (word === lastWord) {
        return;
    }
    // New word
    lastWord = word;
    // Cancel previous timer
    if (hoverTimer !== null) {
        window.clearTimeout(hoverTimer);
    }
    // Wait 700ms
    hoverTimer = window.setTimeout(() => {
        console.log("Detected word:", word);
    }, 700);
});
function getWordUnderCursor(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) {
        return null;
    }
    const text = element.textContent?.trim();
    if (!text) {
        return null;
    }
    // For our first test, return the first word
    // from the element's text.
    const words = text.split(/\s+/);
    if (words.length === 0) {
        return null;
    }
    return cleanWord(words[0]);
}
function cleanWord(word) {
    const cleaned = word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");
    if (cleaned.length < 2) {
        return null;
    }
    return cleaned.toLowerCase();
}
