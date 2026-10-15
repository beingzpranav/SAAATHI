import type {
  TradeSummary,
  TradeDetail,
  NsqfLadderStep,
  TradeFilterParams,
  OutcomeQueryParams,
  VerifiedOutcomeResponse,
  LearnerClassLevel,
} from '@saathi/shared';
import { tradeRepository } from './trade.repository.js';
import { outcomeService } from './outcome.service.js';
import { NotFoundError } from '../../lib/errors.js';

class TradeService {
  /**
   * Generates standard NSQF ladder steps for the 4 core vocational trades.
   */
  public getLadderForTrade(code: string, learnerClassLevel?: LearnerClassLevel): NsqfLadderStep[] {
    const isClass8 = learnerClassLevel === 'CLASS_8_PASS';
    const isGraduate = learnerClassLevel === 'GRADUATE';

    switch (code) {
      case 'ELECTRICIAN':
        return [
          {
            level: 3,
            titleEn: 'Level 3: Assistant Wireman',
            titleHi: 'स्तर 3: सहायक वायरमैन',
            roleEn:
              'Assists senior technicians with conduit laying, wiring pulls, and workshop safety.',
            roleHi:
              'पाइप बिछाने, तार खींचने और कार्यशाला सुरक्षा में वरिष्ठ तकनीशियन की सहायता करता है।',
            minExperienceEn: 'Class 8 Pass + 6-month foundational training',
            minExperienceHi: 'कक्षा 8 उत्तीर्ण + 6 महीने का बुनियादी प्रशिक्षण',
            medianSalaryMonthly: 11500,
            isStartingStep: isClass8,
          },
          {
            level: 4,
            titleEn: 'Level 4: Licensed Electrician',
            titleHi: 'स्तर 4: लाइसेंस प्राप्त इलेक्ट्रीशियन',
            roleEn:
              'Performs independent domestic, commercial, and industrial power installation and repair.',
            roleHi: 'स्वतंत्र घरेलू, वाणिज्यिक और औद्योगिक बिजली स्थापना व मरम्मत करता है।',
            minExperienceEn: 'Class 10 Pass + 2-year CTS ITI Certificate',
            minExperienceHi: 'कक्षा 10 उत्तीर्ण + 2 वर्षीय सीटीएस आईटीआई प्रमाणपत्र',
            medianSalaryMonthly: 18500,
            isStartingStep: !isClass8 && !isGraduate,
          },
          {
            level: 5,
            titleEn: 'Level 5: Master Electrician & Supervisor',
            titleHi: 'स्तर 5: मास्टर इलेक्ट्रीशियन और पर्यवेक्षक',
            roleEn:
              'Supervises industrial panel wiring, motor winding, and substation maintenance.',
            roleHi:
              'औद्योगिक पैनल वायरिंग, मोटर वाइंडिंग और सबस्टेशन रखरखाव का पर्यवेक्षण करता है।',
            minExperienceEn: 'Level 4 + 2-3 years experience + CITS Certification',
            minExperienceHi: 'स्तर 4 + 2-3 वर्ष का अनुभव + सीआईटीएस प्रमाणन',
            medianSalaryMonthly: 28000,
            isStartingStep: isGraduate,
          },
          {
            level: 6,
            titleEn: 'Level 6: Electrical Site In-Charge',
            titleHi: 'स्तर 6: विद्युत साइट प्रभारी',
            roleEn:
              'Manages site electrical infrastructure, energy auditing, and compliance protocols.',
            roleHi:
              'साइट विद्युत बुनियादी ढांचे, ऊर्जा ऑडिटिंग और अनुपालन प्रोटोकॉल का प्रबंधन करता है।',
            minExperienceEn: 'Polytechnic Diploma in Electrical Engineering / B.Voc',
            minExperienceHi: 'इलेक्ट्रिकल इंजीनियरिंग में पॉलिटेक्निक डिप्लोमा / बी.वॉक',
            medianSalaryMonthly: 41000,
            isStartingStep: false,
          },
          {
            level: 7,
            titleEn: 'Level 7: Chief Electrical Systems Specialist',
            titleHi: 'स्तर 7: मुख्य विद्युत प्रणाली विशेषज्ञ',
            roleEn:
              'Heads project execution, HT transmission contracts, and renewable power integration.',
            roleHi:
              'परियोजना निष्पादन, एचटी ट्रांसमिशन अनुबंध और नवीकरणीय ऊर्जा एकीकरण का नेतृत्व करता है।',
            minExperienceEn: 'Senior Professional / Advanced Engineering Degree',
            minExperienceHi: 'वरिष्ठ पेशेवर / उन्नत इंजीनियरिंग डिग्री',
            medianSalaryMonthly: 62000,
            isStartingStep: false,
          },
        ];

      case 'SOLAR_TECH':
        return [
          {
            level: 3,
            titleEn: 'Level 3: Solar Installation Helper',
            titleHi: 'स्तर 3: सोलर इंस्टालेशन सहायक',
            roleEn:
              'Mounts rooftop structural frames and assists in solar panel transport and positioning.',
            roleHi:
              'छत पर संरचनात्मक फ्रेम लगाता है और सौर पैनलों के परिवहन व स्थिति में मदद करता है।',
            minExperienceEn: 'Class 8/10 Pass + Short-term Solar Mitra training',
            minExperienceHi: 'कक्षा 8/10 उत्तीर्ण + अल्पकालिक सूर्य मित्र प्रशिक्षण',
            medianSalaryMonthly: 12000,
            isStartingStep: isClass8,
          },
          {
            level: 4,
            titleEn: 'Level 4: Solar PV System Installation Technician',
            titleHi: 'स्तर 4: सोलर पीवी सिस्टम इंस्टॉलर तकनीशियन',
            roleEn:
              'Completes wiring of solar arrays, inverters, battery banks, and net-metering grid links.',
            roleHi:
              'सोलर एरे, इन्वर्टर, बैटरी बैंक और नेट-मीटरिंग ग्रिड लिंक की वायरिंग पूरी करता है।',
            minExperienceEn: 'Class 10 Pass + 1-year Surya Mitra / ITI Course',
            minExperienceHi: 'कक्षा 10 उत्तीर्ण + 1 वर्षीय सूर्य मित्र / आईटीआई कोर्स',
            medianSalaryMonthly: 19500,
            isStartingStep: !isClass8 && !isGraduate,
          },
          {
            level: 5,
            titleEn: 'Level 5: Solar Plant O&M Specialist',
            titleHi: 'स्तर 5: सोलर प्लांट ओ एंड एम विशेषज्ञ',
            roleEn:
              'Diagnoses inverter faults, string performance drops, and performs preventive maintenance.',
            roleHi:
              'इन्वर्टर की खराबी, स्ट्रिंग प्रदर्शन में गिरावट की जांच और निवारक रखरखाव करता है।',
            minExperienceEn: 'Level 4 + 2 years on-site operational experience',
            minExperienceHi: 'स्तर 4 + 2 वर्ष का ऑन-साइट परिचालन अनुभव',
            medianSalaryMonthly: 29500,
            isStartingStep: isGraduate,
          },
          {
            level: 6,
            titleEn: 'Level 6: Renewable Energy Project Coordinator',
            titleHi: 'स्तर 6: नवीकरणीय ऊर्जा परियोजना समन्वयक',
            roleEn:
              'Designs megawatt-scale rooftop schemes, leads site surveys and DISCOM approvals.',
            roleHi:
              'मेगावाट-स्तरीय रूफटॉप योजनाओं को डिजाइन करता है, साइट सर्वेक्षण और डिस्कोम अनुमोदन का नेतृत्व करता है।',
            minExperienceEn: 'Diploma / Degree in Renewable Energy or Electrical',
            minExperienceHi: 'नवीकरणीय ऊर्जा या इलेक्ट्रिकल में डिप्लोमा / डिग्री',
            medianSalaryMonthly: 43000,
            isStartingStep: false,
          },
          {
            level: 7,
            titleEn: 'Level 7: Solar EPC Lead Manager',
            titleHi: 'स्तर 7: सोलर ईपीसी प्रमुख प्रबंधक',
            roleEn:
              'Directs turnkey solar EPC contracts, financial modeling, and regional grid tenders.',
            roleHi:
              'टर्नकी सोलर ईपीसी अनुबंधों, वित्तीय मॉडलिंग और क्षेत्रीय ग्रिड निविदाओं का प्रबंधन करता है।',
            minExperienceEn: 'B.Voc / B.Tech + 5+ years green-energy leadership',
            minExperienceHi: 'बी.वॉक / बी.टेक + 5+ वर्ष हरित-ऊर्जा नेतृत्व',
            medianSalaryMonthly: 65000,
            isStartingStep: false,
          },
        ];

      case 'GDA':
        return [
          {
            level: 3,
            titleEn: 'Level 3: Healthcare Attendant',
            titleHi: 'स्तर 3: स्वास्थ्य परिचारक',
            roleEn:
              'Assists patients with mobility, hygiene, nourishment, and sanitization support.',
            roleHi: 'मरीजों को गतिशीलता, स्वच्छता, पोषण और स्वच्छता सहायता में मदद करता है।',
            minExperienceEn: 'Class 8/10 Pass + 3-month foundational healthcare training',
            minExperienceHi: 'कक्षा 8/10 उत्तीर्ण + 3 माह का आधारभूत स्वास्थ्य प्रशिक्षण',
            medianSalaryMonthly: 11000,
            isStartingStep: isClass8,
          },
          {
            level: 4,
            titleEn: 'Level 4: General Duty Healthcare Assistant (GDA)',
            titleHi: 'स्तर 4: जनरल ड्यूटी स्वास्थ्य सहायक',
            roleEn:
              'Monitors vital signs, basic nursing procedures, wound care, and patient documentation.',
            roleHi:
              'महत्वपूर्ण संकेतों की निगरानी, बुनियादी नर्सिंग प्रक्रियाएं, घाव की देखभाल और दस्तावेज संभालता है।',
            minExperienceEn: 'Class 10 Pass + 6 to 12-month GDA NSQF certification',
            minExperienceHi: 'कक्षा 10 उत्तीर्ण + 6 से 12 माह का जीडीए एनएसक्यूएफ प्रमाणन',
            medianSalaryMonthly: 17000,
            isStartingStep: !isClass8 && !isGraduate,
          },
          {
            level: 5,
            titleEn: 'Level 5: Senior Patient Care Coordinator',
            titleHi: 'स्तर 5: वरिष्ठ रोगी देखभाल समन्वयक',
            roleEn:
              'Coordinates ward nursing workflow, emergency shift logistics, and triage intake.',
            roleHi:
              'वार्ड नर्सिंग कार्यप्रवाह, आपातकालीन शिफ्ट लॉजिस्टिक्स और ट्राइएज सेवन का समन्वय करता है।',
            minExperienceEn: 'Level 4 + 2 years hospital ward experience',
            minExperienceHi: 'स्तर 4 + 2 वर्ष अस्पताल वार्ड का अनुभव',
            medianSalaryMonthly: 25500,
            isStartingStep: isGraduate,
          },
          {
            level: 6,
            titleEn: 'Level 6: Clinical Care Supervisor',
            titleHi: 'स्तर 6: क्लिनिकल केयर पर्यवेक्षक',
            roleEn:
              'Supervises hospital floor patient care standards, infection control, and NABH protocols.',
            roleHi:
              'अस्पताल तल रोगी देखभाल मानकों, संक्रमण नियंत्रण और एनएबीएच प्रोटोकॉल की निगरानी करता है।',
            minExperienceEn: 'Diploma in General Nursing / Healthcare Management',
            minExperienceHi: 'जनरल नर्सिंग / हेल्थकेयर मैनेजमेंट में डिप्लोमा',
            medianSalaryMonthly: 37000,
            isStartingStep: false,
          },
          {
            level: 7,
            titleEn: 'Level 7: Hospital Operations Manager',
            titleHi: 'स्तर 7: अस्पताल संचालन प्रबंधक',
            roleEn:
              'Oversees institutional patient care departments, medical staffing, and quality assurance.',
            roleHi:
              'संस्थागत रोगी देखभाल विभागों, चिकित्सा स्टाफ और गुणवत्ता आश्वासन की देखरेख करता है।',
            minExperienceEn: 'B.Voc in Healthcare / MHA',
            minExperienceHi: 'हेल्थकेयर में बी.वॉक / एमएचए',
            medianSalaryMonthly: 56000,
            isStartingStep: false,
          },
        ];

      case 'CNC_OPERATOR':
      default:
        return [
          {
            level: 3,
            titleEn: 'Level 3: Machine Shop Assistant',
            titleHi: 'स्तर 3: मशीन शॉप सहायक',
            roleEn:
              'Loads raw metal billets, deburrs machined components, and monitors coolant levels.',
            roleHi:
              'कच्चे धातु के बिलेट्स लोड करता है, मशीनीकृत घटकों को साफ करता है और शीतलक स्तर की निगरानी करता है।',
            minExperienceEn: 'Class 8/10 Pass + basic mechanical fitter orientation',
            minExperienceHi: 'कक्षा 8/10 उत्तीर्ण + बुनियादी मैकेनिकल फिटर ओरिएंटेशन',
            medianSalaryMonthly: 13000,
            isStartingStep: isClass8,
          },
          {
            level: 4,
            titleEn: 'Level 4: CNC Turning & Milling Machinist',
            titleHi: 'स्तर 4: सीएनसी टर्निंग और मिलिंग मशीनिस्ट',
            roleEn:
              'Sets up tools, enters offsets, operates 3-axis CNC machines, and checks micrometer tolerances.',
            roleHi:
              'टूल सेट करता है, ऑफसेट दर्ज करता है, 3-एक्सिस सीएनसी मशीन चलाता है और माइक्रोमीटर टॉलरेंस जांचता है।',
            minExperienceEn: 'Class 10/12 Pass + 1-year ITI Machinist / Turner CTS',
            minExperienceHi: 'कक्षा 10/12 उत्तीर्ण + 1 वर्षीय आईटीआई मशीनिस्ट / टर्नर सीटीएस',
            medianSalaryMonthly: 21000,
            isStartingStep: !isClass8 && !isGraduate,
          },
          {
            level: 5,
            titleEn: 'Level 5: CNC Programmer & Tool Setter',
            titleHi: 'स्तर 5: सीएनसी प्रोग्रामर और टूल सेटर',
            roleEn:
              'Writes G-Code and M-Code part programs, operates CAD/CAM software, and optimizes cycle times.',
            roleHi:
              'जी-कोड और एम-कोड प्रोग्राम लिखता है, सीएडी/सीएएम सॉफ्टवेयर संचालित करता है और चक्र समय अनुकूलित करता है।',
            minExperienceEn: 'Level 4 + 2 years industrial CNC machining experience',
            minExperienceHi: 'स्तर 4 + 2 वर्ष का औद्योगिक सीएनसी मशीनिंग अनुभव',
            medianSalaryMonthly: 32500,
            isStartingStep: isGraduate,
          },
          {
            level: 6,
            titleEn: 'Level 6: Precision Tool Room Supervisor',
            titleHi: 'स्तर 6: सटीक टूल रूम पर्यवेक्षक',
            roleEn:
              'Oversees 5-axis CNC machining centers, coordinate measuring machines (CMM), and QA audits.',
            roleHi:
              '5-एक्सिस सीएनसी मशीनिंग केंद्र, सीएमएम और गुणवत्ता आश्वासन ऑडिट की देखरेख करता है।',
            minExperienceEn: 'Diploma in Mechanical Engineering / Tool & Die Making',
            minExperienceHi: 'मैकेनिकल इंजीनियरिंग / टूल और डाई मेकिंग में डिप्लोमा',
            medianSalaryMonthly: 46000,
            isStartingStep: false,
          },
          {
            level: 7,
            titleEn: 'Level 7: Manufacturing Automation Specialist',
            titleHi: 'स्तर 7: विनिर्माण स्वचालन विशेषज्ञ',
            roleEn:
              'Designs Industry 4.0 cellular manufacturing, robotic loading lines, and smart shop floors.',
            roleHi:
              'उद्योग 4.0 सेलुलर विनिर्माण, रोबोटिक लोडिंग लाइनों और स्मार्ट शॉप फ्लोर को डिजाइन करता है।',
            minExperienceEn: 'B.Voc / B.Tech in Mechatronics or Mechanical Engineering',
            minExperienceHi: 'मेकाट्रॉनिक्स या मैकेनिकल इंजीनियरिंग में बी.वॉक / बी.टेक',
            medianSalaryMonthly: 68000,
            isStartingStep: false,
          },
        ];
    }
  }

  async getAllTrades(filters?: TradeFilterParams): Promise<TradeSummary[]> {
    const records = await tradeRepository.findAll(filters);
    return records.map((t) => ({
      id: t.id,
      code: t.code,
      titleEn: t.titleEn,
      titleHi: t.titleHi,
      sector: t.sector,
      descriptionEn: t.descriptionEn,
      descriptionHi: t.descriptionHi,
      nsqfLevel: t.nsqfLevel,
      durationMonths: t.durationMonths,
      minEducation: t.minEducation,
      entryStep: t.entryStep,
    }));
  }

  async getTradeByCode(code: string, learnerClassLevel?: LearnerClassLevel): Promise<TradeDetail> {
    const trade = await tradeRepository.findByCode(code);
    if (!trade) {
      throw new NotFoundError(`Trade with code '${code}' was not found.`);
    }

    const providers = await tradeRepository.findApprovedProviders(trade.id);
    const ladderSteps = this.getLadderForTrade(trade.code, learnerClassLevel);

    return {
      id: trade.id,
      code: trade.code,
      titleEn: trade.titleEn,
      titleHi: trade.titleHi,
      sector: trade.sector,
      descriptionEn: trade.descriptionEn,
      descriptionHi: trade.descriptionHi,
      nsqfLevel: trade.nsqfLevel,
      durationMonths: trade.durationMonths,
      minEducation: trade.minEducation,
      entryStep: trade.entryStep,
      ladderSteps,
      coursesCount: trade.courses.length,
      approvedProvidersCount: providers.length,
    };
  }

  async getTradeOutcomes(
    code: string,
    query: OutcomeQueryParams,
  ): Promise<VerifiedOutcomeResponse> {
    const trade = await tradeRepository.findByCode(code);
    if (!trade) {
      throw new NotFoundError(`Trade with code '${code}' was not found.`);
    }

    return outcomeService.resolveOutcomeWithFallback(
      trade,
      query.state,
      query.district,
      query.block,
    );
  }
}

export const tradeService = new TradeService();
