declare function getWordAtPoint(doc: Document, x: number, y: number): string | null;

let lastLoggedWord: string | null = null;

document.addEventListener("mousemove", (event: MouseEvent) => {
  const word = getWordAtPoint(document, event.clientX, event.clientY);

  if (!word || word === lastLoggedWord) {
    return;
  }

  lastLoggedWord = word;
  console.log("Detected word:", word);
});
