import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { RegisterForm } from '../features/auth/components/RegisterForm.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-lg p-8 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] shadow-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-[8px] bg-[#C4562B] text-white flex items-center justify-center shadow-sm">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#3A2E2A] dark:text-[#F5EFEB]">
            Register with SAATHI
          </h1>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
            Start family vocational counselling backed by verified local data
          </p>
        </div>

        <RegisterForm onSuccess={() => navigate('/dashboard', { replace: true })} />

        <div className="text-center text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#C4562B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] rounded-[4px] p-0.5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
