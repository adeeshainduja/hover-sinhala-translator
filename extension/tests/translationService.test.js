const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const servicePath = path.join(__dirname, "..", "dist", "services", "translationService.js");
const serviceCode = fs.readFileSync(servicePath, "utf8");

const sandbox = {
  window: {
    setTimeout,
    clearTimeout,
  },
};

vm.createContext(sandbox);
vm.runInContext(serviceCode, sandbox);

test("returns mock translation for algorithm", async () => {
  const result = await sandbox.translateWord("algorithm");
  assert.equal(result && result.word, "algorithm");
  assert.equal(result && result.translation, "ඇල්ගොරිතම");
  assert.equal(result && result.partOfSpeech, "Noun");
  assert.equal(result && result.definition, "A set of steps used to solve a problem.");
});

test("returns null for unknown words", async () => {
  const result = await sandbox.translateWord("unknownword");
  assert.equal(result, null);
});
