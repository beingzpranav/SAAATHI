import { prisma } from '../../lib/prisma.js';
import { GeographicLevel } from '@prisma/client';

class TradeRepository {
  async findAll(filters?: { minEducation?: string; sector?: string }) {
    const where: Record<string, unknown> = {};

    if (filters?.minEducation) {
      where.minEducation = filters.minEducation;
    }

    if (filters?.sector) {
      where.sector = filters.sector;
    }

    return prisma.trade.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    return prisma.trade.findUnique({
      where: { code },
      include: {
        courses: {
          include: {
            provider: true,
          },
        },
      },
    });
  }

  async findOutcomeByLevel(
    tradeId: string,
    level: GeographicLevel,
    state: string,
    district?: string,
    block?: string,
  ) {
    const where: Record<string, unknown> = {
      tradeId,
      geographicLevel: level,
    };

    if (level === GeographicLevel.BLOCK) {
      where.state = state;
      if (district) where.district = district;
      if (block) where.block = block;
    } else if (level === GeographicLevel.DISTRICT) {
      where.state = state;
      if (district) where.district = district;
    } else if (level === GeographicLevel.STATE) {
      where.state = state;
    }

    return prisma.outcomeRecord.findFirst({
      where,
      orderBy: [{ sampleSize: 'desc' }, { dataDate: 'desc' }],
    });
  }

  async findApprovedProviders(tradeId: string) {
    const courses = await prisma.course.findMany({
      where: { tradeId },
      include: { provider: true },
    });

    const uniqueProviders = new Map();
    for (const c of courses) {
      if (!uniqueProviders.has(c.provider.id)) {
        uniqueProviders.set(c.provider.id, c.provider);
      }
    }

    return Array.from(uniqueProviders.values());
  }
}

export const tradeRepository = new TradeRepository();
