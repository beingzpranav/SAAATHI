import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import { SUPPORTED_LANGUAGES } from './translationClient.js';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  mr: { translation: mr },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
};

const savedLanguage =
  (typeof window !== 'undefined' ? localStorage.getItem('saathi-language') : null) || 'en';

const initialLang = savedLanguage in SUPPORTED_LANGUAGES ? savedLanguage : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Update the html lang attribute whenever language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    localStorage.setItem('saathi-language', lng);
  }
});

// Initialize on first load
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export default i18n;
