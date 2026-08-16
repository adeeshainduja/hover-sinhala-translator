const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const hoverManagerPath = path.join(__dirname, "..", "dist", "content", "hoverManager.js");
const hoverManagerCode = fs.readFileSync(hoverManagerPath, "utf8");

function loadHoverManager() {
  const sandbox = {
    window: {
      setTimeout: (fn, delay) => setTimeout(fn, delay),
      clearTimeout: (id) => clearTimeout(id),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(hoverManagerCode, sandbox);
  return sandbox.HoverManager;
}

function createFakeTimerApi() {
  let now = 0;
  let nextId = 1;
  const timers = new Map();

  return {
    api: {
      setTimeout(fn, delay) {
        const id = nextId++;
        timers.set(id, { fn, time: now + delay });
        return id;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
    },
    tick(ms) {
      now += ms;
      const due = [...timers.entries()]
        .filter(([, timer]) => timer.time <= now)
        .sort((a, b) => a[1].time - b[1].time);

      for (const [id, timer] of due) {
        timers.delete(id);
        timer.fn();
      }
    },
  };
}

const HoverManager = loadHoverManager();

test("triggers after delay", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(699);
  assert.deepEqual(calls, []);
  clock.tick(1);
  assert.deepEqual(calls, ["algorithm"]);
});

test("does not trigger before delay", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(699);
  assert.deepEqual(calls, []);
});

test("cancels when word changes", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(300);
  manager.handleWord("improves");
  clock.tick(400);
  assert.deepEqual(calls, []);
  clock.tick(300);
  assert.deepEqual(calls, ["improves"]);
});

test("same word does not restart timer", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(200);
  manager.handleWord("algorithm");
  clock.tick(200);
  manager.handleWord("algorithm");
  clock.tick(300);
  assert.deepEqual(calls, ["algorithm"]);
});

test("null cancels timer", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(300);
  manager.handleWord(null);
  clock.tick(500);
  assert.deepEqual(calls, []);
});

test("re-enter starts a new timer", () => {
  const clock = createFakeTimerApi();
  const calls = [];
  const manager = new HoverManager({
    delay: 700,
    onWordHovered: (word) => calls.push(word),
    timerApi: clock.api,
  });

  manager.handleWord("algorithm");
  clock.tick(700);
  manager.handleWord(null);
  manager.handleWord("algorithm");
  clock.tick(700);
  assert.deepEqual(calls, ["algorithm", "algorithm"]);
});
