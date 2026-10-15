import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Award,
  IndianRupee,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

import { cn } from '../../lib/cn.js';

interface LadderStep {
  level: number;
  titleEn: string;
  titleHi: string;
  roleEn: string;
  roleHi: string;
  salaryEn: string;
  salaryHi: string;
  durationEn: string;
  durationHi: string;
  isStarting: boolean;
}

const NSQF_STEPS: LadderStep[] = [
  {
    level: 4,
    titleEn: 'CTS ITI Certificate / Surya Mitra',
    titleHi: 'सीटीएस आईटीआई प्रमाणपत्र / सूर्य मित्र',
    roleEn: 'Certified Technician / Electrician / Operator',
    roleHi: 'प्रमाणित तकनीशियन / इलेक्ट्रीशियन / ऑपरेटर',
    salaryEn: '₹14,000 – ₹18,500 / month',
    salaryHi: '₹14,000 – ₹18,500 / माह',
    durationEn: '1-2 years training + NAPS stipend',
    durationHi: '1-2 वर्ष प्रशिक्षण + एनएपीएस मानदेय',
    isStarting: true,
  },
  {
    level: 5,
    titleEn: 'Advanced Certificate / CITS',
    titleHi: 'उन्नत प्रमाणपत्र / सीआईटीएस',
    roleEn: 'Senior Specialist / Maintenance Lead',
    roleHi: 'वरिष्ठ विशेषज्ञ / रखरखाव प्रमुख',
    salaryEn: '₹22,000 – ₹30,000 / month',
    salaryHi: '₹22,000 – ₹30,000 / माह',
    durationEn: '1-2 years industry experience or 1 year CITS',
    durationHi: '1-2 वर्ष उद्योग अनुभव या 1 वर्ष सीआईटीएस',
    isStarting: false,
  },
  {
    level: 6,
    titleEn: 'Polytechnic Diploma (Lateral Entry)',
    titleHi: 'पॉलिटेक्निक डिप्लोमा (पार्श्व प्रवेश)',
    roleEn: 'Workshop Supervisor / Junior Engineer (JE)',
    roleHi: 'कार्यशाला पर्यवेक्षक / कनिष्ठ अभियंता (JE)',
    salaryEn: '₹32,000 – ₹45,000 / month',
    salaryHi: '₹32,000 – ₹45,000 / माह',
    durationEn: 'Direct 2nd year entry (2 years diploma)',
    durationHi: 'सीधे द्वितीय वर्ष में प्रवेश (2 वर्ष डिप्लोमा)',
    isStarting: false,
  },
  {
    level: 7,
    titleEn: 'Bachelor of Vocation (B.Voc) / B.Tech',
    titleHi: 'बैचलर ऑफ वोकेशन (B.Voc) / बी.टेक',
    roleEn: 'Operations Manager / Plant Head',
    roleHi: 'परिचालन प्रबंधक / संयंत्र प्रमुख',
    salaryEn: '₹50,000 – ₹75,000+ / month',
    salaryHi: '₹50,000 – ₹75,000+ / माह',
    durationEn: 'University degree pathway',
    durationHi: 'विश्वविद्यालय डिग्री पथ',
    isStarting: false,
  },
];

export const NsqfLadderView: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('hi') ? 'hi' : 'en';
  const [selectedLevel, setSelectedLevel] = useState<number>(4);

  const activeStep: LadderStep =
    NSQF_STEPS.find((s) => s.level === selectedLevel) ?? NSQF_STEPS[0]!;


  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-bold text-[var(--color-text)]">
            {lang === 'hi' ? 'एनएसक्यूएफ करियर सीढ़ी' : 'NSQF Career Progression Ladder'}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-success)] flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          {lang === 'hi' ? 'राष्ट्रीय मानक' : 'National Qualification Framework'}
        </span>
      </div>

      <p className="text-xs text-[var(--color-subtext)] leading-relaxed">
        {lang === 'hi'
          ? 'व्यावसायिक शिक्षा कोई बंद रास्ता नहीं है। आईटीआई स्तर 4 से शुरू करके छात्र सीधे पर्यवेक्षक, पॉलिटेक्निक डिप्लोमा और बी.वॉक डिग्री तक पहुंच सकते हैं।'
          : 'Vocational training is not a dead end. Starting at Level 4, graduates advance laterally into supervisory roles, Polytechnic Diploma, and Bachelor of Vocation (B.Voc) degrees.'}
      </p>

      {/* Vertical / Step progression visual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {NSQF_STEPS.map((step) => {
          const isSelected = step.level === selectedLevel;

          return (
            <button
              key={step.level}
              type="button"
              onClick={() => setSelectedLevel(step.level)}
              className={cn(
                'rounded-xl border p-3.5 text-left transition-all flex flex-col gap-2 relative',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-raised)] shadow-md ring-2 ring-[var(--color-primary)]/20'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-subtext)]',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                    step.isStarting
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-muted)] text-[var(--color-text)]',
                  )}
                >
                  Level {step.level}
                </span>
                {step.isStarting && (
                  <span className="text-[9px] font-bold text-[var(--color-success)]">
                    Start Here
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--color-text)] line-clamp-1">
                  {lang === 'hi' ? step.roleHi : step.roleEn}
                </p>
                <p className="text-[11px] text-[var(--color-subtext)] line-clamp-1">
                  {lang === 'hi' ? step.titleHi : step.titleEn}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] pt-1 border-t border-[var(--color-border)]">
                <IndianRupee className="w-3 h-3" />
                <span>{lang === 'hi' ? step.salaryHi : step.salaryEn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Deep Dive */}
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-raised)] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            L{activeStep.level}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text)]">
              {lang === 'hi' ? activeStep.roleHi : activeStep.roleEn}
            </h4>
            <p className="text-xs text-[var(--color-subtext)]">
              {lang === 'hi' ? activeStep.titleHi : activeStep.titleEn}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--color-text)]">
                {lang === 'hi' ? 'मासिक वेतन दायरा' : 'Monthly Earnings Horizon'}:
              </span>
              <p className="text-[var(--color-subtext)]">
                {lang === 'hi' ? activeStep.salaryHi : activeStep.salaryEn}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--color-text)]">
                {lang === 'hi' ? 'योग्यता व अनुभव' : 'Qualification & Duration'}:
              </span>
              <p className="text-[var(--color-subtext)]">
                {lang === 'hi' ? activeStep.durationHi : activeStep.durationEn}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
          <span>
            {activeStep.level === 4
              ? lang === 'hi'
                ? 'कक्षा 10 उत्तीर्ण करने के बाद सीधे प्रवेश। 100% छात्रवृत्ति और मानदेय उपलब्ध।'
                : 'Direct admission after Class 10. Tuition fee waiver and NAPS stipend available.'
              : lang === 'hi'
                ? 'पारंपरिक डिग्री धारकों की तुलना में तेजी से पदोन्नति और कार्यशाला पर्यवेक्षक पद।'
                : 'Accelerated promotion to supervisory roles with higher wage stability than general degrees.'}
          </span>
        </div>
      </div>
    </div>
  );
};
