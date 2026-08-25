type SettingsPopupPosition = "auto" | "above" | "below";
declare const chrome: {
  storage?: {
    sync?: { get(defaults: object): Promise<object>; set(values: object): Promise<void> };
    onChanged?: { addListener(listener: (changes: Record<string, { newValue?: unknown }>) => void): void };
  };
};
type ExtensionSettings = {
  enabled: boolean;
  hoverDelay: number;
  targetLanguage: "si";
  popupPosition: SettingsPopupPosition;
  showDefinition: boolean;
  showPartOfSpeech: boolean;
};
const DEFAULT_SETTINGS: ExtensionSettings = { enabled: true, hoverDelay: 700, targetLanguage: "si", popupPosition: "auto", showDefinition: true, showPartOfSpeech: true };
function validateSettings(value: Partial<ExtensionSettings>): ExtensionSettings {
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
    hoverDelay: typeof value.hoverDelay === "number" && Number.isInteger(value.hoverDelay) && value.hoverDelay >= 300 && value.hoverDelay <= 2000 ? value.hoverDelay : DEFAULT_SETTINGS.hoverDelay,
    targetLanguage: value.targetLanguage === "si" ? "si" : DEFAULT_SETTINGS.targetLanguage,
    popupPosition: value.popupPosition === "above" || value.popupPosition === "below" || value.popupPosition === "auto" ? value.popupPosition : DEFAULT_SETTINGS.popupPosition,
    showDefinition: typeof value.showDefinition === "boolean" ? value.showDefinition : DEFAULT_SETTINGS.showDefinition,
    showPartOfSpeech: typeof value.showPartOfSpeech === "boolean" ? value.showPartOfSpeech : DEFAULT_SETTINGS.showPartOfSpeech,
  };
}
class SettingsManager {
  private settings = { ...DEFAULT_SETTINGS };
  private listeners = new Set<(settings: ExtensionSettings) => void>();
  private listening = false;
  async load(): Promise<ExtensionSettings> {
    if (typeof chrome === "undefined" || !chrome.storage?.sync) return this.get();
    try { this.settings = validateSettings(await chrome.storage.sync.get(DEFAULT_SETTINGS) as Partial<ExtensionSettings>); }
    catch { this.settings = { ...DEFAULT_SETTINGS }; }
    this.startListening();
    return this.get();
  }
  get(): ExtensionSettings { return { ...this.settings }; }
  async save(values: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
    this.settings = validateSettings({ ...this.settings, ...values });
    if (typeof chrome !== "undefined" && chrome.storage?.sync) await chrome.storage.sync.set(this.settings);
    return this.get();
  }
  async update(key: keyof ExtensionSettings, value: ExtensionSettings[keyof ExtensionSettings]): Promise<ExtensionSettings> { return this.save({ [key]: value }); }
  async reset(): Promise<ExtensionSettings> { return this.save(DEFAULT_SETTINGS); }
  subscribe(listener: (settings: ExtensionSettings) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private startListening(): void {
    if (this.listening || typeof chrome === "undefined" || !chrome.storage?.onChanged) return;
    this.listening = true;
    chrome.storage.onChanged.addListener((changes) => {
      const next = { ...this.settings };
      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof ExtensionSettings)[]) if (changes[key]?.newValue !== undefined) (next[key] as unknown) = changes[key].newValue;
      this.settings = validateSettings(next);
      for (const listener of this.listeners) listener(this.get());
    });
  }
}
(globalThis as typeof globalThis & { SettingsManager: typeof SettingsManager; DEFAULT_SETTINGS: ExtensionSettings }).SettingsManager = SettingsManager;
(globalThis as typeof globalThis & { DEFAULT_SETTINGS: ExtensionSettings }).DEFAULT_SETTINGS = DEFAULT_SETTINGS;
