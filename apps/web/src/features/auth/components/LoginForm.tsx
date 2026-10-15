import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, type UserProfile } from '@saathi/shared';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button.js';
import { Input } from '../../../components/ui/Input.js';
import { Badge } from '../../../components/ui/Badge.js';
import { apiClient, ApiClientError } from '../../../lib/apiClient.js';
import { useSessionStore } from '../../../stores/session.store.js';

interface LoginFormProps {
  onSuccess: (user: UserProfile) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const setUser = useSessionStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ user: UserProfile }>('/auth/login', data);
      setUser(response.data.user);
      onSuccess(response.data.user);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while logging in.');
      }
    }
  };

  const fillDemoAccount = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
    setServerError(null);
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

      <Input
        label="Email address"
        type="email"
        placeholder="e.g. learner@saathi.demo"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        rightIcon={<ArrowRight className="w-5 h-5" />}
        className="w-full mt-2"
      >
        Sign in to SAATHI
      </Button>

      {/* Demo Credentials Helper */}
      <div className="pt-4 border-t border-[#E8DDD2] dark:border-[#3D3430] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#6A5B55] dark:text-[#B8AAA3]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D5C]" aria-hidden="true" />
            <span>Fast-Login Demo Accounts</span>
          </span>
          <Badge variant="demo" size="sm">
            DEMO
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="student"
            size="sm"
            onClick={() => fillDemoAccount('learner@saathi.demo')}
          >
            Learner (Rohan)
          </Button>
          <Button
            type="button"
            variant="parent"
            size="sm"
            onClick={() => fillDemoAccount('parent@saathi.demo')}
          >
            Parent (Manoj)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillDemoAccount('counsellor@saathi.demo')}
          >
            Counsellor
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fillDemoAccount('admin@saathi.demo')}
          >
            Administrator
          </Button>
        </div>
      </div>
    </form>
  );
};
