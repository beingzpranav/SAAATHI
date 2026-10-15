import {
  PrismaClient,
  UserRole,
  ProviderType,
  GeographicLevel,
  ConfidenceLabel,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  process.stdout.write('Seeding SAATHI DEMO data...\n');

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const learnerPinHash = await bcrypt.hash('1234', 10);
  const parentPinHash = await bcrypt.hash('5678', 10);

  // 1. Create Demo Users across all 4 roles
  const learner = await prisma.user.upsert({
    where: { email: 'learner@saathi.demo' },
    update: {},
    create: {
      name: 'Rohan Sharma (DEMO Learner)',
      email: 'learner@saathi.demo',
      phone: '9876543210',
      role: UserRole.LEARNER,
      passwordHash: defaultPasswordHash,
      pinHash: learnerPinHash,
      language: 'hi',
      isMinor: true,
      parentConsentGiven: true,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@saathi.demo' },
    update: {},
    create: {
      name: 'Manoj Sharma (DEMO Parent)',
      email: 'parent@saathi.demo',
      phone: '9876543211',
      role: UserRole.PARENT,
      passwordHash: defaultPasswordHash,
      pinHash: parentPinHash,
      language: 'hi',
      isMinor: false,
      parentConsentGiven: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'counsellor@saathi.demo' },
    update: {},
    create: {
      name: 'Dr. Priya Varma (DEMO Counsellor)',
      email: 'counsellor@saathi.demo',
      phone: '9876543212',
      role: UserRole.COUNSELLOR,
      passwordHash: defaultPasswordHash,
      language: 'en',
      isMinor: false,
      parentConsentGiven: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@saathi.demo' },
    update: {},
    create: {
      name: 'System Admin (DEMO Admin)',
      email: 'admin@saathi.demo',
      phone: '9876543213',
      role: UserRole.ADMINISTRATOR,
      passwordHash: defaultPasswordHash,
      language: 'en',
      isMinor: false,
      parentConsentGiven: true,
    },
  });

  // 2. Demo Household linking learner and parent
  const existingHousehold = await prisma.household.findFirst({
    where: { name: 'Sharma Household (DEMO)' },
  });

  if (!existingHousehold) {
    await prisma.household.create({
      data: {
        name: 'Sharma Household (DEMO)',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        block: 'Kashi Vidyapeeth',
        incomeBand: '1_5L_TO_3L',
        learnerClassLevel: 'CLASS_10_PASS',
        members: {
          connect: [{ id: learner.id }, { id: parent.id }],
        },
        rooms: {
          create: [
            { type: 'STUDENT_WINDOW', status: 'ACTIVE' },
            { type: 'PARENT_WINDOW', status: 'ACTIVE' },
            { type: 'JOINT_ROOM', status: 'ACTIVE' },
          ],
        },
      },
    });
  }

  // 3. Seed 4 Core Vocational Trades
  const tradeElectrician = await prisma.trade.upsert({
    where: { code: 'ELECTRICIAN' },
    update: {},
    create: {
      code: 'ELECTRICIAN',
      titleEn: 'Electrician (Power & Home Electrical)',
      titleHi: 'इलेक्ट्रीशियन (पावर और घरेलू वायरिंग)',
      sector: 'Power, Energy & Electrical',
      descriptionEn:
        'Hands-on technical trade covering domestic wiring, industrial switchgear, motor repair, and transformer maintenance with immediate job stability.',
      descriptionHi:
        'घरेलू वायरिंग, औद्योगिक स्विचगियर, मोटर मरम्मत और ट्रांसफार्मर रखरखाव को कवर करने वाला व्यावहारिक तकनीकी ट्रेड, जो तत्काल रोजगार स्थिरता प्रदान करता है।',
      nsqfLevel: 4,
      durationMonths: 24,
      minEducation: 'Class 10 Pass (Science & Math preferred)',
      entryStep: 'CTS Level 4 Certificate',
    },
  });

  const tradeSolarTech = await prisma.trade.upsert({
    where: { code: 'SOLAR_TECH' },
    update: {},
    create: {
      code: 'SOLAR_TECH',
      titleEn: 'Solar PV Installation Technician',
      titleHi: 'सोलर पीवी इंस्टॉलेशन तकनीशियन',
      sector: 'Green Energy & Renewables',
      descriptionEn:
        'Rapidly expanding trade in solar rooftop installation, grid-tied inverter wiring, solar irrigation pumps, and annual maintenance contracts.',
      descriptionHi:
        'सोलर रूफटॉप इंस्टॉलेशन, ग्रिड-टाइड इन्वर्टर वायरिंग, सोलर सिंचाई पंप और वार्षिक रखरखाव अनुबंधों में तेजी से बढ़ता रोजगारपरक ट्रेड।',
      nsqfLevel: 4,
      durationMonths: 12,
      minEducation: 'Class 10 Pass',
      entryStep: 'Surya Mitra NSQF Level 4',
    },
  });

  const tradeGda = await prisma.trade.upsert({
    where: { code: 'GDA' },
    update: {},
    create: {
      code: 'GDA',
      titleEn: 'General Duty Healthcare Assistant',
      titleHi: 'जनरल ड्यूटी स्वास्थ्य सहायक',
      sector: 'Healthcare & Paramedical',
      descriptionEn:
        'Essential healthcare support role providing patient bedside care, vitals monitoring, medication support, and hospital ward coordination.',
      descriptionHi:
        'मरीजों की बेडसाइड देखभाल, महत्वपूर्ण संकेतों की निगरानी, दवा सहायता और अस्पताल वार्ड समन्वय प्रदान करने वाली आवश्यक स्वास्थ्य सेवा भूमिका।',
      nsqfLevel: 4,
      durationMonths: 12,
      minEducation: 'Class 10 Pass',
      entryStep: 'Healthcare SSC GDA Level 4',
    },
  });

  const tradeCnc = await prisma.trade.upsert({
    where: { code: 'CNC_OPERATOR' },
    update: {},
    create: {
      code: 'CNC_OPERATOR',
      titleEn: 'CNC Turning & Milling Operator',
      titleHi: 'सीएनसी टर्निंग और मिलिंग ऑपरेटर',
      sector: 'Capital Goods & Precision Manufacturing',
      descriptionEn:
        'High-precision computerized manufacturing trade operating multi-axis CNC machines for automotive parts, railways, and industrial tools.',
      descriptionHi:
        'ऑटोमोटिव पुर्जों, रेलवे और औद्योगिक उपकरणों के लिए बहु-अक्षीय सीएनसी मशीनों को संचालित करने वाला उच्च-सटीक विनिर्माण ट्रेड।',
      nsqfLevel: 4,
      durationMonths: 12,
      minEducation: 'Class 10 Pass (or Class 12)',
      entryStep: 'Machinist / Turner CTS Level 4',
    },
  });

  // 4. Seed Training Providers in Varanasi, UP
  const providerGovtKaraundi = await prisma.provider.upsert({
    where: { id: 'prov-govt-karaundi' },
    update: {},
    create: {
      id: 'prov-govt-karaundi',
      name: 'Government ITI Karaundi, Varanasi',
      type: ProviderType.GOVERNMENT_ITI,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      address: 'Karaundi, BHU Road, Varanasi, UP - 221005',
      contactEmail: 'iti.karaundi@up.gov.in',
      contactPhone: '0542-2570142',
      affiliation: 'NCVT / DGET Government of India',
    },
  });

  const providerGovtChauka = await prisma.provider.upsert({
    where: { id: 'prov-govt-chaukaghat' },
    update: {},
    create: {
      id: 'prov-govt-chaukaghat',
      name: 'Government ITI Chauka Ghat, Varanasi',
      type: ProviderType.GOVERNMENT_ITI,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Harahua',
      address: 'Near Old Bus Stand, Chauka Ghat, Varanasi, UP - 221002',
      contactEmail: 'iti.chaukaghat@up.gov.in',
      contactPhone: '0542-2204198',
      affiliation: 'NCVT / SCVT Government of Uttar Pradesh',
    },
  });

  const providerPolytechnic = await prisma.provider.upsert({
    where: { id: 'prov-varanasi-poly' },
    update: {},
    create: {
      id: 'prov-varanasi-poly',
      name: 'Mahamana Malaviya Vocational Polytechnic',
      type: ProviderType.POLYTECHNIC,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Pindra',
      address: 'Airport Highway, Pindra, Varanasi, UP - 221206',
      contactEmail: 'admissions@mmvpoly.edu.in',
      contactPhone: '0542-2621045',
      affiliation: 'Board of Technical Education Uttar Pradesh (BTEUP)',
    },
  });

  const providerSkillCentre = await prisma.provider.upsert({
    where: { id: 'prov-kashi-skill' },
    update: {},
    create: {
      id: 'prov-kashi-skill',
      name: 'Kashi Kaushal Vikas Kendra (Skill Centre)',
      type: ProviderType.VOCATIONAL_TRAINING_CENTRE,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Sevapuri',
      address: 'Sevapuri Rural Development Hub, Varanasi, UP - 221403',
      contactEmail: 'contact@kashikaushal.org',
      contactPhone: '0542-2688400',
      affiliation: 'National Skill Development Corporation (NSDC)',
    },
  });

  // 5. Seed Courses
  const coursesData = [
    {
      id: 'crs-elec-karaundi',
      tradeId: tradeElectrician.id,
      providerId: providerGovtKaraundi.id,
      titleEn: 'CTS Electrician (2-Year Full-Time Certificate)',
      titleHi: 'सीटीएस इलेक्ट्रीशियन (2-वर्षीय पूर्णकालिक प्रमाणपत्र)',
      feeInr: 480, // Subsidized govt fee
      stipendMonthlyInr: 2500, // NAPS apprenticeship stipend
      durationMonths: 24,
      videoUrl1: 'https://www.youtube-nocookie.com/embed/demo-electrician-lab',
      videoUrl2: 'https://www.youtube-nocookie.com/embed/demo-electrician-alumni',
    },
    {
      id: 'crs-elec-chauka',
      tradeId: tradeElectrician.id,
      providerId: providerGovtChauka.id,
      titleEn: 'CTS Electrician (Industrial Power Systems)',
      titleHi: 'सीटीएस इलेक्ट्रीशियन (औद्योगिक विद्युत प्रणाली)',
      feeInr: 480,
      stipendMonthlyInr: 2500,
      durationMonths: 24,
      videoUrl1: 'https://www.youtube-nocookie.com/embed/demo-electrician-lab',
      videoUrl2: 'https://www.youtube-nocookie.com/embed/demo-electrician-career',
    },
    {
      id: 'crs-solar-kashi',
      tradeId: tradeSolarTech.id,
      providerId: providerSkillCentre.id,
      titleEn: 'Surya Mitra Solar PV Rooftop Technician',
      titleHi: 'सूर्य मित्र सोलर पीवी रूफटॉप तकनीशियन',
      feeInr: 0, // Free scheme
      stipendMonthlyInr: 2000,
      durationMonths: 12,
      videoUrl1: 'https://www.youtube-nocookie.com/embed/demo-solar-practical',
      videoUrl2: 'https://www.youtube-nocookie.com/embed/demo-solar-site',
    },
    {
      id: 'crs-gda-karaundi',
      tradeId: tradeGda.id,
      providerId: providerGovtKaraundi.id,
      titleEn: 'General Duty Assistant (Hospital Patient Care)',
      titleHi: 'जनरल ड्यूटी सहायक (अस्पताल रोगी देखभाल)',
      feeInr: 360,
      stipendMonthlyInr: 2200,
      durationMonths: 12,
      videoUrl1: 'https://www.youtube-nocookie.com/embed/demo-gda-hospital',
      videoUrl2: 'https://www.youtube-nocookie.com/embed/demo-gda-skills',
    },
    {
      id: 'crs-cnc-poly',
      tradeId: tradeCnc.id,
      providerId: providerPolytechnic.id,
      titleEn: 'Precision CNC Machining & CAD/CAM Programming',
      titleHi: 'प्रिसिजन सीएनसी मशीनिंग और सीएडी/सीएएम प्रोग्रामिंग',
      feeInr: 16500,
      stipendMonthlyInr: 3000,
      durationMonths: 12,
      videoUrl1: 'https://www.youtube-nocookie.com/embed/demo-cnc-workshop',
      videoUrl2: 'https://www.youtube-nocookie.com/embed/demo-cnc-placement',
    },
  ];

  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }

  // 6. Seed Verified Outcome Records across Fallback Ladder Levels
  // CONSTRAINT: Only MEDIAN and RANGE values are recorded. NO AVERAGES.
  const outcomeRecords = [
    // --- Electrician in Varanasi (Block, District, State, National) ---
    {
      id: 'out-elec-pindra',
      tradeId: tradeElectrician.id,
      geographicLevel: GeographicLevel.BLOCK,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Pindra',
      verifiedGraduatesCount: 68,
      medianSalaryMonthly: 18500,
      salaryRangeMin: 14000,
      salaryRangeMax: 24500,
      placementRatePercent: 86.8,
      sampleSize: 114,
      sources: ['UP Kaushal Vikas Mission (UPSDM) 2025', 'NCVT MIS Alumni Survey'],
      dataDate: new Date('2025-12-01'),
      confidenceLabel: ConfidenceLabel.HIGH,
    },
    {
      id: 'out-elec-kashi',
      tradeId: tradeElectrician.id,
      geographicLevel: GeographicLevel.BLOCK,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      verifiedGraduatesCount: 82,
      medianSalaryMonthly: 19000,
      salaryRangeMin: 15000,
      salaryRangeMax: 26000,
      placementRatePercent: 88.5,
      sampleSize: 130,
      sources: ['NCVT MIS Verified Records 2025', 'Karaundi ITI Placement Cell'],
      dataDate: new Date('2025-11-15'),
      confidenceLabel: ConfidenceLabel.HIGH,
    },
    {
      id: 'out-elec-sevapuri',
      tradeId: tradeElectrician.id,
      geographicLevel: GeographicLevel.BLOCK,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Sevapuri',
      verifiedGraduatesCount: 38,
      medianSalaryMonthly: 17500,
      salaryRangeMin: 13500,
      salaryRangeMax: 22000,
      placementRatePercent: 82.0,
      sampleSize: 65,
      sources: ['UPSDM Block Survey 2025'],
      dataDate: new Date('2025-10-20'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },
    {
      id: 'out-elec-dist',
      tradeId: tradeElectrician.id,
      geographicLevel: GeographicLevel.DISTRICT,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: null,
      verifiedGraduatesCount: 245,
      medianSalaryMonthly: 18800,
      salaryRangeMin: 14000,
      salaryRangeMax: 25000,
      placementRatePercent: 87.2,
      sampleSize: 380,
      sources: ['Varanasi District Skill Committee (DSC) Annual Audit 2025'],
      dataDate: new Date('2025-12-15'),
      confidenceLabel: ConfidenceLabel.HIGH,
    },
    {
      id: 'out-elec-state',
      tradeId: tradeElectrician.id,
      geographicLevel: GeographicLevel.STATE,
      state: 'Uttar Pradesh',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 3120,
      medianSalaryMonthly: 18200,
      salaryRangeMin: 13500,
      salaryRangeMax: 26000,
      placementRatePercent: 85.0,
      sampleSize: 4500,
      sources: ['Directorate of Training and Employment Uttar Pradesh 2025'],
      dataDate: new Date('2025-09-30'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },

    // --- Solar Tech (Has small block sample in Harahua (<30) to demonstrate Fallback to District) ---
    {
      id: 'out-solar-harahua',
      tradeId: tradeSolarTech.id,
      geographicLevel: GeographicLevel.BLOCK,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Harahua',
      verifiedGraduatesCount: 12,
      medianSalaryMonthly: 19000,
      salaryRangeMin: 15000,
      salaryRangeMax: 23000,
      placementRatePercent: 83.3,
      sampleSize: 18, // < 30 => insufficient, triggers fallback to district!
      sources: ['Harahua Local Training Pilot 2025'],
      dataDate: new Date('2025-08-10'),
      confidenceLabel: ConfidenceLabel.LOW,
    },
    {
      id: 'out-solar-dist',
      tradeId: tradeSolarTech.id,
      geographicLevel: GeographicLevel.DISTRICT,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: null,
      verifiedGraduatesCount: 94,
      medianSalaryMonthly: 19500,
      salaryRangeMin: 15500,
      salaryRangeMax: 27500,
      placementRatePercent: 84.8,
      sampleSize: 142,
      sources: ['UPNEDA Rooftop Solar Installer Verification 2025', 'NSDC Portal'],
      dataDate: new Date('2025-11-01'),
      confidenceLabel: ConfidenceLabel.HIGH,
    },
    {
      id: 'out-solar-state',
      tradeId: tradeSolarTech.id,
      geographicLevel: GeographicLevel.STATE,
      state: 'Uttar Pradesh',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 880,
      medianSalaryMonthly: 19000,
      salaryRangeMin: 15000,
      salaryRangeMax: 28000,
      placementRatePercent: 83.5,
      sampleSize: 1250,
      sources: ['UP New and Renewable Energy Development Agency (UPNEDA) 2025'],
      dataDate: new Date('2025-10-15'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },

    // --- GDA (Has State Level Benchmark to demonstrate Fallback when District has no survey) ---
    {
      id: 'out-gda-state',
      tradeId: tradeGda.id,
      geographicLevel: GeographicLevel.STATE,
      state: 'Uttar Pradesh',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 1450,
      medianSalaryMonthly: 17000,
      salaryRangeMin: 13000,
      salaryRangeMax: 23000,
      placementRatePercent: 81.2,
      sampleSize: 2100,
      sources: ['Healthcare Sector Skill Council (HSSC) State Tracer Study 2025'],
      dataDate: new Date('2025-10-01'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },
    {
      id: 'out-gda-national',
      tradeId: tradeGda.id,
      geographicLevel: GeographicLevel.NATIONAL,
      state: 'National',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 12500,
      medianSalaryMonthly: 17500,
      salaryRangeMin: 13500,
      salaryRangeMax: 24000,
      placementRatePercent: 82.5,
      sampleSize: 18000,
      sources: ['National Skill Development Corporation (NSDC) Verified Tracer Study'],
      dataDate: new Date('2025-06-30'),
      confidenceLabel: ConfidenceLabel.LOW,
    },

    // --- CNC Operator (Has District, State, and National benchmarks) ---
    {
      id: 'out-cnc-dist',
      tradeId: tradeCnc.id,
      geographicLevel: GeographicLevel.DISTRICT,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: null,
      verifiedGraduatesCount: 56,
      medianSalaryMonthly: 21000,
      salaryRangeMin: 16500,
      salaryRangeMax: 29000,
      placementRatePercent: 87.5,
      sampleSize: 92,
      sources: ['Varanasi Industrial Area Association & DGET Tracer 2025'],
      dataDate: new Date('2025-11-20'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },
    {
      id: 'out-cnc-state',
      tradeId: tradeCnc.id,
      geographicLevel: GeographicLevel.STATE,
      state: 'Uttar Pradesh',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 1820,
      medianSalaryMonthly: 22000,
      salaryRangeMin: 17000,
      salaryRangeMax: 31000,
      placementRatePercent: 88.8,
      sampleSize: 2400,
      sources: ['Capital Goods Skill Council (CGSC) UP State Report 2025'],
      dataDate: new Date('2025-09-15'),
      confidenceLabel: ConfidenceLabel.MEDIUM,
    },
    {
      id: 'out-cnc-national',
      tradeId: tradeCnc.id,
      geographicLevel: GeographicLevel.NATIONAL,
      state: 'National',
      district: 'All',
      block: null,
      verifiedGraduatesCount: 14800,
      medianSalaryMonthly: 23500,
      salaryRangeMin: 18000,
      salaryRangeMax: 34000,
      placementRatePercent: 90.2,
      sampleSize: 19500,
      sources: ['Ministry of Skill Development & Entrepreneurship (MSDE) National Data'],
      dataDate: new Date('2025-07-01'),
      confidenceLabel: ConfidenceLabel.LOW,
    },
  ];

  for (const record of outcomeRecords) {
    await prisma.outcomeRecord.upsert({
      where: { id: record.id },
      update: {},
      create: record,
    });
  }

  process.stdout.write(
    `Seeded 4 trades, 4 providers, courses, and verified outcomes successfully.\n`,
  );
  process.stdout.write('Seed completed successfully with DEMO accounts and verified data.\n');
}

main()
  .catch((e) => {
    process.stderr.write(`Seed failed: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
