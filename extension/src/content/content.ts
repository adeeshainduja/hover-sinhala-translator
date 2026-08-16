declare function getWordAtPoint(doc: Document, x: number, y: number): string | null;
declare function translateWord(word: string): Promise<{
  word: string;
  translation: string;
  partOfSpeech: string;
  definition: string;
} | null>;

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
let lastDetectedWord: string | null = null;

document.addEventListener("mousemove", (event: MouseEvent) => {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  const word = getWordAtPoint(document, event.clientX, event.clientY);

  if (word !== lastDetectedWord) {
    popup.hide();
    lastDetectedWord = word;
  }

  hoverManager.handleWord(word);
});
