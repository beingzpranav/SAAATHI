import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Users, ShieldCheck, FileText, Volume2 } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { useUiStore } from '../stores/ui.store.js';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `${t('landing.heroTitle')} ${t('landing.heroSubtitle')}`,
      );
      window.speechSynthesis.speak(utterance);
      showToast(t('common.readAloud'), 'info');
    } else {
      showToast('Speech synthesis is not supported on this browser', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-12 py-4">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="demo">DEMO</Badge>
            <button
              type="button"
              onClick={handleReadAloud}
              aria-label={t('common.readAloud')}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[6px] border border-[#E8DDD2] text-[#6A5B55] hover:bg-[#F3ECE4] dark:border-[#3D3430] dark:text-[#B8AAA3] dark:hover:bg-[#2A2320] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] min-h-[36px]"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#C4562B]" aria-hidden="true" />
              <span>{t('common.readAloud')}</span>
            </button>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#3A2E2A] dark:text-[#F5EFEB] leading-[1.15]">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-lg sm:text-xl text-[#5C4E49] dark:text-[#B8AAA3] leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => (window.location.href = '/intake')}
            >
              {t('common.primaryCta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const featuresSection = document.getElementById('three-window-model');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('common.learnMore')}
            </Button>
          </div>
        </div>

        {/* 3-Window Architectural Illustration (Clean SVG, Hearth Palette) */}
        <div className="flex-1 w-full max-w-lg">
          <div className="rounded-[12px] border border-[#E8DDD2] dark:border-[#3D3430] bg-white dark:bg-[#1F1A17] p-6 shadow-md">
            <div className="text-xs font-bold tracking-wider uppercase text-[#6A5B55] dark:text-[#B8AAA3] mb-4 text-center">
              The Three-Window Family Model
            </div>
            <svg
              viewBox="0 0 400 260"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Diagram showing private Student Window and Parent Window feeding into the Joint Family Room"
            >
              {/* Student Window Box */}
              <rect
                x="20"
                y="20"
                width="160"
                height="90"
                rx="8"
                fill="#FDF4E5"
                stroke="#EFA531"
                strokeWidth="2"
              />
              <text
                x="100"
                y="55"
                textAnchor="middle"
                fill="#915B06"
                fontWeight="bold"
                fontSize="14"
              >
                Student Window
              </text>
              <text x="100" y="75" textAnchor="middle" fill="#6A5B55" fontSize="11">
                Private PIN &amp; Hopes
              </text>

              {/* Parent Window Box */}
              <rect
                x="220"
                y="20"
                width="160"
                height="90"
                rx="8"
                fill="#EBF4F0"
                stroke="#2F7D5C"
                strokeWidth="2"
              />
              <text
                x="300"
                y="55"
                textAnchor="middle"
                fill="#1E573F"
                fontWeight="bold"
                fontSize="14"
              >
                Parent Window
              </text>
              <text x="300" y="75" textAnchor="middle" fill="#6A5B55" fontSize="11">
                Private PIN &amp; Concerns
              </text>

              {/* Connector Arrows */}
              <path
                d="M 100 110 L 100 145 L 180 145 L 180 160"
                stroke="#C4562B"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M 300 110 L 300 145 L 220 145 L 220 160"
                stroke="#C4562B"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Joint Room Box */}
              <rect
                x="60"
                y="160"
                width="280"
                height="80"
                rx="8"
                fill="#F8EDE7"
                stroke="#C4562B"
                strokeWidth="2"
              />
              <text
                x="200"
                y="195"
                textAnchor="middle"
                fill="#993E1B"
                fontWeight="bold"
                fontSize="15"
              >
                Joint Family Room
              </text>
              <text x="200" y="215" textAnchor="middle" fill="#6A5B55" fontSize="12">
                Shared Answers + Grounded AI + Live Counsellor
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section id="three-window-model" className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3A2E2A] dark:text-[#F5EFEB]">
            How SAATHI Works
          </h2>
          <p className="text-base text-[#6A5B55] dark:text-[#B8AAA3]">
            Ground truth information and family consensus before life-changing decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="student" className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#FDF4E5] dark:bg-[#342817] flex items-center justify-center text-[#EFA531]">
              <Users className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="student">{t('landing.learnerBadge')}</Badge>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">{t('landing.feature1Title')}</h3>
              <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] leading-relaxed">
                {t('landing.feature1Desc')}
              </p>
            </div>
          </Card>

          <Card variant="parent" className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#EBF4F0] dark:bg-[#1B2F25] flex items-center justify-center text-[#2F7D5C]">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="parent">{t('landing.parentBadge')}</Badge>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">{t('landing.feature2Title')}</h3>
              <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] leading-relaxed">
                {t('landing.feature2Desc')}
              </p>
            </div>
          </Card>

          <Card
            variant="default"
            className="flex flex-col gap-4 border-[#C4562B]/40 dark:border-[#D86A3E]/40"
          >
            <div className="w-12 h-12 rounded-[8px] bg-[#F8EDE7] dark:bg-[#32211B] flex items-center justify-center text-[#C4562B]">
              <FileText className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary">{t('landing.jointBadge')}</Badge>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">{t('landing.feature3Title')}</h3>
              <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] leading-relaxed">
                {t('landing.feature3Desc')}
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
