declare function getWordAtPoint(doc: Document, x: number, y: number): string | null;
declare function translateWord(word: string, targetLanguage?: string): Promise<{ word: string; translation: string; source_language: string; target_language: string } | null>;
const settingsManager = new SettingsManager();
let lastMouseX = 0; let lastMouseY = 0; let lastDetectedWord: string | null = null;
const popup = new TranslationPopup({ getTranslation: (word) => translateWord(word, settingsManager.get().targetLanguage), getSettings: () => settingsManager.get() });
const hoverManager = new HoverManager({ delay: 700, onWordHovered: (word) => { if (settingsManager.get().enabled) popup.showLoading(word, { x: lastMouseX, y: lastMouseY }); } });
function handleMouseMove(event: MouseEvent): void {
  if (!settingsManager.get().enabled) return;
  lastMouseX = event.clientX; lastMouseY = event.clientY;
  const word = getWordAtPoint(document, event.clientX, event.clientY);
  if (word !== lastDetectedWord) { popup.hide(); lastDetectedWord = word; }
  hoverManager.handleWord(word);
}
void settingsManager.load().then((settings) => {
  hoverManager.setDelay(settings.hoverDelay);
  settingsManager.subscribe((next) => { hoverManager.setDelay(next.hoverDelay); if (!next.enabled) { hoverManager.handleWord(null); popup.hide(); lastDetectedWord = null; } });
  document.addEventListener("mousemove", handleMouseMove);
});
