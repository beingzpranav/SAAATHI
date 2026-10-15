import React, { useState, useEffect } from 'react';
import {
  type HouseholdIntakeInput,
  type HouseholdSummary,
  type IncomeBand,
  type LearnerClassLevel,
  type LocationState,
  type LocationDistrict,
  type LocationBlock,
} from '@saathi/shared';
import { Input } from '../../../components/ui/Input.js';
import { Select } from '../../../components/ui/Select.js';
import { Button } from '../../../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.js';
import { apiClient } from '../../../lib/apiClient.js';
import { useSessionStore } from '../../../stores/session.store.js';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Banknote,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { cn } from '../../../lib/cn.js';

export const HouseholdIntakeForm: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const navigate = useNavigate();
  const { setHousehold } = useSessionStore();

  const [householdName, setHouseholdName] = useState('Sharma Household');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Varanasi');
  const [selectedBlock, setSelectedBlock] = useState('Kashi Vidyapeeth');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>('1_5L_TO_3L');
  const [classLevel, setClassLevel] = useState<LearnerClassLevel>('CLASS_10_PASS');

  const [states, setStates] = useState<LocationState[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [blocks, setBlocks] = useState<LocationBlock[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load locations
  useEffect(() => {
    apiClient
      .get<LocationState[]>('/locations/states')
      .then((res) => {
        setStates(res.data);
      })
      .catch(() => {
        // Fallback default
        setStates([{ code: 'UP', name: 'Uttar Pradesh' }]);
      });
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    apiClient
      .get<LocationDistrict[]>(`/locations/districts?state=${encodeURIComponent(selectedState)}`)
      .then((res) => {
        setDistricts(res.data);
      })
      .catch(() => {
        setDistricts([{ code: 'UP_VARANASI', name: 'Varanasi', stateCode: 'UP' }]);
      });
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDistrict) return;
    apiClient
      .get<LocationBlock[]>(`/locations/blocks?district=${encodeURIComponent(selectedDistrict)}`)
      .then((res) => {
        setBlocks(res.data);
      })
      .catch(() => {
        setBlocks([
          { code: 'VAR_KASHI', name: 'Kashi Vidyapeeth', districtCode: 'UP_VARANASI' },
          { code: 'VAR_PINDRA', name: 'Pindra', districtCode: 'UP_VARANASI' },
          { code: 'VAR_SEVAPURI', name: 'Sevapuri', districtCode: 'UP_VARANASI' },
          { code: 'VAR_HARAHUA', name: 'Harahua', districtCode: 'UP_VARANASI' },
        ]);
      });
  }, [selectedDistrict]);

  const handleQuickFillVaranasi = () => {
    setHouseholdName('Sharma Family (Varanasi)');
    setSelectedState('Uttar Pradesh');
    setSelectedDistrict('Varanasi');
    setSelectedBlock('Kashi Vidyapeeth');
    setIncomeBand('1_5L_TO_3L');
    setClassLevel('CLASS_10_PASS');
  };

  // Synchronous preview calculations reflecting server-side rules
  const getPreviewCostFraming = () => {
    switch (incomeBand) {
      case 'BELOW_1_5L':
        return {
          title: isHi
            ? '100% ट्यूशन फीस माफ़ी और मासिक शिक्षुता मानदेय'
            : '100% Tuition Fee Waiver & DBT Monthly Stipend',
          details: isHi
            ? 'सरकारी आईटीआई में 100% निशुल्क प्रवेश + ₹2,500/माह एनएपीएस शिक्षुता सहायता।'
            : 'Zero tuition at Govt ITIs under state scholarship + ₹2,500/month NAPS stipend.',
          tag: isHi ? 'पूर्ण सब्सिडी' : 'Full Subsidy',
        };
      case '1_5L_TO_3L':
        return {
          title: isHi
            ? 'रियायती सरकारी फीस (₹40/माह) और योग्यता सहायता'
            : 'Subsidized Govt ITI Fee (~₹480/yr) & Merit Aid',
          details: isHi
            ? 'न्यूनतम सरकारी शुल्क और 6-12 माह में सवेतन औद्योगिक प्रशिक्षण।'
            : 'Nominal public fee structure with guaranteed paid industry apprenticeship.',
          tag: isHi ? 'रियायती' : 'Subsidized Aid',
        };
      case '3L_TO_5L':
        return {
          title: isHi
            ? 'उच्च रिटर्न ऑन इन्वेस्टमेंट (सवेतन उद्योग इंटर्नशिप)'
            : 'High Return on Investment with Paid Apprenticeship',
          details: isHi
            ? 'दोहरी प्रशिक्षण प्रणाली (DST) के तहत उद्योग में तत्काल व्यावहारिक अनुभव।'
            : 'Dual System of Training with live industry placement within 1 year.',
          tag: isHi ? 'मानक आरओआई' : 'Standard ROI',
        };
      case 'ABOVE_5L':
      default:
        return {
          title: isHi
            ? 'उन्नत विशेषज्ञता और त्वरित प्लेसमेंट'
            : 'Specialized Advanced Tech & Accelerated Placement',
          details: isHi
            ? 'उच्च-मांग वाली सीएनसी और नवीकरणीय ऊर्जा में ₹25,000+ शुरुआती वेतन।'
            : 'High-growth specialization in advanced CNC & solar with ₹25,000+ starting salaries.',
          tag: isHi ? 'प्रीमियम ट्रैक' : 'Advanced Track',
        };
    }
  };

  const getPreviewStartingLevel = () => {
    switch (classLevel) {
      case 'CLASS_8_PASS':
        return {
          level: 3,
          desc: isHi
            ? 'एनएसक्यूएफ स्तर 3 (सहायक वायरमैन / परिचारक)'
            : 'NSQF Level 3 (Assistant Wireman / Healthcare Attendant)',
        };
      case 'CLASS_10_PASS':
        return {
          level: 4,
          desc: isHi
            ? 'एनएसक्यूएफ स्तर 4 (लाइसेंस प्राप्त इलेक्ट्रीशियन, सोलर पीवी, जीडीए, सीएनसी)'
            : 'NSQF Level 4 (Licensed Electrician, Solar PV, GDA, CNC Operator)',
        };
      case 'CLASS_12_PASS':
        return {
          level: 4,
          desc: isHi
            ? 'एनएसक्यूएफ स्तर 4-5 (सीएनसी प्रोग्रामर / तकनीशियन)'
            : 'NSQF Level 4-5 (CNC Machinist / Solar Specialist)',
        };
      case 'GRADUATE':
        return {
          level: 5,
          desc: isHi
            ? 'एनएसक्यूएफ स्तर 5 (मास्टर सुपरवाइजर / लैब इन-चार्ज)'
            : 'NSQF Level 5 (Master Supervisor / Lab In-Charge)',
        };
    }
  };

  const previewFraming = getPreviewCostFraming();
  const previewLevel = getPreviewStartingLevel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: HouseholdIntakeInput = {
      name: householdName,
      state: selectedState,
      district: selectedDistrict,
      block: selectedBlock,
      incomeBand,
      learnerClassLevel: classLevel,
    };

    try {
      const res = await apiClient.post<HouseholdSummary>('/households', payload);
      setHousehold(res.data);
      setSuccessMsg(
        isHi
          ? 'पारिवारिक विवरण सफलतापूर्वक सहेजा गया! ट्रेड एक्सप्लोरर पर भेजा जा रहा है...'
          : 'Household intake saved successfully! Redirecting to customized Trade Explorer...',
      );
      setTimeout(() => {
        navigate('/trades');
      }, 1200);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      setErrorMsg(
        error.response?.data?.error?.message ||
          error.message ||
          'Failed to save intake. Please ensure you are logged in.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD2] dark:border-[#3D3430]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
            {isHi ? 'पारिवारिक परामर्श इनटेक' : 'Household Intake & Location'}
          </h1>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3] mt-1">
            {isHi
              ? 'स्थान, आय वर्ग और शिक्षार्थी की कक्षा के आधार पर सत्यापित अवसर और शुल्क छूट अनुकूलित की जाती हैं।'
              : 'Verified local outcomes, cost framing, and NSQF ladders personalize immediately based on these answers.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleQuickFillVaranasi}
          className="shrink-0 flex items-center gap-1.5 self-start sm:self-auto text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#EFA531]" aria-hidden="true" />
          <span>{isHi ? 'त्वरित भरें: वाराणसी डेमो' : 'Quick Fill: Varanasi Demo'}</span>
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#FDF2F0] dark:bg-[#341B18] border border-[#B83226]/30 text-sm text-[#8E241B] dark:text-[#E56658]">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EBF4F0] dark:bg-[#1B2F25] border border-[#2F7D5C]/30 text-sm text-[#1E573F] dark:text-[#50AF85] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F7D5C]" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Location */}
        <Card className="border-[#E8DDD2] dark:border-[#3D3430] bg-[#FFFDF9] dark:bg-[#1F1A17]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
              <CardTitle className="text-lg font-serif">
                {isHi
                  ? '1. भौगोलिक स्थान (राज्य, जिला, ब्लॉक)'
                  : '1. Geographic Location (State, District, Block)'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label={isHi ? 'परिवार / घर का नाम' : 'Household Name'}
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label={isHi ? 'राज्य' : 'State'}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                options={
                  states.length > 0
                    ? states.map((s) => ({ value: s.name, label: s.name }))
                    : [{ value: 'Uttar Pradesh', label: 'Uttar Pradesh' }]
                }
                required
              />

              <Select
                label={isHi ? 'जिला' : 'District'}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                options={
                  districts.length > 0
                    ? districts.map((d) => ({ value: d.name, label: d.name }))
                    : [{ value: 'Varanasi', label: 'Varanasi' }]
                }
                required
              />

              <Select
                label={isHi ? 'ब्लॉक (स्थानीय डेटा हेतु)' : 'Block (for localized data)'}
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                options={
                  blocks.length > 0
                    ? blocks.map((b) => ({ value: b.name, label: b.name }))
                    : [{ value: 'Kashi Vidyapeeth', label: 'Kashi Vidyapeeth' }]
                }
                helperText={
                  isHi
                    ? 'उदाहरण: काशी विद्यापीठ, पिंडरा, सेवापुरी, हरहुआ'
                    : 'e.g. Kashi Vidyapeeth, Pindra, Sevapuri, Harahua'
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Income Band */}
        <Card className="border-[#E8DDD2] dark:border-[#3D3430] bg-[#FFFDF9] dark:bg-[#1F1A17]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#2F7D5C] dark:text-[#50AF85]" aria-hidden="true" />
              <CardTitle className="text-lg font-serif">
                {isHi ? '2. वार्षिक पारिवारिक आय वर्ग' : '2. Annual Household Income Band'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: 'BELOW_1_5L',
                  titleEn: '< ₹1.5 Lakhs / year',
                  titleHi: '< ₹1.5 लाख / वर्ष',
                  subEn: 'Eligible for 100% Free Tuition & DBT Welfare Scholarship',
                  subHi: '100% निशुल्क ट्यूशन व डीबीटी छात्रवृत्ति हेतु पात्र',
                },
                {
                  value: '1_5L_TO_3L',
                  titleEn: '₹1.5 Lakhs – ₹3 Lakhs',
                  titleHi: '₹1.5 लाख – ₹3 लाख',
                  subEn: 'Subsidized ITI Fee (~₹40/mo) with Paid Apprenticeship',
                  subHi: 'रियायती सरकारी आईटीआई शुल्क (~₹40/माह) व सवेतन अप्रेंटिस',
                },
                {
                  value: '3L_TO_5L',
                  titleEn: '₹3 Lakhs – ₹5 Lakhs',
                  titleHi: '₹3 लाख – ₹5 लाख',
                  subEn: 'High ROI Dual System of Training & Technical Certifications',
                  subHi: 'उच्च आरओआई दोहरी प्रशिक्षण प्रणाली व तकनीकी प्रमाणन',
                },
                {
                  value: 'ABOVE_5L',
                  titleEn: '> ₹5 Lakhs / year',
                  titleHi: '> ₹5 लाख / वर्ष',
                  subEn: 'Advanced Polytechnic, CNC & High-Salary Specializations',
                  subHi: 'उन्नत पॉलिटेक्निक, सीएनसी व उच्च वेतन विशेषज्ञताएं',
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex flex-col p-3.5 rounded-lg border cursor-pointer transition-colors text-sm',
                    incomeBand === option.value
                      ? 'border-[#C4562B] bg-[#FAF1EC] dark:bg-[#34221A] ring-1 ring-[#C4562B]'
                      : 'border-[#E8DDD2] dark:border-[#3D3430] hover:bg-[#F9F5EE] dark:hover:bg-[#2A2320]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F1A17] dark:text-[#FFFDF9]">
                      {isHi ? option.titleHi : option.titleEn}
                    </span>
                    <input
                      type="radio"
                      name="incomeBand"
                      value={option.value}
                      checked={incomeBand === option.value}
                      onChange={() => setIncomeBand(option.value as IncomeBand)}
                      className="text-[#C4562B] focus:ring-[#C4562B]"
                    />
                  </div>
                  <span className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-1">
                    {isHi ? option.subHi : option.subEn}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Learner Class Level */}
        <Card className="border-[#E8DDD2] dark:border-[#3D3430] bg-[#FFFDF9] dark:bg-[#1F1A17]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#EFA531]" aria-hidden="true" />
              <CardTitle className="text-lg font-serif">
                {isHi ? '3. शिक्षार्थी की वर्तमान शिक्षा स्तर' : '3. Learner Current Class Level'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  value: 'CLASS_8_PASS',
                  labelEn: 'Class 8 Pass',
                  labelHi: 'कक्षा 8 उत्तीर्ण',
                  step: 'Level 3 Entry',
                },
                {
                  value: 'CLASS_10_PASS',
                  labelEn: 'Class 10 Pass',
                  labelHi: 'कक्षा 10 उत्तीर्ण',
                  step: 'Level 4 Entry',
                },
                {
                  value: 'CLASS_12_PASS',
                  labelEn: 'Class 12 Pass',
                  labelHi: 'कक्षा 12 उत्तीर्ण',
                  step: 'Level 4-5 Entry',
                },
                {
                  value: 'GRADUATE',
                  labelEn: 'Graduate / Diploma',
                  labelHi: 'स्नातक / डिप्लोमा',
                  step: 'Level 5 Entry',
                },
              ].map((lvl) => (
                <label
                  key={lvl.value}
                  className={cn(
                    'flex flex-col p-3 rounded-lg border cursor-pointer text-center transition-colors',
                    classLevel === lvl.value
                      ? 'border-[#EFA531] bg-[#FDF9EE] dark:bg-[#342A17] ring-1 ring-[#EFA531]'
                      : 'border-[#E8DDD2] dark:border-[#3D3430] hover:bg-[#F9F5EE] dark:hover:bg-[#2A2320]',
                  )}
                >
                  <input
                    type="radio"
                    name="classLevel"
                    value={lvl.value}
                    checked={classLevel === lvl.value}
                    onChange={() => setClassLevel(lvl.value as LearnerClassLevel)}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-[#1F1A17] dark:text-[#FFFDF9]">
                    {isHi ? lvl.labelHi : lvl.labelEn}
                  </span>
                  <span className="text-[11px] font-mono text-[#C4562B] dark:text-[#EFA531] mt-1">
                    {lvl.step}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Dynamic Feedback Panel */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF6EE] dark:bg-[#28211A] border border-[#E8DDD2] dark:border-[#3D3430] shadow-inner space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C4562B] dark:text-[#E27E53]" aria-hidden="true" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#1F1A17] dark:text-[#FFFDF9]">
              {isHi ? 'लाइव अनुकूलन पूर्वावलोकन' : 'Live Personalization Impact'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#C4562B]/10 text-[#C4562B] dark:text-[#E27E53] font-medium ml-auto">
              {isHi ? 'आपके उत्तरों के अनुसार' : 'Dynamically Adjusted'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-white dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430]">
              <span className="text-[#6A5B55] dark:text-[#B8AAA3] block uppercase tracking-wider text-[10px]">
                {isHi ? 'शुल्क व छात्रवृत्ति संरचना' : 'Cost & Scholarship Framing'}
              </span>
              <span className="font-bold text-[#1F1A17] dark:text-[#FFFDF9] text-sm block mt-0.5">
                {previewFraming.title}
              </span>
              <p className="text-[#6A5B55] dark:text-[#B8AAA3] mt-1 leading-snug">
                {previewFraming.details}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#1F1A17] border border-[#E8DDD2] dark:border-[#3D3430]">
              <span className="text-[#6A5B55] dark:text-[#B8AAA3] block uppercase tracking-wider text-[10px]">
                {isHi ? 'एनएसक्यूएफ प्रवेश स्तर' : 'Highlighted NSQF Entry Level'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#EFA531]/20 text-[#855403] dark:text-[#F8C26E] text-xs">
                  Level {previewLevel.level}
                </span>
                <span className="font-medium text-[#1F1A17] dark:text-[#FFFDF9]">
                  {previewLevel.desc}
                </span>
              </div>
              <p className="text-[#6A5B55] dark:text-[#B8AAA3] mt-1 text-[11px]">
                {isHi
                  ? `स्थान: ${selectedDistrict} (${selectedBlock}) के सत्यापित स्थानीय आंकड़े प्रदर्शित होंगे।`
                  : `Location: Verified outcome records for ${selectedDistrict} (${selectedBlock}) will be prioritized.`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#6A5B55] dark:text-[#B8AAA3]">
            <ShieldCheck className="w-4 h-4 text-[#2F7D5C]" aria-hidden="true" />
            <span>
              {isHi
                ? 'डेटा केवल परिवार के निर्णय और स्थानीय कॉलेज चयन के लिए उपयोग होगा।'
                : 'Data used strictly for family counselling & localized verified insights.'}
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>{isHi ? 'पारिवारिक विवरण सहेजें' : 'Save Household Intake'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
};
