import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../lib/translationClient.js';

export const LanguageSelector: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language || 'en';
  const currentLangObj = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.en!;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle language switch
  const handleSelectLanguage = (code: string) => {
    if (code !== currentLang) {
      i18n.changeLanguage(code);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        id="global-language-selector-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${t('common.languageSelect')}: currently ${currentLangObj.name} (${currentLangObj.native})`}
        className="inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-[44px] px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-[8px] border border-[#E8DDD2] bg-[#FFFDF9] dark:bg-[#1F1A17] text-[#3A2E2A] hover:bg-[#F3ECE4] dark:border-[#3D3430] dark:text-[#F5EFEB] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] transition-colors shadow-xs"
      >
        <Globe className="w-4 h-4 text-[#C4562B] dark:text-[#D86A3E]" aria-hidden="true" />
        <span className="font-semibold">{currentLangObj.native}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6A5B55] dark:text-[#B8AAA3] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          id="global-language-dropdown"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-[#241E1B] p-2 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 border border-[#E8DDD2] dark:border-[#3D3430] z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3] border-b border-[#F3ECE4] dark:border-[#332B27] mb-1">
            {t('common.languageSelect')}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-0.5 custom-scrollbar">
            {Object.values(SUPPORTED_LANGUAGES).map((lang: SupportedLanguage) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitem"
                  id={`lang-select-option-${lang.code}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left ${
                    isSelected
                      ? 'bg-[#FBECE6] text-[#C4562B] dark:bg-[#3B2217] dark:text-[#E87E54] font-bold'
                      : 'text-[#3A2E2A] dark:text-[#E8DDD2] hover:bg-[#F7F2EB] dark:hover:bg-[#2F2723]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-snug">{lang.native}</span>
                    <span className="text-[11px] text-[#7A6A64] dark:text-[#A89A93] font-normal">
                      {lang.name}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#C4562B] dark:text-[#E87E54]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
