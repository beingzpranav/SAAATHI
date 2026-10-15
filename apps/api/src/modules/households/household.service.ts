import type {
  HouseholdIntakeInput,
  HouseholdSummary,
  IncomeBand,
  LearnerClassLevel,
} from '@saathi/shared';
import { householdRepository } from './household.repository.js';
import { NotFoundError } from '../../lib/errors.js';

class HouseholdService {
  public computeCostFraming(incomeBand: IncomeBand): HouseholdSummary['costFraming'] {
    switch (incomeBand) {
      case 'BELOW_1_5L':
        return {
          category: 'FULL_SUBSIDY',
          headlineEn: '100% Tuition Fee Waiver & Direct Benefit Transfer Eligible',
          headlineHi: '100% ट्यूशन फीस माफ़ी और डीबीटी छात्रवृत्ति हेतु पात्र',
          detailsEn:
            'Govt ITI tuition is fully waived under State Social Welfare schemes. Eligible for PM-YASASVI / Post-Matric Scholarship plus up to ₹2,500/month NAPS apprenticeship stipend.',
          detailsHi:
            'सरकारी आईटीआई ट्यूशन राज्य समाज कल्याण योजनाओं के तहत पूरी तरह से माफ है। पीएम-यशस्वी / पोस्ट-मैट्रिक छात्रवृत्ति और ₹2,500/माह एनएपीएस शिक्षुता मानदेय हेतु पात्र।',
          stipendEligible: true,
          scholarshipScheme: 'UP Post-Matric SC/OBC/EWS Scholarship & NAPS Stipend',
        };
      case '1_5L_TO_3L':
        return {
          category: 'PARTIAL_AID',
          headlineEn: 'Subsidized Government Fee & Hostel Allowance',
          headlineHi: 'रियायती सरकारी फीस और छात्रावास भत्ता',
          detailsEn:
            'Govt ITI annual fee capped at ₹480 - ₹1,200. Eligible for state merit-cum-means assistance and ₹1,500 - ₹2,500 monthly training stipend.',
          detailsHi:
            'सरकारी आईटीआई वार्षिक शुल्क ₹480 - ₹1,200 तक सीमित। राज्य योग्यता-सह-साधन सहायता और ₹1,500 - ₹2,500 मासिक प्रशिक्षण मानदेय हेतु पात्र।',
          stipendEligible: true,
          scholarshipScheme: 'State Technical Education Fee Concession',
        };
      case '3L_TO_5L':
        return {
          category: 'STANDARD',
          headlineEn: 'High Return on Investment with Industry Apprenticeship',
          headlineHi: 'उद्योग शिक्षुता के साथ उच्च रिटर्न ऑन इन्वेस्टमेंट',
          detailsEn:
            'Low entry investment with rapid earning potential within 6-12 months. Dual-training programs provide paid industry internships.',
          detailsHi:
            'कम शुरुआती निवेश के साथ 6-12 महीनों में त्वरित कमाई। दोहरी प्रशिक्षण प्रणाली सवेतन उद्योग इंटर्नशिप प्रदान करती है।',
          stipendEligible: true,
          scholarshipScheme: 'Dual System of Training (DST) Industry Allowance',
        };
      case 'ABOVE_5L':
      default:
        return {
          category: 'PREMIUM_ROI',
          headlineEn: 'Specialized Advanced Tech & Accelerated Placement',
          headlineHi: 'विशेष उन्नत प्रौद्योगिकी और त्वरित प्लेसमेंट',
          detailsEn:
            'Opportunity for specialized polytechnic or dual-certification diploma with starting salaries reaching ₹25,000 - ₹35,000/month.',
          detailsHi:
            'विशेष पॉलिटेक्निक या दोहरे प्रमाणन डिप्लोमा का अवसर, शुरुआती वेतन ₹25,000 - ₹35,000/माह तक।',
          stipendEligible: false,
          scholarshipScheme: 'Merit-Based Corporate CSR Sponsorship',
        };
    }
  }

  public computeHighlightedNsqfLevel(classLevel: LearnerClassLevel): number {
    switch (classLevel) {
      case 'CLASS_8_PASS':
        return 3;
      case 'CLASS_10_PASS':
        return 4;
      case 'CLASS_12_PASS':
        return 4;
      case 'GRADUATE':
        return 5;
      default:
        return 4;
    }
  }

  public computePrimaryConcernKey(incomeBand: IncomeBand): string {
    switch (incomeBand) {
      case 'BELOW_1_5L':
        return 'STIPEND_IMMEDIATE_EARNING';
      case '1_5L_TO_3L':
        return 'FEE_AND_JOB_PLACEMENT_SECURITY';
      case '3L_TO_5L':
        return 'CAREER_GROWTH_AND_DIPLOMA_PATH';
      case 'ABOVE_5L':
      default:
        return 'INDUSTRY_REPUTATION_AND_HIGHER_DEGREE';
    }
  }

  private formatHouseholdSummary(household: {
    id: string;
    name: string;
    state: string;
    district: string;
    block: string;
    incomeBand: string;
    learnerClassLevel: string;
    createdAt: Date;
    updatedAt: Date;
  }): HouseholdSummary {
    const incomeBand = household.incomeBand as IncomeBand;
    const learnerClassLevel = household.learnerClassLevel as LearnerClassLevel;

    return {
      id: household.id,
      name: household.name,
      state: household.state,
      district: household.district,
      block: household.block,
      incomeBand,
      learnerClassLevel,
      costFraming: this.computeCostFraming(incomeBand),
      highlightedNsqfLevel: this.computeHighlightedNsqfLevel(learnerClassLevel),
      primaryConcernKey: this.computePrimaryConcernKey(incomeBand),
      createdAt: household.createdAt.toISOString(),
      updatedAt: household.updatedAt.toISOString(),
    };
  }

  async saveIntake(userId: string, input: HouseholdIntakeInput): Promise<HouseholdSummary> {
    const household = await householdRepository.saveIntake(userId, input);
    return this.formatHouseholdSummary(household);
  }

  async getIntakeByUserId(userId: string): Promise<HouseholdSummary> {
    const household = await householdRepository.findByUserId(userId);
    if (!household) {
      throw new NotFoundError(
        'No household intake found for this user. Please complete intake intake first.',
      );
    }
    return this.formatHouseholdSummary(household);
  }
}

export const householdService = new HouseholdService();
