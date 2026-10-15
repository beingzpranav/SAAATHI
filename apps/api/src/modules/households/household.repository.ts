import { prisma } from '../../lib/prisma.js';
import type { HouseholdIntakeInput } from '@saathi/shared';
import { RoomType } from '@prisma/client';

class HouseholdRepository {
  async findById(id: string) {
    return prisma.household.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        rooms: true,
      },
    });
  }

  async findByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (!user?.householdId) {
      return null;
    }

    return this.findById(user.householdId);
  }

  async saveIntake(userId: string, input: HouseholdIntakeInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { householdId: true },
    });

    if (user?.householdId) {
      // Update existing household
      return prisma.household.update({
        where: { id: user.householdId },
        data: {
          name: input.name,
          state: input.state,
          district: input.district,
          block: input.block,
          incomeBand: input.incomeBand,
          learnerClassLevel: input.learnerClassLevel,
        },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          rooms: true,
        },
      });
    }

    // Create new household with default rooms and associate the user
    return prisma.$transaction(async (tx) => {
      const household = await tx.household.create({
        data: {
          name: input.name,
          state: input.state,
          district: input.district,
          block: input.block,
          incomeBand: input.incomeBand,
          learnerClassLevel: input.learnerClassLevel,
          rooms: {
            create: [
              { type: RoomType.STUDENT_WINDOW },
              { type: RoomType.PARENT_WINDOW },
              { type: RoomType.JOINT_ROOM },
            ],
          },
        },
        include: {
          rooms: true,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { householdId: household.id },
      });

      return tx.household.findUniqueOrThrow({
        where: { id: household.id },
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          rooms: true,
        },
      });
    });
  }
}

export const householdRepository = new HouseholdRepository();
