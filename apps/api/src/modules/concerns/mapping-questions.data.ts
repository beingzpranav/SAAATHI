import type { MappingQuestion } from '@saathi/shared';

export const MAPPING_QUESTIONS: MappingQuestion[] = [
  // --- Learner Mapping Questions ---
  {
    id: 'q_learner_work_type',
    category: 'WORK_ENVIRONMENT',
    targetRole: 'LEARNER',
    questionEn: 'What kind of daily work environment motivates you the most?',
    questionHi: 'किस प्रकार का कार्य वातावरण आपको सबसे अधिक प्रेरित करता है?',
    hintEn: 'There is no wrong answer. This helps identify hands-on technical trades vs desk roles.',
    hintHi: 'कोई गलत उत्तर नहीं है। यह व्यावहारिक तकनीकी ट्रेड्स बनाम डेस्क कार्य की पहचान में मदद करता है।',
    options: [
      {
        value: 'HANDS_ON_TOOLS',
        labelEn: 'Working with physical machinery, wiring, or tools with immediate tangible results',
        labelHi: 'मशीनरी, वायरिंग या उपकरणों के साथ व्यावहारिक काम, जहां तुरंत परिणाम दिखे',
        initialScore: 4,
      },
      {
        value: 'CLEAN_PARAMEDICAL',
        labelEn: 'Helping people in hospital or clinical settings with patient interaction',
        labelHi: 'अस्पताल या क्लिनिकल परिवेश में लोगों की सेवा और देखभाल करना',
        initialScore: 4,
      },
      {
        value: 'COMPUTER_ASSISTED_TECH',
        labelEn: 'Computerized machinery (like CNC CAD/CAM) or solar monitoring systems',
        labelHi: 'कंप्यूटरीकृत मशीनरी (जैसे सीएनसी सीएडी/सीएएम) या सोलर निगरानी प्रणाली',
        initialScore: 4,
      },
      {
        value: 'OFFICE_DESK_ONLY',
        labelEn: 'Only administrative paperwork and desk computer tasks',
        labelHi: 'केवल प्रशासनिक कागजी काम और डेस्क कंप्यूटर कार्य',
        initialScore: 2,
      },
    ],
  },
  {
    id: 'q_learner_earning_timeline',
    category: 'TIME_HORIZON',
    targetRole: 'LEARNER',
    questionEn: 'How soon is it important for you to start earning an income?',
    questionHi: 'आपके लिए कितनी जल्दी कमाई शुरू करना आवश्यक है?',
    options: [
      {
        value: 'IMMEDIATE_STIPEND',
        labelEn: 'Immediate: Need paid apprentice stipend within 6-12 months to support my family',
        labelHi: 'तत्काल: परिवार की सहायता के लिए 6-12 महीनों में सवेतन शिक्षुता मानदेय आवश्यक है',
        initialScore: 5,
      },
      {
        value: 'STANDARD_1_2_YEARS',
        labelEn: 'Moderate: Ready to complete 1-2 years CTS ITI course before starting full-time job',
        labelHi: 'मध्यम: पूर्णकालिक नौकरी से पहले 1-2 वर्ष का सीटीएस आईटीआई कोर्स पूरा करने को तैयार',
        initialScore: 3,
      },
      {
        value: 'LONG_TERM_DIPLOMA',
        labelEn: 'Long-term: Can afford 3 years of polytechnic diploma for higher starting level',
        labelHi: 'दीर्घकालिक: उच्च शुरुआती स्तर के लिए 3 वर्षीय पॉलिटेक्निक डिप्लोमा कर सकता हूँ',
        initialScore: 2,
      },
    ],
  },
  {
    id: 'q_learner_peer_respect',
    category: 'SOCIAL_RESPECT',
    targetRole: 'LEARNER',
    questionEn: 'Are you concerned about how friends or relatives view vocational ITI courses compared to BA/BSc degrees?',
    questionHi: 'क्या आप इस बात से चिंतित हैं कि बीए/बीएससी डिग्री की तुलना में रिश्तेदार या दोस्त आईटीआई को कैसे देखते हैं?',
    options: [
      {
        value: 'HIGH_ANXIETY',
        labelEn: 'Yes, I worry people look down on trade skills despite better job prospects',
        labelHi: 'हाँ, मुझे चिंता है कि बेहतर नौकरी की संभावनाओं के बावजूद लोग कौशल को कम आंकते हैं',
        initialScore: 5,
      },
      {
        value: 'SOME_CONCERN',
        labelEn: 'Somewhat, but real earnings and guaranteed jobs matter more to me',
        labelHi: 'कुछ हद तक, लेकिन मेरे लिए वास्तविक कमाई और निश्चित नौकरी अधिक महत्वपूर्ण है',
        initialScore: 3,
      },
      {
        value: 'NO_CONCERN',
        labelEn: 'Not at all, practical skills and quick employment give me confidence',
        labelHi: 'बिल्कुल नहीं, व्यावहारिक कौशल और त्वरित रोजगार मुझे आत्मविश्वास देते हैं',
        initialScore: 1,
      },
    ],
  },

  // --- Parent Mapping Questions ---
  {
    id: 'q_parent_primary_worry',
    category: 'FINANCIAL_WORRY',
    targetRole: 'PARENT',
    questionEn: 'What is your primary concern when considering your child’s career path?',
    questionHi: 'अपने बच्चे के करियर मार्ग पर विचार करते समय आपकी प्राथमिक चिंता क्या है?',
    options: [
      {
        value: 'JOB_PLACEMENT_SECURITY',
        labelEn: 'Will they get a genuine, verified job right after completing the course?',
        labelHi: 'क्या कोर्स पूरा करने के तुरंत बाद उन्हें वास्तविक, सत्यापित नौकरी मिलेगी?',
        initialScore: 5,
      },
      {
        value: 'COURSE_FEES_BURDEN',
        labelEn: 'Course fees and training costs: Can we afford it without debt?',
        labelHi: 'कोर्स फीस और प्रशिक्षण लागत: क्या हम बिना कर्ज लिए इसे वहन कर सकते हैं?',
        initialScore: 5,
      },
      {
        value: 'SOCIAL_STATUS_RESPECT',
        labelEn: 'Social respect: Will society treat this as a respectable, honorable career?',
        labelHi: 'सामाजिक सम्मान: क्या समाज इसे एक सम्मानजनक करियर के रूप में देखेगा?',
        initialScore: 4,
      },
      {
        value: 'MIGRATION_SAFETY',
        labelEn: 'Distance & safety: Can they work locally in Varanasi / UP rather than migrating far?',
        labelHi: 'दूरी और सुरक्षा: क्या वे दूर जाने के बजाय वाराणसी / यूपी में स्थानीय रूप से काम कर सकते हैं?',
        initialScore: 4,
      },
    ],
  },
  {
    id: 'q_parent_fee_perception',
    category: 'FINANCIAL_WORRY',
    targetRole: 'PARENT',
    questionEn: 'Would you support a government ITI course if tuition fees are 100% free under scholarship?',
    questionHi: 'यदि छात्रवृत्ति के तहत सरकारी आईटीआई की ट्यूशन फीस 100% मुफ्त हो, तो क्या आप इसका समर्थन करेंगे?',
    options: [
      {
        value: 'STRONGLY_SUPPORT',
        labelEn: 'Yes! Free tuition with monthly apprenticeship stipend would be a blessing for our family',
        labelHi: 'हाँ! मासिक शिक्षुता मानदेय के साथ निशुल्क ट्यूशन हमारे परिवार के लिए वरदान होगा',
        initialScore: 1,
      },
      {
        value: 'NEED_PLACEMENT_GUARANTEE',
        labelEn: 'Yes, provided the institute has verified alumni placement records in Varanasi',
        labelHi: 'हाँ, बशर्ते संस्थान के पास वाराणसी में सत्यापित पूर्व छात्र प्लेसमेंट रिकॉर्ड हों',
        initialScore: 3,
      },
      {
        value: 'PREFER_DEGREE',
        labelEn: 'I still prefer a regular college degree even if it takes longer and has uncertain jobs',
        labelHi: 'मैं फिर भी नियमित कॉलेज डिग्री पसंद करता हूँ, भले ही इसमें अधिक समय लगे और नौकरी अनिश्चित हो',
        initialScore: 5,
      },
    ],
  },
  {
    id: 'q_parent_migration_distance',
    category: 'MIGRATION_DISTANCE',
    targetRole: 'PARENT',
    questionEn: 'Are you comfortable with the learner working within Uttar Pradesh (Varanasi/Lucknow) or only in your home block?',
    questionHi: 'क्या आप शिक्षार्थी के उत्तर प्रदेश (वाराणसी/लखनऊ) में काम करने से सहज हैं या केवल अपने गृह ब्लॉक में?',
    options: [
      {
        value: 'LOCAL_DISTRICT_PREFERRED',
        labelEn: 'Within Varanasi district is ideal (e.g. Karaundi, Chauka Ghat, Ramnagar industrial area)',
        labelHi: 'वाराणसी जिले के भीतर आदर्श है (जैसे करौंदी, चौका घाट, रामनगर औद्योगिक क्षेत्र)',
        initialScore: 2,
      },
      {
        value: 'STATE_WIDE_ACCEPTABLE',
        labelEn: 'Anywhere in Uttar Pradesh is acceptable for a good salary and verified company',
        labelHi: 'अच्छे वेतन और सत्यापित कंपनी के लिए उत्तर प्रदेश में कहीं भी स्वीकार्य है',
        initialScore: 3,
      },
      {
        value: 'STRICTLY_HOME_BLOCK',
        labelEn: 'Must stay strictly in home block / commuting distance every evening',
        labelHi: 'हर शाम घर लौटने वाली दूरी / गृह ब्लॉक में ही रहना आवश्यक है',
        initialScore: 4,
      },
    ],
  },
];
