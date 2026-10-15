import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md p-8 rounded-[12px] border border-[#E8DDD2] bg-white dark:bg-[#1F1A17] dark:border-[#3D3430] shadow-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-[8px] bg-[#C4562B] text-white flex items-center justify-center shadow-sm">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#3A2E2A] dark:text-[#F5EFEB]">
            Sign in to SAATHI
          </h1>
          <p className="text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
            Access your private learner, parent, or joint counselling space
          </p>
        </div>

        <LoginForm onSuccess={() => navigate(from, { replace: true })} />

        <div className="text-center text-sm text-[#6A5B55] dark:text-[#B8AAA3]">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#C4562B] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4562B] rounded-[4px] p-0.5"
          >
            Register family
          </Link>
        </div>
      </div>
    </div>
  );
};
