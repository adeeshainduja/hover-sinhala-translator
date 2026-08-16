const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const servicePath = path.join(__dirname, "..", "dist", "services", "translationService.js");
const serviceCode = fs.readFileSync(servicePath, "utf8");

function loadService(fetchImpl, timerApi = {}) {
  const sandbox = {
    window: {
      setTimeout: timerApi.setTimeout ?? setTimeout,
      clearTimeout: timerApi.clearTimeout ?? clearTimeout,
    },
    fetch: fetchImpl,
    AbortController,
    DOMException,
  };

  vm.createContext(sandbox);
  vm.runInContext(serviceCode, sandbox);
  return sandbox.translateWord;
}

test("returns backend translation for algorithm", async () => {
  const translateWord = loadService(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      word: "algorithm",
      translation: "ඇල්ගොරිතම",
      source_language: "en",
      target_language: "si",
    }),
  }));

  const result = await translateWord("algorithm");
  assert.equal(result && result.word, "algorithm");
  assert.equal(result && result.translation, "ඇල්ගොරිතම");
  assert.equal(result && result.source_language, "en");
  assert.equal(result && result.target_language, "si");
});

test("returns null for unknown words", async () => {
  const translateWord = loadService(async () => ({
    ok: false,
    status: 404,
    json: async () => ({ detail: "Meaning not available." }),
  }));

  const result = await translateWord("unknownword");
  assert.equal(result, null);
});

test("throws controlled error on http failure", async () => {
  const translateWord = loadService(async () => ({
    ok: false,
    status: 500,
    json: async () => ({ detail: "Server error" }),
  }));

  await assert.rejects(() => translateWord("algorithm"), (error) => error.kind === "http");
});

test("throws controlled error on invalid json", async () => {
  const translateWord = loadService(async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new Error("bad json");
    },
  }));

  await assert.rejects(() => translateWord("algorithm"), (error) => error.kind === "invalid-json");
});

test("throws controlled error on network failure", async () => {
  const translateWord = loadService(async () => {
    throw new Error("network down");
  });

  await assert.rejects(() => translateWord("algorithm"), (error) => error.kind === "network");
});

test("throws controlled error on timeout", async () => {
  let timerCallback;
  const translateWord = loadService(
    (_url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        if (timerCallback) {
          timerCallback();
        }
      }),
    {
      setTimeout(fn) {
        timerCallback = fn;
        return 1;
      },
      clearTimeout() {},
    },
  );

  await assert.rejects(() => translateWord("algorithm"), (error) => error.kind === "timeout");
});
