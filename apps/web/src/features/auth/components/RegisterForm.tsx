import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput, type UserProfile } from '@saathi/shared';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button.js';
import { Input } from '../../../components/ui/Input.js';
import { apiClient, ApiClientError } from '../../../lib/apiClient.js';
import { useSessionStore } from '../../../stores/session.store.js';

interface RegisterFormProps {
  onSuccess: (user: UserProfile) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const setUser = useSessionStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'LEARNER',
      language: 'en',
      isMinor: false,
      parentConsentGiven: false,
    },
  });

  const selectedRole = watch('role');
  const isMinor = watch('isMinor');

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ user: UserProfile }>('/auth/register', data);
      setUser(response.data.user);
      onSuccess(response.data.user);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during registration.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
      {serverError && (
        <div
          role="alert"
          className="p-3.5 text-sm rounded-[8px] bg-[#FDF2F0] text-[#8E241B] border border-[#B83226]/30 dark:bg-[#2E1C1A] dark:text-[#F8B3AC] dark:border-[#E56658]/40"
        >
          {serverError}
        </div>
      )}

      {/* Role Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]">
          I am registering as:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('role', 'LEARNER', { shouldValidate: true })}
            className={`flex items-center justify-between p-3.5 rounded-[8px] border transition-all text-left ${
              selectedRole === 'LEARNER'
                ? 'border-[#EFA531] bg-[#FDF4E5] dark:bg-[#342817] text-[#915B06] dark:text-[#F8C26E] ring-2 ring-[#EFA531]'
                : 'border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] text-[#6A5B55] dark:text-[#B8AAA3]'
            }`}
          >
            <div>
              <div className="font-bold text-sm">Learner / Student</div>
              <div className="text-xs opacity-80">Looking for trade training</div>
            </div>
            {selectedRole === 'LEARNER' && <Check className="w-5 h-5 text-[#EFA531]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setValue('role', 'PARENT', { shouldValidate: true });
              setValue('isMinor', false);
              setValue('parentConsentGiven', true);
            }}
            className={`flex items-center justify-between p-3.5 rounded-[8px] border transition-all text-left ${
              selectedRole === 'PARENT'
                ? 'border-[#2F7D5C] bg-[#EBF4F0] dark:bg-[#1B2F25] text-[#1E573F] dark:text-[#50AF85] ring-2 ring-[#2F7D5C]'
                : 'border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] text-[#6A5B55] dark:text-[#B8AAA3]'
            }`}
          >
            <div>
              <div className="font-bold text-sm">Parent / Guardian</div>
              <div className="text-xs opacity-80">Guiding family choice</div>
            </div>
            {selectedRole === 'PARENT' && <Check className="w-5 h-5 text-[#2F7D5C]" />}
          </button>
        </div>
      </div>

      <Input
        label="Full name"
        placeholder="e.g. Ramesh Kumar"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="e.g. ramesh@example.com"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Mobile number (optional)"
        type="tel"
        placeholder="e.g. 9876543210"
        leftIcon={<Phone className="w-4 h-4" />}
        error={errors.phone?.message}
        helperText="Used for SMS Decision Card summaries if internet is lost"
        {...register('phone')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      {/* Language Preference */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]">
          Preferred Interface Language
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-[#E8DDD2] dark:border-[#3D3430] bg-white dark:bg-[#1F1A17] cursor-pointer">
            <input type="radio" value="en" {...register('language')} className="text-[#C4562B]" />
            <span className="text-sm font-medium">English</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-[8px] border border-[#E8DDD2] dark:border-[#3D3430] bg-white dark:bg-[#1F1A17] cursor-pointer">
            <input type="radio" value="hi" {...register('language')} className="text-[#C4562B]" />
            <span className="text-sm font-medium">हिन्दी (Hindi)</span>
          </label>
        </div>
      </div>

      {/* Minor & Parent Consent Section for Learners */}
      {selectedRole === 'LEARNER' && (
        <div className="p-4 rounded-[8px] border border-[#E8DDD2] bg-[#FFFDF9] dark:bg-[#2A2320] dark:border-[#3D3430] flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[#E8DDD2] text-[#C4562B] focus:ring-[#C4562B]"
              {...register('isMinor')}
            />
            <div className="text-sm">
              <span className="font-semibold text-[#3A2E2A] dark:text-[#F5EFEB]">
                The learner is under 18 years of age (minor)
              </span>
              <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5">
                Indian vocational counselling ethics require verified parental consent for minors.
              </p>
            </div>
          </label>

          {isMinor && (
            <div className="pt-3 border-t border-[#E8DDD2] dark:border-[#3D3430] flex flex-col gap-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-[#E8DDD2] text-[#2F7D5C] focus:ring-[#2F7D5C]"
                  {...register('parentConsentGiven')}
                />
                <div className="text-sm">
                  <span className="font-semibold text-[#2F7D5C] dark:text-[#50AF85] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Parent / Guardian Consent Acknowledged
                  </span>
                  <p className="text-xs text-[#6A5B55] dark:text-[#B8AAA3] mt-0.5">
                    I confirm that a parent or legal guardian has approved the registration and will
                    participate in the joint family counselling room.
                  </p>
                </div>
              </label>
              {errors.parentConsentGiven && (
                <span className="text-xs font-semibold text-[#B83226] dark:text-[#E56658]">
                  {errors.parentConsentGiven.message}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        className="w-full mt-2"
      >
        Complete Registration
      </Button>
    </form>
  );
};
