"use strict";
class HoverManager {
    delay;
    onWordHovered;
    setTimer;
    clearTimer;
    currentWord = null;
    pendingTimer = null;
    constructor(options) {
        this.delay = options.delay ?? 700;
        this.onWordHovered = options.onWordHovered;
        this.setTimer = options.timerApi?.setTimeout ?? window.setTimeout.bind(window);
        this.clearTimer = options.timerApi?.clearTimeout ?? window.clearTimeout.bind(window);
    }
    setDelay(delay) { this.delay = delay; }
    handleWord(word) {
        if (!word) {
            this.reset();
            return;
        }
        if (word === this.currentWord) {
            return;
        }
        this.cancelPendingTimer();
        this.currentWord = word;
        this.pendingTimer = this.setTimer(() => {
            if (this.currentWord === word) {
                this.pendingTimer = null;
                this.onWordHovered(word);
            }
        }, this.delay);
    }
    reset() {
        this.cancelPendingTimer();
        this.currentWord = null;
    }
    cancelPendingTimer() {
        if (this.pendingTimer !== null) {
            this.clearTimer(this.pendingTimer);
            this.pendingTimer = null;
        }
    }
}
globalThis.HoverManager = HoverManager;
