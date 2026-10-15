import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, BadRequestError } from '../../lib/errors.js';
import type { PinVerifyResponse } from '@saathi/shared';

class RoomService {
  async setPin(userId: string, pin: string): Promise<{ success: boolean; message: string }> {
    if (!pin || pin.length < 4) {
      throw new BadRequestError('PIN must be at least 4 digits or pattern steps');
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
      },
    });

    return { success: true, message: 'PIN set successfully.' };
  }

  async verifyPin(userId: string, pin: string): Promise<PinVerifyResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        pinHash: true,
        pinFailedAttempts: true,
        pinLockedUntil: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const now = new Date();

    // 1. Check if room is currently locked out
    if (user.pinLockedUntil && user.pinLockedUntil > now) {
      const minutesRemaining = Math.ceil(
        (user.pinLockedUntil.getTime() - now.getTime()) / (60 * 1000),
      );
      return {
        unlocked: false,
        remainingAttempts: 0,
        lockedUntil: user.pinLockedUntil.toISOString(),
        message: `PIN room is temporarily locked due to 3 failed attempts. Please try again in ${minutesRemaining} minutes.`,
      };
    }

    // 2. If user has not set a PIN yet, allow initial demo access or prompt setup
    if (!user.pinHash) {
      return {
        unlocked: true,
        message: 'No PIN set yet. Access granted for initial configuration.',
      };
    }

    // 3. Verify PIN against bcrypt hash
    const isValid = await bcrypt.compare(pin, user.pinHash);

    if (isValid) {
      // Reset failed attempts on success
      if (user.pinFailedAttempts > 0 || user.pinLockedUntil) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            pinFailedAttempts: 0,
            pinLockedUntil: null,
          },
        });
      }

      return {
        unlocked: true,
        message: 'PIN verified successfully.',
      };
    }

    // 4. Handle failed attempt
    const newFailedAttempts = user.pinFailedAttempts + 1;
    const shouldLock = newFailedAttempts >= 3;
    const lockedUntil = shouldLock ? new Date(now.getTime() + 15 * 60 * 1000) : null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        pinFailedAttempts: shouldLock ? 3 : newFailedAttempts,
        pinLockedUntil: lockedUntil,
      },
    });

    if (shouldLock) {
      return {
        unlocked: false,
        remainingAttempts: 0,
        lockedUntil: lockedUntil?.toISOString(),
        message: 'Security lockout: 3 failed attempts reached. Room locked for 15 minutes.',
      };
    }

    return {
      unlocked: false,
      remainingAttempts: 3 - newFailedAttempts,
      lockedUntil: null,
      message: `Incorrect PIN. ${3 - newFailedAttempts} attempt(s) remaining before a 15-minute lockout.`,
    };
  }

  async getRoomStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        householdId: true,
        role: true,
        pinHash: true,
        pinLockedUntil: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isLocked = Boolean(user.pinLockedUntil && user.pinLockedUntil > new Date());

    return {
      hasPinSet: Boolean(user.pinHash),
      isLocked,
      lockedUntil: isLocked ? user.pinLockedUntil?.toISOString() : null,
      role: user.role,
      householdId: user.householdId,
    };
  }
}

export const roomService = new RoomService();
