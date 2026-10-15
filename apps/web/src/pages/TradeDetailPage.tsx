import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { TradeDetail, VerifiedOutcomeResponse } from '@saathi/shared';
import { NsqfLadder } from '../features/trades/components/NsqfLadder.js';
import { ConfidenceBadge, FallbackNotice } from '../features/trades/components/ConfidenceBadge.js';
import { Button } from '../components/ui/Button.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  Clock,
  GraduationCap,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const TradeDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const { household } = useSessionStore();

  const [trade, setTrade] = useState<TradeDetail | null>(null);
  const [outcome, setOutcome] = useState<VerifiedOutcomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    setIsLoading(true);

    const classLevelParam = household?.learnerClassLevel
      ? `?classLevel=${household.learnerClassLevel}`
      : '';

    apiClient
      .get<TradeDetail>(`/trades/${code}${classLevelParam}`)
      .then((res) => {
        setTrade(res.data);
      })
      .catch(() => {
        setTrade(null);
      });

    const stateParam = household?.state || 'Uttar Pradesh';
    const districtParam = household?.district || 'Varanasi';
    const blockParam = household?.block || 'Kashi Vidyapeeth';

    apiClient
      .get<VerifiedOutcomeResponse>(
        `/trades/${code}/outcomes?state=${encodeURIComponent(stateParam)}&district=${encodeURIComponent(districtParam)}&block=${encodeURIComponent(blockParam)}`,
      )
      .then((res) => {
        setOutcome(res.data);
      })
      .catch(() => {
        setOutcome(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [code, household]);

  if (isLoading) {
    return (
      <div className="py-8 space-y-6">
        <Skeleton height={40} width="30%" />
        <Skeleton height={120} />
        <Skeleton height={400} />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
          {isHi ? 'ट्रेड नहीं मिला' : 'Vocational Trade Not Found'}
        </h2>
        <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
          {isHi
            ? 'अनुरोधित ट्रेड कोड उपलब्ध नहीं है।'
            : 'The requested trade code could not be loaded.'}
        </p>
        <Button variant="outline" asChild>
          <Link to="/trades">
            <ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true" />
            <span>{isHi ? 'एक्सप्लोरर पर वापस जाएं' : 'Back to Trade Explorer'}</span>
          </Link>
        </Button>
      </div>
    );
  }

  const record = outcome?.record;

  return (
    <div className="py-6 sm:py-8 space-y-8">
      {/* Top breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-[#C4562B] dark:text-[#E27E53]">
          <Link to="/trades" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{isHi ? 'सभी ट्रेड्स देखें' : 'Back to Trade Explorer'}</span>
          </Link>
        </Button>

        {record?.confidenceLabel && (
          <ConfidenceBadge
            label={record.confidenceLabel}
            geographicLevel={outcome?.actualLevel || undefined}
          />
        )}
      </div>

      {/* Trade Hero Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#FFFDF9] dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#F8EDE7] dark:bg-[#34221A] text-[#993E1B] dark:text-[#EFA531]">
            NSQF Level {trade.nsqfLevel}
          </span>
          <span className="text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3] font-semibold">
            {trade.sector}
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
          {isHi ? trade.titleHi : trade.titleEn}
        </h1>

        <p className="text-base text-[#4A3D37] dark:text-[#D1C6BD] max-w-3xl leading-relaxed">
          {isHi ? trade.descriptionHi : trade.descriptionEn}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8DDD2] dark:border-[#3D3430] text-xs">
          <div className="flex items-center gap-2 text-[#554640] dark:text-[#C5B8B1]">
            <Clock className="w-4 h-4 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <span>
              <strong>{isHi ? 'अवधि:' : 'Duration:'}</strong> {trade.durationMonths}{' '}
              {isHi ? 'महीने' : 'Months'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#554640] dark:text-[#C5B8B1]">
            <GraduationCap
              className="w-4 h-4 text-[#C4562B] dark:text-[#E27E53]"
              aria-hidden="true"
            />
            <span>
              <strong>{isHi ? 'न्यूनतम योग्यता:' : 'Min Education:'}</strong> {trade.minEducation}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#554640] dark:text-[#C5B8B1]">
            <Building2 className="w-4 h-4 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <span>
              <strong>{isHi ? 'प्रवेश चरण:' : 'Entry Step:'}</strong> {trade.entryStep}
            </span>
          </div>
        </div>
      </div>

      {/* Verified Outcome Summary Card */}
      {record && (
        <Card className="border-[#E8DDD2] dark:border-[#3D3430] bg-[#FAF6EE] dark:bg-[#251E1A]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-5 h-5 text-[#2F7D5C] dark:text-[#50AF85]"
                  aria-hidden="true"
                />
                <CardTitle className="font-serif text-lg">
                  {isHi
                    ? 'स्थानीय सत्यापित परिणाम डेटा (मध्यमान वेतन व प्लेसमेंट)'
                    : 'Verified Local Outcomes & Salary Reality'}
                </CardTitle>
              </div>
              <ConfidenceBadge
                label={record.confidenceLabel}
                geographicLevel={outcome?.actualLevel || undefined}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {outcome?.fallbackApplied && outcome.actualLevel && (
              <FallbackNotice
                actualLevel={outcome.actualLevel}
                requestedLevel={outcome.requestedLevel}
                reason={outcome.fallbackReason}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430]">
                <span className="block text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                  {isHi ? 'सत्यापित मध्यमान मासिक वेतन' : 'Verified Median Monthly'}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#2F7D5C] dark:text-[#50AF85] block mt-1">
                  ₹{record.medianSalaryMonthly.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-[#6A5B55] dark:text-[#B8AAA3]">
                    {isHi ? '/माह' : '/mo'}
                  </span>
                </span>
                <span className="text-xs text-[#7A6B63] dark:text-[#A89A92] mt-1 block">
                  {isHi ? 'सीमा:' : 'Range:'} ₹{record.salaryRangeMin.toLocaleString('en-IN')} – ₹
                  {record.salaryRangeMax.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430]">
                <span className="block text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                  {isHi ? 'सत्यापित प्लेसमेंट दर' : 'Placement Rate'}
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#1F1A17] dark:text-[#FFFDF9] block mt-1">
                  {record.placementRatePercent}%
                </span>
                <span className="text-xs text-[#7A6B63] dark:text-[#A89A92] mt-1 block">
                  {record.verifiedGraduatesCount}{' '}
                  {isHi ? 'सत्यापित स्नातक' : 'verified alumni in sample'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430]">
                <span className="block text-xs uppercase tracking-wider text-[#6A5B55] dark:text-[#B8AAA3]">
                  {isHi ? 'डेटा स्रोत व ऑडिट' : 'Data Sources & Audit'}
                </span>
                <ul className="mt-1 space-y-1 text-xs text-[#4A3D37] dark:text-[#D1C6BD]">
                  {record.sources.map((src, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-[#2F7D5C] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{src}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embedded NSQF Career Ladder Visualizer */}
      <NsqfLadder steps={trade.ladderSteps} tradeTitle={isHi ? trade.titleHi : trade.titleEn} />

      {/* Approved Training Providers in Varanasi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <h3 className="font-serif text-xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
              {isHi
                ? 'अनुमोदित प्रशिक्षण केंद्र (वाराणसी)'
                : 'Approved Training Providers (Varanasi Region)'}
            </h3>
          </div>
          <span className="text-xs font-medium text-[#6A5B55] dark:text-[#B8AAA3]">
            {isHi ? 'सत्यापित सरकारी व मान्यताप्राप्त संस्थान' : 'NCVT / SCVT Verified Institutes'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFDF9] dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EBF4F0] dark:bg-[#1B2F25] text-[#1E573F] dark:text-[#50AF85] font-semibold">
                  GOVERNMENT ITI
                </span>
                <h4 className="font-serif text-base font-bold text-[#1F1A17] dark:text-[#FFFDF9] mt-1">
                  Government ITI Karaundi, Varanasi
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                {household?.incomeBand === 'BELOW_1_5L' ? '₹0 / 100% Free' : '₹480 / yr'}
              </span>
            </div>

            <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C4562B] shrink-0" aria-hidden="true" />
              <span>Karaundi, BHU Road, Kashi Vidyapeeth, Varanasi - 221005</span>
            </p>

            <div className="p-2.5 rounded-lg bg-[#FAF6EE] dark:bg-[#28211A] text-xs flex items-center justify-between text-[#554640] dark:text-[#C5B8B1]">
              <span className="flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-[#2F7D5C]" aria-hidden="true" />
                <span>{isHi ? 'मासिक शिक्षुता मानदेय:' : 'Apprentice Stipend:'}</span>
              </span>
              <span className="font-mono font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                ₹2,500 / {isHi ? 'माह' : 'mo'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF9] dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F8EDE7] dark:bg-[#34221A] text-[#993E1B] dark:text-[#EFA531] font-semibold">
                  GOVERNMENT ITI
                </span>
                <h4 className="font-serif text-base font-bold text-[#1F1A17] dark:text-[#FFFDF9] mt-1">
                  Government ITI Chauka Ghat, Varanasi
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                {household?.incomeBand === 'BELOW_1_5L' ? '₹0 / 100% Free' : '₹480 / yr'}
              </span>
            </div>

            <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C4562B] shrink-0" aria-hidden="true" />
              <span>Near Old Bus Stand, Harahua / Chauka Ghat, Varanasi - 221002</span>
            </p>

            <div className="p-2.5 rounded-lg bg-[#FAF6EE] dark:bg-[#28211A] text-xs flex items-center justify-between text-[#554640] dark:text-[#C5B8B1]">
              <span className="flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-[#2F7D5C]" aria-hidden="true" />
                <span>{isHi ? 'मासिक शिक्षुता मानदेय:' : 'Apprentice Stipend:'}</span>
              </span>
              <span className="font-mono font-bold text-[#2F7D5C] dark:text-[#50AF85]">
                ₹2,500 / {isHi ? 'माह' : 'mo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Family Action Footer */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#FFFDF9] dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-base sm:text-lg font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
            {isHi
              ? 'क्या यह ट्रेड आपकी परिवार सूची में शामिल है?'
              : 'Consider this trade for family counselling?'}
          </h4>
          <p className="text-xs sm:text-sm text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5">
            {isHi
              ? 'इसे अपनी प्राथमिकताओं में जोड़ें या संयुक्त कमरे में अभिभावक के साथ चर्चा करें।'
              : 'Add to your decision shortlist or discuss verified concerns in the Joint Room.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/trades">
              <span>{isHi ? 'अन्य ट्रेड्स खोजें' : 'Browse More'}</span>
            </Link>
          </Button>
          <Button variant="primary" asChild className="w-full sm:w-auto">
            <Link to="/intake">
              <span>{isHi ? 'परामर्श कक्ष में जाएं' : 'Continue Intake'}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
