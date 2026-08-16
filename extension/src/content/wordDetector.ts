function getWordAtPoint(
  doc: Document,
  x: number,
  y: number,
): string | null {
  const range = getCollapsedRangeAtPoint(doc, x, y);

  if (!range) {
    return null;
  }

  const node = range.startContainer;
  const offset = range.startOffset;

  if (node.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  return extractWordFromText(node.textContent ?? "", offset);
}

function extractWordFromText(
  text: string,
  offset: number,
): string | null {
  if (!text || offset < 0 || offset > text.length) {
    return null;
  }

  let currentIndex = -1;

  if (offset < text.length && isWordChar(text[offset])) {
    currentIndex = offset;
  } else if (offset === text.length && offset > 0 && isWordChar(text[offset - 1])) {
    currentIndex = offset - 1;
  }

  if (currentIndex < 0) {
    return null;
  }

  if (!isWordChar(text[currentIndex])) {
    return null;
  }

  let start = currentIndex;
  while (start > 0 && isWordChar(text[start - 1])) {
    start--;
  }

  let end = currentIndex + 1;
  while (end < text.length && isWordChar(text[end])) {
    end++;
  }

  const word = text.slice(start, end).trim().replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");

  if (!isValidEnglishWord(word)) {
    return null;
  }

  return word.toLowerCase();
}

function getCollapsedRangeAtPoint(
  doc: Document,
  x: number,
  y: number,
): Range | null {
  const caretRangeFromPoint = (doc as Document & {
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  }).caretRangeFromPoint;

  if (caretRangeFromPoint) {
    return caretRangeFromPoint.call(doc, x, y);
  }

  const caretPositionFromPoint = (doc as Document & {
    caretPositionFromPoint?: (x: number, y: number) => CaretPosition | null;
  }).caretPositionFromPoint;

  if (!caretPositionFromPoint) {
    return null;
  }

  const position = caretPositionFromPoint.call(doc, x, y);

  if (!position) {
    return null;
  }

  const range = doc.createRange();
  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);
  return range;
}

function isWordChar(char: string): boolean {
  return /[A-Za-z]/.test(char);
}

function isValidEnglishWord(word: string): boolean {
  return /^[A-Za-z]+$/.test(word);
}
