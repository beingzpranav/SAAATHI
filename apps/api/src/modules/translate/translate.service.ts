import { createHash } from 'node:crypto';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { SUPPORTED_LANGUAGES } from './translate.schema.js';

interface CacheEntry {
  translation: string;
  expiresAt: number;
}

export class TranslateService {
  private static instance: TranslateService;
  private cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize = 10000;
  private readonly ttlMs = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Periodic cache eviction every 15 minutes
    setInterval(() => this.pruneExpired(), 15 * 60 * 1000).unref();
  }

  public static getInstance(): TranslateService {
    if (!TranslateService.instance) {
      TranslateService.instance = new TranslateService();
    }
    return TranslateService.instance;
  }

  private getCacheKey(text: string, src: string, tgt: string, context: string): string {
    const raw = `${text}|${src}|${tgt}|${context}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  public getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }

  /**
   * Translate a batch of texts from sourceLanguage to targetLanguage
   */
  public async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    context: 'app_ui' | 'message' | 'notification' | 'generated' = 'app_ui'
  ): Promise<string[]> {
    if (sourceLanguage === targetLanguage || texts.length === 0) {
      return [...texts];
    }

    const results: string[] = new Array(texts.length);
    const missingIndices: number[] = [];
    const missingTexts: string[] = [];

    // 1. Check cache first
    const now = Date.now();
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || !text.trim()) {
        results[i] = text ?? '';
        continue;
      }

      const key = this.getCacheKey(text, sourceLanguage, targetLanguage, context);
      const cached = this.cache.get(key);

      if (cached && cached.expiresAt > now) {
        results[i] = cached.translation;
      } else {
        missingIndices.push(i);
        missingTexts.push(text);
      }
    }

    // If all cached, return immediately
    if (missingTexts.length === 0) {
      return results;
    }

    // 2. Fetch missing from translation engine
    let translatedMissing: string[] = [];
    try {
      translatedMissing = await this.callTranslationBackend(
        missingTexts,
        sourceLanguage,
        targetLanguage,
        context
      );
    } catch (err) {
      logger.warn(
        { err, sourceLanguage, targetLanguage, missingCount: missingTexts.length },
        'Translation backend call failed, falling back to original texts'
      );
      // Fallback gracefully to original texts
      translatedMissing = missingTexts;
    }

    // 3. Put into cache and fill results array
    const expiresAt = now + this.ttlMs;
    for (let j = 0; j < missingTexts.length; j++) {
      const original = missingTexts[j] ?? '';
      const translated = translatedMissing[j] ?? original;
      const originalIndex = missingIndices[j] ?? 0;

      results[originalIndex] = translated;

      if (this.cache.size < this.maxCacheSize && original) {
        const key = this.getCacheKey(original, sourceLanguage, targetLanguage, context);
        this.cache.set(key, { translation: translated, expiresAt });
      }
    }

    return results;
  }

  /**
   * Calls translation provider (FastAPI service / LibreTranslate / Google Translate)
   */
  private async callTranslationBackend(
    texts: string[],
    source: string,
    target: string,
    context: string
  ): Promise<string[]> {
    // 1. Check if Google Cloud Translation API key is configured
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (googleApiKey) {
      return this.callGoogleTranslate(texts, source, target, googleApiKey);
    }

    // 2. Try FastAPI Translation Service / LibreTranslate
    const serviceUrl = env.TRANSLATION_SERVICE_URL || 'http://localhost:8000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (env.TRANSLATION_INTERNAL_SECRET) {
        headers['X-Internal-Secret'] = env.TRANSLATION_INTERNAL_SECRET;
      }

      const response = await fetch(`${serviceUrl}/translate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          texts,
          sourceLanguage: source,
          targetLanguage: target,
          context,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as { translations?: string[] };
        if (Array.isArray(data.translations) && data.translations.length === texts.length) {
          return data.translations;
        }
      }
    } catch {
      // Local microservice unavailable or timed out, try direct LibreTranslate if configured
    }

    // 3. Try direct LibreTranslate if running at LIBRETRANSLATE_URL
    const libreUrl = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';
    try {
      const translations = await Promise.all(
        texts.map(async (q) => {
          const res = await fetch(`${libreUrl}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q,
              source,
              target,
              format: 'text',
            }),
          });
          if (!res.ok) return q;
          const json = (await res.json()) as { translatedText?: string };
          return json.translatedText || q;
        })
      );
      return translations;
    } catch {
      // Continue to the free public fallback when LibreTranslate is unavailable.
    }

    // 4. Use MyMemory as a free fallback when no self-hosted provider is configured.
    // Keep this last so a configured/private provider always takes precedence.
    const myMemoryUrl =
      process.env.MYMEMORY_URL || 'https://api.mymemory.translated.net/get';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const translations = await Promise.all(
        texts.map(async (text) => {
          const query = new URLSearchParams({
            q: text,
            langpair: `${source}|${target}`,
          });
          const response = await fetch(`${myMemoryUrl}?${query.toString()}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            return text;
          }

          const data = (await response.json()) as {
            responseData?: { translatedText?: string };
          };
          return data.responseData?.translatedText || text;
        })
      );

      clearTimeout(timeoutId);
      return translations;
    } catch {
      // If all translation engines are unavailable, return original texts.
      return texts;
    }
  }

  private async callGoogleTranslate(
    texts: string[],
    source: string,
    target: string,
    apiKey: string
  ): Promise<string[]> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source,
        target,
        format: 'text',
      }),
    });

    if (!res.ok) {
      throw new Error(`Google Translate error: ${res.statusText}`);
    }

    const data = (await res.json()) as {
      data?: { translations?: Array<{ translatedText: string }> };
    };

    const list = data.data?.translations;
    if (Array.isArray(list) && list.length === texts.length) {
      return list.map((item) => item.translatedText);
    }

    return texts;
  }
}
