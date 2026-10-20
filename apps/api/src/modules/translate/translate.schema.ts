import { z } from 'zod';

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English',   native: 'English',    script: 'Latin'       },
  hi: { name: 'Hindi',     native: 'हिन्दी',      script: 'Devanagari'  },
  bn: { name: 'Bengali',   native: 'বাংলা',       script: 'Bengali'     },
  ta: { name: 'Tamil',     native: 'தமிழ்',       script: 'Tamil'       },
  te: { name: 'Telugu',    native: 'తెలుగు',      script: 'Telugu'      },
  mr: { name: 'Marathi',   native: 'मराठी',       script: 'Devanagari'  },
  gu: { name: 'Gujarati',  native: 'ગુજરાતી',     script: 'Gujarati'    },
  kn: { name: 'Kannada',   native: 'ಕನ್ನಡ',       script: 'Kannada'     },
  ml: { name: 'Malayalam', native: 'മലയാളം',      script: 'Malayalam'   },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const translateRequestSchema = z.object({
  texts: z
    .array(z.string().max(2000))
    .min(1)
    .max(50),
  sourceLanguage: z.string().regex(/^[a-z]{2,3}$/),
  targetLanguage: z.string().regex(/^[a-z]{2,3}$/),
  context: z.enum(['app_ui', 'message', 'notification', 'generated']).default('app_ui'),
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;
