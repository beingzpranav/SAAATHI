/**
 * Dynamic Client-Side Translation Engine for SAATHI
 * Connects to /api/v1/translate with in-memory caching, localStorage persistence,
 * and automatic request batching.
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  native: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: Record<string, SupportedLanguage> = {
  en: { code: 'en', name: 'English', native: 'English', script: 'Latin' },
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
  gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

const CACHE_STORAGE_PREFIX = 'saathi_dyn_tr_v1_';
const MAX_PERSISTED_ENTRIES = 2000;

class TranslationClient {
  private static instance: TranslationClient;
  private memoryCache = new Map<string, string>();
  private pendingBatch: Array<{
    text: string;
    sourceLang: string;
    targetLang: string;
    context: string;
    resolve: (val: string) => void;
    reject: (err: unknown) => void;
  }> = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.hydrateFromStorage();
  }

  public static getInstance(): TranslationClient {
    if (!TranslationClient.instance) {
      TranslationClient.instance = new TranslationClient();
    }
    return TranslationClient.instance;
  }

  private makeKey(text: string, src: string, tgt: string, context: string = 'app_ui'): string {
    return `${src}:${tgt}:${context}:${text.trim()}`;
  }

  private hydrateFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      for (const lang of Object.keys(SUPPORTED_LANGUAGES)) {
        if (lang === 'en') continue;
        const raw = localStorage.getItem(`${CACHE_STORAGE_PREFIX}${lang}`);
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, string>;
          for (const [key, val] of Object.entries(parsed)) {
            this.memoryCache.set(key, val);
          }
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  private persistToStorage(targetLang: string): void {
    if (typeof window === 'undefined' || targetLang === 'en') return;
    try {
      const records: Record<string, string> = {};
      let count = 0;
      for (const [key, val] of this.memoryCache.entries()) {
        if (key.startsWith(`en:${targetLang}:`) && count < MAX_PERSISTED_ENTRIES) {
          records[key] = val;
          count++;
        }
      }
      localStorage.setItem(`${CACHE_STORAGE_PREFIX}${targetLang}`, JSON.stringify(records));
    } catch {
      // Quota exceeded or private mode
    }
  }

  /**
   * Translates a single text string using debounced batching
   */
  public async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
    context: 'app_ui' | 'message' | 'notification' | 'generated' = 'app_ui'
  ): Promise<string> {
    if (!text || !text.trim() || targetLang === sourceLang) {
      return text;
    }

    const key = this.makeKey(text, sourceLang, targetLang, context);
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    return new Promise<string>((resolve, reject) => {
      this.pendingBatch.push({
        text,
        sourceLang,
        targetLang,
        context,
        resolve,
        reject,
      });

      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flushBatch(), 40);
      }
    });
  }

  /**
   * Flushes currently queued translation requests in batches of up to 50
   */
  private async flushBatch(): Promise<void> {
    this.batchTimeout = null;
    const queue = [...this.pendingBatch];
    this.pendingBatch = [];

    if (queue.length === 0) return;

    // Group by sourceLang:targetLang:context
    const groups = new Map<string, typeof queue>();
    for (const item of queue) {
      const groupKey = `${item.sourceLang}|${item.targetLang}|${item.context}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    }

    for (const [groupKey, items] of groups.entries()) {
      const parts = groupKey.split('|');
      const sourceLang = parts[0] || 'en';
      const targetLang = parts[1] || 'en';
      const context = (parts[2] || 'app_ui') as 'app_ui' | 'message' | 'notification' | 'generated';
      const uniqueTexts = Array.from(new Set(items.map((i) => i.text)));

      try {
        const translations = await this.fetchRemoteBatch(
          uniqueTexts,
          sourceLang,
          targetLang,
          context
        );

        // Map responses
        const textToTranslation = new Map<string, string>();
        for (let i = 0; i < uniqueTexts.length; i++) {
          const orig = uniqueTexts[i] || '';
          const trans = translations[i] ?? orig;
          textToTranslation.set(orig, trans);

          if (orig) {
            const cacheKey = this.makeKey(orig, sourceLang, targetLang, context);
            this.memoryCache.set(cacheKey, trans);
          }
        }

        this.persistToStorage(targetLang);

        // Resolve each item
        for (const item of items) {
          item.resolve(textToTranslation.get(item.text) ?? item.text);
        }
      } catch (err) {
        // Fallback to original text on failure
        for (const item of items) {
          item.resolve(item.text);
        }
      }
    }
  }

  /**
   * Direct batch fetch from API
   */
  public async fetchRemoteBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    context: 'app_ui' | 'message' | 'notification' | 'generated' = 'app_ui'
  ): Promise<string[]> {
    if (texts.length === 0 || sourceLanguage === targetLanguage) {
      return [...texts];
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
    const endpoint = `${apiUrl}/translate`;

    // Break into chunks of 50
    const chunkSize = 50;
    const allTranslations: string[] = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: chunk,
            sourceLanguage,
            targetLanguage,
            context,
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          const list = json?.data?.translations;
          if (Array.isArray(list) && list.length === chunk.length) {
            allTranslations.push(...list);
            continue;
          }
        }
        allTranslations.push(...chunk);
      } catch {
        allTranslations.push(...chunk);
      }
    }

    return allTranslations;
  }
}

export const translationClient = TranslationClient.getInstance();
