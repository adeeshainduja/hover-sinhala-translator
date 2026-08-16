type HoverManagerOptions = {
  delay?: number;
  onWordHovered: (word: string) => void;
  timerApi?: {
    setTimeout: typeof window.setTimeout;
    clearTimeout: typeof window.clearTimeout;
  };
};

class HoverManager {
  private readonly delay: number;
  private readonly onWordHovered: (word: string) => void;
  private readonly setTimer: typeof window.setTimeout;
  private readonly clearTimer: typeof window.clearTimeout;
  private currentWord: string | null = null;
  private pendingTimer: number | null = null;

  constructor(options: HoverManagerOptions) {
    this.delay = options.delay ?? 700;
    this.onWordHovered = options.onWordHovered;
    this.setTimer = options.timerApi?.setTimeout ?? window.setTimeout.bind(window);
    this.clearTimer = options.timerApi?.clearTimeout ?? window.clearTimeout.bind(window);
  }

  handleWord(word: string | null): void {
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

  private reset(): void {
    this.cancelPendingTimer();
    this.currentWord = null;
  }

  private cancelPendingTimer(): void {
    if (this.pendingTimer !== null) {
      this.clearTimer(this.pendingTimer);
      this.pendingTimer = null;
    }
  }
}

(globalThis as typeof globalThis & {
  HoverManager: typeof HoverManager;
}).HoverManager = HoverManager;
