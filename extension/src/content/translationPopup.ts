type TranslationData = {
  word: string;
  translation: string;
  partOfSpeech?: string;
  definition?: string;
};

type PopupState = "hidden" | "loading" | "success" | "error";

type PopupCoordinates = {
  left: number;
  top: number;
};

type PopupOptions = {
  getTranslation: (word: string) => Promise<TranslationData | null>;
  viewport?: Pick<Window, "innerWidth" | "innerHeight">;
  documentRef?: Document;
  getSettings?: () => { popupPosition: "auto" | "above" | "below"; showDefinition: boolean; showPartOfSpeech: boolean };
};

function calculatePopupPosition(
  anchor: { x: number; y: number },
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
  preferred: "auto" | "above" | "below" = "auto",
): PopupCoordinates {
  const margin = 12;
  const offset = 18;

  let left = anchor.x + offset;
  let top = anchor.y + offset;

  if (preferred === "above") top = anchor.y - popupSize.height - offset;
  if (preferred === "below") top = anchor.y + offset;

  if (left + popupSize.width + margin > viewport.width) {
    left = Math.max(margin, anchor.x - popupSize.width - offset);
  }

  if (top + popupSize.height + margin > viewport.height) {
    top = Math.max(margin, anchor.y - popupSize.height - offset);
  }

  left = Math.min(Math.max(margin, left), Math.max(margin, viewport.width - popupSize.width - margin));
  top = Math.min(Math.max(margin, top), Math.max(margin, viewport.height - popupSize.height - margin));

  return { left, top };
}

class TranslationPopup {
  private readonly getTranslation: (word: string) => Promise<TranslationData | null>;
  private readonly viewport: Pick<Window, "innerWidth" | "innerHeight">;
  private readonly host: HTMLDivElement;
  private readonly shadowRoot: ShadowRoot;
  private readonly panel: HTMLDivElement;
  private readonly wordEl: HTMLDivElement;
  private readonly translationEl: HTMLDivElement;
  private readonly partOfSpeechEl: HTMLDivElement;
  private readonly definitionEl: HTMLDivElement;
  private readonly statusEl: HTMLDivElement;
  private state: PopupState = "hidden";
  private activeWord: string | null = null;
  private requestToken = 0;
  private readonly getSettings: NonNullable<PopupOptions["getSettings"]>;

  constructor(options: PopupOptions) {
    this.getTranslation = options.getTranslation;
    this.getSettings = options.getSettings ?? (() => ({ popupPosition: "auto", showDefinition: true, showPartOfSpeech: true }));
    this.viewport = options.viewport ?? window;
    const doc = options.documentRef ?? document;
    this.host = doc.createElement("div");
    this.host.id = "hover-sinhala-translator-popup-host";
    this.host.style.position = "fixed";
    this.host.style.inset = "0";
    this.host.style.zIndex = "2147483647";
    this.host.style.pointerEvents = "none";

    this.shadowRoot = this.host.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.createStyles(doc));

    this.panel = doc.createElement("div");
    this.panel.setAttribute("role", "status");
    this.panel.style.position = "fixed";
    this.panel.style.minWidth = "240px";
    this.panel.style.maxWidth = "320px";
    this.panel.style.padding = "14px 16px";
    this.panel.style.borderRadius = "14px";
    this.panel.style.background = "#111827";
    this.panel.style.color = "#F9FAFB";
    this.panel.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.24)";
    this.panel.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    this.panel.style.fontFamily = "Arial, sans-serif";
    this.panel.style.lineHeight = "1.4";
    this.panel.style.pointerEvents = "none";
    this.panel.style.opacity = "0";
    this.panel.style.transform = "translateY(4px)";
    this.panel.style.transition = "opacity 120ms ease, transform 120ms ease";
    this.panel.style.display = "none";

    this.wordEl = this.makeLine(doc, "18px", "700");
    this.translationEl = this.makeLine(doc, "15px", "600");
    this.partOfSpeechEl = this.makeLine(doc, "13px", "600", "#93C5FD");
    this.definitionEl = this.makeLine(doc, "14px", "400", "#D1D5DB");
    this.statusEl = this.makeLine(doc, "14px", "400", "#D1D5DB");

    this.panel.append(this.wordEl, this.translationEl, this.partOfSpeechEl, this.definitionEl, this.statusEl);
    this.shadowRoot.appendChild(this.panel);
    doc.documentElement.appendChild(this.host);
  }

  async showLoading(word: string, anchor: { x: number; y: number }): Promise<void> {
    this.activeWord = word;
    this.requestToken += 1;
    const token = this.requestToken;

    this.setState("loading");
    this.renderWord(word);
    this.translationEl.textContent = "";
    this.partOfSpeechEl.textContent = "";
    this.definitionEl.textContent = "";
    this.statusEl.textContent = "Translating...";
    this.showAt(anchor);

    try {
      const result = await this.getTranslation(word);
      if (token !== this.requestToken || this.activeWord !== word) {
        return;
      }

      if (!result) {
        this.showError(word, "Meaning not available.");
        return;
      }

      this.renderSuccess(result);
    } catch (error) {
      if (token !== this.requestToken || this.activeWord !== word) {
        return;
      }

      const message = this.resolveErrorMessage(error);
      this.showError(word, message);
    }
  }

  hide(): void {
    this.activeWord = null;
    this.requestToken += 1;
    this.setState("hidden");
    this.panel.style.display = "none";
    this.panel.style.opacity = "0";
  }

  private showError(word: string, message: string): void {
    this.setState("error");
    this.renderWord(word);
    this.translationEl.textContent = "";
    this.partOfSpeechEl.textContent = "";
    this.definitionEl.textContent = "";
    this.statusEl.textContent = message;
    this.panel.style.display = "block";
    this.panel.style.opacity = "1";
    this.panel.style.transform = "translateY(0)";
  }

  private renderSuccess(result: TranslationData): void {
    this.setState("success");
    this.translationEl.textContent = result.translation;
    const settings = this.getSettings();
    this.partOfSpeechEl.textContent = settings.showPartOfSpeech ? result.partOfSpeech ?? "" : "";
    this.definitionEl.textContent = settings.showDefinition ? result.definition ?? "" : "";
    this.statusEl.textContent = "";
    this.panel.style.display = "block";
    this.panel.style.opacity = "1";
    this.panel.style.transform = "translateY(0)";
  }

  private renderWord(word: string): void {
    this.wordEl.textContent = word;
  }

  private showAt(anchor: { x: number; y: number }): void {
    const position = calculatePopupPosition(
      anchor,
      { width: 280, height: this.panel.offsetHeight || 160 },
      { width: this.viewport.innerWidth, height: this.viewport.innerHeight },
      this.getSettings().popupPosition,
    );

    this.panel.style.left = `${position.left}px`;
    this.panel.style.top = `${position.top}px`;
    this.panel.style.display = "block";
    this.panel.style.opacity = "0";
    this.panel.style.transform = "translateY(4px)";
    requestAnimationFrame(() => {
      this.panel.style.opacity = "1";
      this.panel.style.transform = "translateY(0)";
    });
  }

  private setState(state: PopupState): void {
    this.state = state;
  }

  private makeLine(doc: Document, fontSize: string, fontWeight: string, color = "#F9FAFB"): HTMLDivElement {
    const el = doc.createElement("div");
    el.style.marginTop = "6px";
    el.style.fontSize = fontSize;
    el.style.fontWeight = fontWeight;
    el.style.color = color;
    return el;
  }

  private createStyles(doc: Document): HTMLStyleElement {
    const style = doc.createElement("style");
    style.textContent = `
      :host {
        all: initial;
      }
    `;
    return style;
  }

  private resolveErrorMessage(error: unknown): string {
    if (typeof error === "object" && error !== null && "kind" in error) {
      const kind = (error as { kind?: string }).kind;
      if (kind === "timeout") {
        return "Translation unavailable.";
      }
      if (kind === "network") {
        return "Unable to get meaning. Please try again.";
      }
      if (kind === "http" || kind === "invalid-json") {
        return "Unable to get meaning.";
      }
    }

    return "Unable to get meaning.";
  }
}

(globalThis as typeof globalThis & {
  TranslationPopup: typeof TranslationPopup;
  calculatePopupPosition: typeof calculatePopupPosition;
}).TranslationPopup = TranslationPopup;

(globalThis as typeof globalThis & {
  calculatePopupPosition: typeof calculatePopupPosition;
}).calculatePopupPosition = calculatePopupPosition;
