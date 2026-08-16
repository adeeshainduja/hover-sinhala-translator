declare function getWordAtPoint(doc: Document, x: number, y: number): string | null;
const hoverManager = new HoverManager({
  delay: 700,
  onWordHovered: (word) => {
    console.log("Word ready for lookup:", word);
  },
});

document.addEventListener("mousemove", (event: MouseEvent) => {
  const word = getWordAtPoint(document, event.clientX, event.clientY);
  hoverManager.handleWord(word);
});
