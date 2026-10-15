import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const savedLanguage =
  typeof window !== 'undefined' ? localStorage.getItem('saathi-language') || 'en' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Update the html lang attribute whenever the language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    localStorage.setItem('saathi-language', lng);
  }
});

// Initialize on first load
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLanguage;
}
