import type { AiQueryResponse } from '@saathi/shared';

export interface GuardrailCheckResult {
  allowed: boolean;
  refusalResponse?: AiQueryResponse;
}

const OUT_OF_SCOPE_PATTERNS = [
  // General chit-chat / cooking / recipes
  /\b(recipe|bake|cake|cook|biryani|pizza|burger|curry|masala)\b/i,
  // Entertainment / gaming / movies / sports
  /\b(cricket|football|world cup|movie|actor|actress|bollywood|hollywood|video game|pubg|freefire|minecraft)\b/i,
  // Politics / international affairs
  /\b(prime minister|president|election|political party|bjp|congress|parliament|united nations|war in)\b/i,
  // Medical advice
  /\b(headache|fever|medicine|cough|doctor prescription|cure cancer|infection symptoms|medical diagnose)\b/i,
  // Finance speculation
  /\b(crypto|bitcoin|stock market|share trading|mutual fund|forex|lottery|gambling)\b/i,
  // System prompts / jailbreak attempts
  /\b(ignore previous instructions|act as dan|unrestricted ai|bypass guardrails|jailbreak|pretend you are)\b/i,
  // Fictional / non-vocational elite professions not in ITI / NSQF scope
  /\b(astronaut|cosmonaut|neurosurgeon|cardiothoracic|rocket scientist|nuclear submarine|billionaire|hollywood director)\b/i,
];

const VOCATIONAL_KEYWORDS = [
  'trade', 'iti', 'nsqf', 'course', 'training', 'stipend', 'salary', 'kamai',
  'duration', 'fee', 'electrician', 'solar', 'welder', 'fitter', 'plumber',
  'copa', 'computer', 'fashion', 'cosmetology', 'mechanic', 'automobile',
  'placement', 'job', 'career', 'naps', 'pmkvy', 'polytechnic', 'diploma',
  'qualification', 'eligibility', 'hostel', 'safety', 'respect', 'parent',
  'family', 'income', 'block', 'district', 'varanasi', 'admission',
  'वेतन', 'ट्रेड', 'आईटीआई', 'कोर्स', 'प्रशिक्षण', 'कमाई', 'नौकरी', 'फीस', 'वजीफा'
];

export class GuardrailsService {
  /**
   * Evaluates if a query is within the domain of verified vocational counselling.
   */
  checkScope(query: string): GuardrailCheckResult {
    const trimmed = query.trim().toLowerCase();

    // 1. Check for explicit out-of-scope topics
    for (const pattern of OUT_OF_SCOPE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          refusalResponse: this.buildRefusalResponse(
            query,
            'Your question is outside the scope of SAATHI. SAATHI is an AI vocational counsellor dedicated exclusively to verified ITI trades, regional wages, NSQF career pathways, and household counselling.',
            'आपका प्रश्न साथी (SAATHI) के कार्यक्षेत्र से बाहर है। साथी केवल सत्यापित आईटीआई ट्रेडों, क्षेत्रीय वेतन, एनएसक्यूएफ करियर पथ और पारिवारिक परामर्श के संबंध में सहायता प्रदान करता है।',
          ),
        };
      }
    }

    // 2. Minimum length check
    if (trimmed.length < 3) {
      return {
        allowed: false,
        refusalResponse: this.buildRefusalResponse(
          query,
          'Please enter a more specific question about vocational trades, courses, salaries, or training centres.',
          'कृपया व्यावसायिक ट्रेड, कोर्स, वेतन या प्रशिक्षण केंद्रों के बारे में अधिक विस्तृत प्रश्न पूछें।',
        ),
      };
    }

    // 3. Check for relevance if query is ambiguous or gibberish
    const hasVocationalKeyword = VOCATIONAL_KEYWORDS.some((kw) => trimmed.includes(kw));
    // If it has no vocational keywords and doesn't mention salary, job, learn, school, work, future, etc.
    const generalCareerTerms = /\b(work|earn|job|study|future|pass|class|after 10th|after 8th|after 12th|skill|centre|center|bihar|uttar pradesh|up)\b/i;
    
    if (!hasVocationalKeyword && !generalCareerTerms.test(trimmed)) {
      // If it looks like general knowledge or irrelevant search
      return {
        allowed: false,
        refusalResponse: this.buildRefusalResponse(
          query,
          'SAATHI can only answer questions related to vocational education, ITI trades, career progression, regional job outcomes, and family counselling.',
          'साथी केवल व्यावसायिक शिक्षा, आईटीआई ट्रेड, करियर प्रगति, क्षेत्रीय रोजगार परिणामों और पारिवारिक परामर्श से संबंधित प्रश्नों का उत्तर दे सकता है।',
        ),
      };
    }

    return { allowed: true };
  }

  /**
   * Refusal response constructor with verified sample questions
   */
  buildRefusalResponse(
    query: string,
    reasonEn: string,
    reasonHi: string,
  ): AiQueryResponse {
    return {
      query,
      answerEn: `I cannot answer this query. ${reasonEn} Please explore verified trade outcomes, stipend guidelines, or career progression routes below.`,
      answerHi: `मैं इस प्रश्न का उत्तर नहीं दे सकता। ${reasonHi} कृपया नीचे सत्यापित ट्रेड परिणामों, मानदेय नियमों या करियर पथों की जानकारी देखें।`,
      isRefusal: true,
      refusalReasonEn: reasonEn,
      refusalReasonHi: reasonHi,
      citations: [],
      confidence: 'NONE',
      relatedTrades: [],
      suggestedQuestions: [
        {
          en: 'What is the median salary for Electrician graduates in Varanasi?',
          hi: 'वाराणसी में इलेक्ट्रीशियन स्नातकों का औसत वेतन क्या है?',
        },
        {
          en: 'What is the duration and minimum qualification for Solar Technician?',
          hi: 'सोलर तकनीशियन के लिए कोर्स की अवधि और न्यूनतम योग्यता क्या है?',
        },
        {
          en: 'Are there tuition fee exemptions and NAPS stipends for Govt ITI students?',
          hi: 'क्या सरकारी आईटीआई छात्रों के लिए ट्यूशन फीस माफ़ी और एनएपीएस मानदेय उपलब्ध है?',
        },
      ],
    };
  }
}

export const guardrails = new GuardrailsService();
