import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-[12px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B] mb-6">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>
      <span className="text-sm font-bold tracking-widest text-[#C4562B] uppercase mb-2">
        Error 404
      </span>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">{t('notFound.title')}</h1>
      <p className="text-base text-[#6A5B55] dark:text-[#B8AAA3] max-w-md mb-8">
        {t('notFound.message')}
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          {t('notFound.backHome')}
        </Button>
      </Link>
    </div>
  );
};
