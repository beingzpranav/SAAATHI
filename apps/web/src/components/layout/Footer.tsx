import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-[#E8DDD2] bg-[#F9F4EE] dark:bg-[#171311] dark:border-[#3D3430] py-8 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#C4562B] dark:text-[#D86A3E]" aria-hidden="true" />
          <span className="font-heading font-bold text-base text-[#3A2E2A] dark:text-[#F5EFEB]">
            {t('common.appName')}
          </span>
          <span className="text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
            — {t('common.tagline')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
          <ShieldCheck className="w-4 h-4 text-[#2F7D5C] dark:text-[#419B74]" aria-hidden="true" />
          <span>{t('footer.hackathon')}</span>
        </div>
      </div>
    </footer>
  );
};
