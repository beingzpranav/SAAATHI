import React, { useState, useEffect } from 'react';
import type { TradeSummary, VerifiedOutcomeResponse, HouseholdSummary } from '@saathi/shared';
import { TradeCard } from '../features/trades/components/TradeCard.js';
import { Button } from '../components/ui/Button.js';
import { Select } from '../components/ui/Select.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { apiClient } from '../lib/apiClient.js';
import { useSessionStore } from '../stores/session.store.js';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Compass, MapPin, SlidersHorizontal, ArrowRight, Sparkles } from 'lucide-react';

export const TradeExplorerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const { household, setHousehold } = useSessionStore();

  const [trades, setTrades] = useState<TradeSummary[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, VerifiedOutcomeResponse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedEducation, setSelectedEducation] = useState<string>('ALL');

  // Load household intake if not already in session store
  useEffect(() => {
    if (!household) {
      apiClient
        .get<HouseholdSummary>('/households')
        .then((res) => {
          setHousehold(res.data);
        })
        .catch(() => {
          // If no intake yet, we fallback to default Varanasi demonstration
        });
    }
  }, [household, setHousehold]);

  // Load trades and their verified outcomes
  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get<TradeSummary[]>('/trades')
      .then(async (res) => {
        const tradeList = res.data;
        setTrades(tradeList);

        const stateParam = household?.state || 'Uttar Pradesh';
        const districtParam = household?.district || 'Varanasi';
        const blockParam = household?.block || 'Kashi Vidyapeeth';

        const outcomePromises = tradeList.map((t) =>
          apiClient
            .get<VerifiedOutcomeResponse>(
              `/trades/${t.code}/outcomes?state=${encodeURIComponent(stateParam)}&district=${encodeURIComponent(districtParam)}&block=${encodeURIComponent(blockParam)}`,
            )
            .then((resp) => ({ code: t.code, outcome: resp.data }))
            .catch(() => ({ code: t.code, outcome: null })),
        );

        const outcomeResults = await Promise.all(outcomePromises);
        const outcomeMap: Record<string, VerifiedOutcomeResponse> = {};
        for (const item of outcomeResults) {
          if (item.outcome) {
            outcomeMap[item.code] = item.outcome;
          }
        }
        setOutcomes(outcomeMap);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [household]);

  const filteredTrades = trades.filter((t) => {
    if (
      selectedSector !== 'ALL' &&
      !t.sector.toLowerCase().includes(selectedSector.toLowerCase())
    ) {
      return false;
    }
    if (selectedEducation !== 'ALL') {
      if (selectedEducation === 'CLASS_8' && !t.minEducation.toLowerCase().includes('8')) {
        return false;
      }
      if (selectedEducation === 'CLASS_10' && !t.minEducation.toLowerCase().includes('10')) {
        return false;
      }
      if (selectedEducation === 'CLASS_12' && !t.minEducation.toLowerCase().includes('12')) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="py-6 sm:py-8 space-y-6">
      {/* Header and Household Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2] dark:border-[#3D3430]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
              {isHi ? 'सत्यापित ट्रेड एक्सप्लोरर' : 'Verified Vocational Trade Explorer'}
            </h1>
          </div>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] mt-1">
            {isHi
              ? 'राष्ट्रीय कौशल योग्यता ढांचा (NSQF) के आधार पर सत्यापित स्थानीय वेतन और प्लेसमेंट आंकड़े।'
              : 'Verified local salaries and placement rates grounded in NSQF vocational pathways.'}
          </p>
        </div>

        {/* Location & Income Context Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-[#FAF6EE] dark:bg-[#28211A] border border-[#E8DDD2] dark:border-[#3D3430] text-xs">
          <div className="flex items-center gap-1.5 text-[#554640] dark:text-[#C5B8B1]">
            <MapPin className="w-3.5 h-3.5 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <span className="font-semibold">
              {household
                ? `${household.district} (${household.block})`
                : 'Varanasi (Kashi Vidyapeeth)'}
            </span>
          </div>

          <span className="text-[#C5B8B1]">•</span>

          <span className="text-[#6A5B55] dark:text-[#B8AAA3]">
            {household?.incomeBand === 'BELOW_1_5L'
              ? isHi
                ? '100% निशुल्क ट्यूशन'
                : '100% Free Tuition'
              : isHi
                ? 'रियायती सरकारी फीस'
                : 'Subsidized Fee'}
          </span>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-xs text-[#C4562B] dark:text-[#E27E53]"
          >
            <Link to="/intake">{isHi ? 'स्थान बदलें' : 'Change Location'}</Link>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-[#221B18] border border-[#E8DDD2] dark:border-[#3D3430]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#554640] dark:text-[#C5B8B1] self-start sm:self-center shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#C4562B]" aria-hidden="true" />
          <span>{isHi ? 'फ़िल्टर करें:' : 'Filter By:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Select
            options={[
              { value: 'ALL', label: isHi ? 'सभी क्षेत्र (All Sectors)' : 'All Sectors' },
              {
                value: 'power',
                label: isHi ? 'बिजली और ऊर्जा (Power & Electrical)' : 'Power & Energy',
              },
              {
                value: 'solar',
                label: isHi ? 'हरित ऊर्जा और सोलर (Solar & Green Energy)' : 'Green Energy & Solar',
              },
              {
                value: 'healthcare',
                label: isHi ? 'स्वास्थ्य सेवा (Healthcare & Paramedical)' : 'Healthcare',
              },
              {
                value: 'capital',
                label: isHi
                  ? 'सीएनसी और सटीक विनिर्माण (CNC & Manufacturing)'
                  : 'CNC & Manufacturing',
              },
            ]}
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          />

          <Select
            options={[
              {
                value: 'ALL',
                label: isHi ? 'सभी शैक्षणिक स्तर (All Education)' : 'All Eligibility',
              },
              {
                value: 'CLASS_8',
                label: isHi ? 'कक्षा 8 उत्तीर्ण (Class 8 Pass)' : 'Class 8 Pass',
              },
              {
                value: 'CLASS_10',
                label: isHi ? 'कक्षा 10 उत्तीर्ण (Class 10 Pass)' : 'Class 10 Pass',
              },
              {
                value: 'CLASS_12',
                label: isHi ? 'कक्षा 12 उत्तीर्ण (Class 12 Pass)' : 'Class 12 Pass',
              },
            ]}
            value={selectedEducation}
            onChange={(e) => setSelectedEducation(e.target.value)}
          />
        </div>
      </div>

      {/* Trades Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={280} />
          <Skeleton height={280} />
          <Skeleton height={280} />
          <Skeleton height={280} />
        </div>
      ) : filteredTrades.length === 0 ? (
        <EmptyState
          title={isHi ? 'कोई ट्रेड नहीं मिला' : 'No Vocational Trades Found'}
          description={
            isHi
              ? 'चयनित फ़िल्टर के साथ कोई ट्रेड मेल नहीं खाता। कृपया फ़िल्टर रीसेट करें।'
              : 'No trades match the selected criteria. Try resetting the filters.'
          }
          actionLabel={isHi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
          onAction={() => {
            setSelectedSector('ALL');
            setSelectedEducation('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrades.map((trade) => (
            <TradeCard
              key={trade.code}
              trade={trade}
              outcome={outcomes[trade.code]}
              household={household}
            />
          ))}
        </div>
      )}

      {/* Bottom Counselling Callout */}
      <div className="p-5 rounded-xl bg-[#F8EDE7] dark:bg-[#32211A] border border-[#C4562B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
        <div>
          <div className="flex items-center gap-2 text-[#993E1B] dark:text-[#EFA531] font-bold text-sm">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>{isHi ? 'पारिवारिक निर्णय समर्थन' : 'Family Decision Support'}</span>
          </div>
          <p className="text-sm text-[#5A382C] dark:text-[#E2D4CD] mt-1 max-w-xl">
            {isHi
              ? 'विद्यार्थी और अभिभावक अपनी प्राथमिकताओं को अपने-अपने निजी विंडो में दर्ज कर सकते हैं, जिसे साथ मिलकर संयुक्त कक्ष (Joint Room) में साझा किया जाएगा।'
              : 'Learners and parents can record their priorities in private windows before coming together in the Joint Room.'}
          </p>
        </div>

        <Button variant="primary" asChild className="shrink-0">
          <Link to="/intake" className="flex items-center gap-1.5">
            <span>{isHi ? 'परामर्श शुरू करें' : 'Start Counselling'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
