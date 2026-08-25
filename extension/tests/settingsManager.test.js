const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadManager(initial = {}) {
  let stored = { ...initial };
  const listeners = [];
  const sandbox = {
    console,
    chrome: { storage: { sync: { get: async (defaults) => ({ ...defaults, ...stored }), set: async (values) => { stored = { ...values }; } }, onChanged: { addListener: (listener) => listeners.push(listener) } } },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "dist", "settings", "settingsManager.js"), "utf8"), sandbox);
  return { manager: new sandbox.SettingsManager(), get stored() { return stored; }, listeners };
}

test("loads defaults when storage is empty", async () => {
  const { manager } = loadManager();
  assert.deepEqual(JSON.parse(JSON.stringify(await manager.load())), { enabled: true, hoverDelay: 700, targetLanguage: "si", popupPosition: "auto", showDefinition: true, showPartOfSpeech: true });
});

test("persists settings and validates invalid values", async () => {
  const state = loadManager();
  const { manager } = state;
  await manager.load();
  await manager.save({ hoverDelay: 1000, enabled: false, popupPosition: "random" });
  assert.equal(state.stored.hoverDelay, 1000);
  assert.equal(state.stored.enabled, false);
  assert.equal(state.stored.popupPosition, "auto");
});

test("resets settings to defaults", async () => {
  const { manager } = loadManager({ enabled: false, hoverDelay: 1500 });
  await manager.load();
  assert.equal((await manager.reset()).enabled, true);
  assert.equal(manager.get().hoverDelay, 700);
});
