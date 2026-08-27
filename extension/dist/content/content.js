"use strict";
const settingsManager = new SettingsManager();
let lastMouseX = 0;
let lastMouseY = 0;
let lastDetectedWord = null;
const popup = new TranslationPopup({ getTranslation: (word) => translateWord(word, settingsManager.get().targetLanguage), getSettings: () => settingsManager.get() });
const hoverManager = new HoverManager({ delay: 700, onWordHovered: (word) => { if (settingsManager.get().enabled)
        popup.showLoading(word, { x: lastMouseX, y: lastMouseY }); } });
function handleMouseMove(event) {
    if (!settingsManager.get().enabled)
        return;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    const word = getWordAtPoint(document, event.clientX, event.clientY);
    if (word !== lastDetectedWord) {
        if (lastDetectedWord)
            cancelTranslation(lastDetectedWord, settingsManager.get().targetLanguage);
        popup.hide();
        lastDetectedWord = word;
    }
    hoverManager.handleWord(word);
}
void settingsManager.load().then((settings) => {
    hoverManager.setDelay(settings.hoverDelay);
    settingsManager.subscribe((next) => { hoverManager.setDelay(next.hoverDelay); if (!next.enabled) {
        if (lastDetectedWord)
            cancelTranslation(lastDetectedWord, next.targetLanguage);
        hoverManager.handleWord(null);
        popup.hide();
        lastDetectedWord = null;
    } });
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", () => popup.hide(), { passive: true });
    window.addEventListener("resize", () => popup.hide(), { passive: true });
});
