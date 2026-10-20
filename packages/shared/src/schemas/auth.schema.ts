import { z } from 'zod';

export const userRoleSchema = z.enum(['LEARNER', 'PARENT', 'COUNSELLOR', 'ADMINISTRATOR']);

export const supportedLanguageSchema = z.enum([
  'en',
  'hi',
  'bn',
  'ta',
  'te',
  'mr',
  'gu',
  'kn',
  'ml',
]);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Please enter a valid email address'),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
      .optional()
      .or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: userRoleSchema,
    language: supportedLanguageSchema.default('en'),
    isMinor: z.boolean().default(false),
    parentConsentGiven: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.isMinor && !data.parentConsentGiven) {
        return false;
      }
      return true;
    },
    {
      message: 'Parental consent is mandatory for learners under 18 years of age',
      path: ['parentConsentGiven'],
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be between 4 and 6 numeric digits'),
});

export type PinInput = z.infer<typeof pinSchema>;
