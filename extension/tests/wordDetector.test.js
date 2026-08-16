const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const detectorPath = path.join(__dirname, "..", "dist", "content", "wordDetector.js");
const detectorCode = fs.readFileSync(detectorPath, "utf8");

const sandbox = {
  console,
  document: {},
  Node: { TEXT_NODE: 3 },
  CaretPosition: function CaretPosition() {},
};

vm.createContext(sandbox);
vm.runInContext(detectorCode, sandbox);

const extractWordFromText = sandbox.extractWordFromText;

test("detects algorithm", () => {
  assert.equal(extractWordFromText("The algorithm improves performance.", 8), "algorithm");
});

test("detects performance", () => {
  assert.equal(extractWordFromText("The algorithm improves performance.", 25), "performance");
});

test("strips quotes", () => {
  assert.equal(extractWordFromText('The "algorithm" works.', 6), "algorithm");
});

test("strips trailing punctuation", () => {
  assert.equal(extractWordFromText("The algorithm, works.", 8), "algorithm");
});

test("returns null for whitespace", () => {
  assert.equal(extractWordFromText("The algorithm improves performance.", 3), null);
});

test("returns null for punctuation", () => {
  assert.equal(extractWordFromText("The algorithm, works.", 13), null);
});

test("handles nested inline text input", () => {
  assert.equal(extractWordFromText("The algorithm works.", 8), "algorithm");
});
