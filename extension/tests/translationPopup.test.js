const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const popupPath = path.join(__dirname, "..", "dist", "content", "translationPopup.js");
const popupCode = fs.readFileSync(popupPath, "utf8");

const sandbox = {
  window: {
    innerWidth: 800,
    innerHeight: 600,
  },
  document: {
    createElement(tag) {
      return {
        tagName: tag,
        style: {},
        append() {},
        setAttribute() {},
        attachShadow() {
          return { appendChild() {} };
        },
      };
    },
    documentElement: {
      appendChild() {},
    },
  },
  requestAnimationFrame(fn) {
    fn();
  },
};

vm.createContext(sandbox);
vm.runInContext(popupCode, sandbox);

test("positions popup inside viewport", () => {
  const pos = sandbox.calculatePopupPosition(
    { x: 790, y: 590 },
    { width: 280, height: 160 },
    { width: 800, height: 600 },
  );

  assert.ok(pos.left >= 12);
  assert.ok(pos.top >= 12);
  assert.ok(pos.left + 280 <= 800);
  assert.ok(pos.top + 160 <= 600);
});

test("positions popup near anchor when space allows", () => {
  const pos = sandbox.calculatePopupPosition(
    { x: 100, y: 100 },
    { width: 280, height: 160 },
    { width: 800, height: 600 },
  );

  assert.equal(pos.left, 118);
  assert.equal(pos.top, 118);
});
