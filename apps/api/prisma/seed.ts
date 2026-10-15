import { PrismaClient, UserRole } from '@prisma/client';
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
  const household = await prisma.household.create({
    data: {
      name: 'Sharma Household (DEMO)',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      block: 'Kashi Vidyapeeth',
      incomeBand: '1_5L_TO_3L',
      learnerClassLevel: 'CLASS_10',
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

  process.stdout.write(`Seeded demo household: ${household.name}\n`);
  process.stdout.write('Seed completed successfully with DEMO accounts.\n');
}

main()
  .catch((e) => {
    process.stderr.write(`Seed failed: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
