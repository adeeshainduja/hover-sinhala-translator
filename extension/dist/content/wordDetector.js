"use strict";
function getWordAtPoint(doc, x, y) {
    const range = getCollapsedRangeAtPoint(doc, x, y);
    if (!range) {
        return null;
    }
    const node = range.startContainer;
    const offset = range.startOffset;
    if (node.nodeType !== Node.TEXT_NODE) {
        return null;
    }
    if (isIgnoredContext(node.parentElement))
        return null;
    return extractWordFromText(node.textContent ?? "", offset);
}
function extractWordFromText(text, offset) {
    if (!text || offset < 0 || offset > text.length) {
        return null;
    }
    let currentIndex = -1;
    if (offset < text.length && isWordChar(text[offset])) {
        currentIndex = offset;
    }
    else if (offset === text.length && offset > 0 && isWordChar(text[offset - 1])) {
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
    return word;
}
function getCollapsedRangeAtPoint(doc, x, y) {
    const caretRangeFromPoint = doc.caretRangeFromPoint;
    if (caretRangeFromPoint) {
        return caretRangeFromPoint.call(doc, x, y);
    }
    const caretPositionFromPoint = doc.caretPositionFromPoint;
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
function isWordChar(char) {
    return /[A-Za-z0-9_'-]/.test(char);
}
function isValidEnglishWord(word) {
    return word.length >= 2 && /[A-Za-z]/.test(word) && /^[A-Za-z0-9_'-]+$/.test(word);
}
function isIgnoredContext(element) {
    let current = element;
    while (current) {
        const tag = current.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "code" || tag === "pre" || tag === "script" || tag === "style" || tag === "noscript")
            return true;
        if (current instanceof HTMLElement && current.isContentEditable)
            return true;
        current = current.parentElement;
    }
    return false;
}
